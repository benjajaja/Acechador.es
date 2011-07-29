var click = function(e) {
	vote($(this).parent(), $(this).hasClass('up'));
};

var vote = function(el, isUp) {
	var up = $(el).find('.up').first(),
		down = $(el).find('.down').first(),
		count = $(el).find('.count').first();
	if (isUp) {
		up.addClass('voted');
		down.removeClass('voted');
	} else {
		up.removeClass('voted');
		down.addClass('voted');
	}
	jQuery.ajax({
		type: 'POST',
		url: '/xhr/vote',
		data: {
			link: el.attr('data-link'),
			vote: isUp ? 1 : -1
		},
		success: function(data) {
			count.text(data.total);
			if (data.set !== true) {
				up.removeClass('voted');
				down.removeClass('voted');
			}
		},
		error: function(xhr, status, err) {
			if (xhr && xhr.status == 500) {
				try {
					Dialog.show(jQuery.parseJSON(xhr.responseText).dialog, el.parent());
				} catch (e) {
					alert('Error interno');
				}
			} else {
				alert('Error interno');
			}
			up.removeClass('voted');
			down.removeClass('voted');
		}
	});
};

var Votes = {
	load: function() {
		$('.votes .up').each(function(i, el) {
			$(el).click(click);
		});
	},

};