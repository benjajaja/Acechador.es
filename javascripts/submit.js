Submit = {
	form: null,
	attach: function(form, isLoggedin) {
		Submit.form = $(form);
		Submit.form.submit(Submit.submit);
		
		// offer registration
		if (!isLoggedin) {
			LoginOffer.attach($('#login'), Submit.form.find('input[name=submitter]'));
		}
	},
	submit: function(e) {
		e.preventDefault();
		// validate fields
		var empty = false;
		var el = null;
		el = Submit.isEmpty('url');
		if (Submit.form.find('input[name=url]').val().substr(0,7) != 'http://') {
			el = Submit.form.find('input[name=url]');
		}
		if (el) {
			Submit.pointOutEmpty(el);
			empty = true;
		}
		el = Submit.isEmpty('title'); 
		if (el) {
			Submit.pointOutEmpty(el);
			empty = true;
		}
		if (LoginOffer.isOffering()) {
			if (LoginOffer.isRegistration()
					&& Submit.form.find('input[name=password]').val()
						!= Submit.form.find('input[name=password2]').val()) {
				Submit.pointOutEmpty(Submit.form.find('input[name=password2]'));
				empty = true;
			}
		}
		// submit per ajax and cancel form submit
		if (!empty) {
			LoadingHint.show(Submit.form);
			jQuery.ajax({
					url: 'xhr/submit',
					type: 'POST',
					data: Submit.form.serializeArray(),
					dataType: 'json',
					success: Submit.success,
					error: Submit.error
			});
			
		}
		return false;
		// event always prevented
	},
	success: function(data) {
		LoadingHint.hide();
		if (!data) {
			return;
		}
		//try {
			Dialog.show(data, Submit.form, function() {
				window.location = data.link.url;
				
			});
		/*} catch (e) {
			console.log(e, data);
		}*/
	},
	error: function(request, status, e) {
		LoadingHint.hide();
		if (request.status == 500) {
			try {
				Dialog.show(jQuery.parseJSON(request.responseText).dialog, Submit.form);
			} catch (e2) {
				alert('Error interno');
				console.log(request, status, e, e2, parent);
			}
		}
		
	},
	isEmpty: function(name) {
		var el = Submit.form.find('input[name='+name+']');
		if (el.val() == '' || el.val() == el.attr('placeholder')) {
			return el;
		}
		return false;
	},
	pointOutEmpty: function(el) {
		if (el.data('killHint')) {
			return;
		}
		var hint = $(document.createElement('div'));
		hint.html('!');
		hint.addClass('formHint');
		$(document.body).append(hint);
		var pos = el.offset();
		pos.left += el.width() - 17;
		hint.css('top', pos.top);
		hint.css('left', pos.left);
		hint.fadeIn('slow');
		
		// attach killHandler
		el.data('killHint', function() {
			el.unbind('keyup', el.data('killHint'));
			el.unbind('click', el.data('killHint'));
			hint.fadeOut('slow', function() {
				hint.remove();
			});
			el.removeData('killHint');
		});
		el.click(el.data('killHint'));
		el.keyup(el.data('killHint'));
	}
};





