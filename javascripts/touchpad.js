Touchpad = {
	load: function() {
		var value = $.cookie('touchPad');
		if (typeof value != 'undefined' && value != null && value == 1) {
			Touchpad.activate();
			$('#touchpad').attr('checked', true);
		}
		
		$('#touchpad').click(function(e) {
			if (this.checked) {
				$.cookie('touchPad', 1);
				Touchpad.activate();
			} else {
				$.cookie('touchPad', 0);
				Touchpad.deActivate();
			}
		});
	},
	activate: function() {
		$('a.link').each(function(i, anchor) {
			$(anchor).attr('target', '_blank');
		});
	},
	deActivate: function() {
		$('a.link').each(function(i, anchor) {
			$(anchor).removeAttr('target');
		});
	}
};