var Facebook = {
	addLikeLink: function() {
		$('.fblike').each(function(i, a) {
			var href = $(a).attr('href');
			$(a).click(function(e) {
				e.preventDefault();
				window.open(href, 'fblike', 'width=500,height=350,centerscreen=yes,resizable,toolbar=yes,location=yes,scrollbars=yes,menubar=yes');
			});
		});
	}
};