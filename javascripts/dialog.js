

Dialog = {
	el: null,
	replace: null,
	show: function(dialog, replace, callback) {
		
		
		if (typeof dialog.buttonLabel == "undefined") {
			if (typeof dialog.message == "undefined" && typeof dialog.title == 'undefined') {
				return;
			}
			
			dialog.buttonLabel = "Vale";
			
		}
		
		var el = Skel.fetch("dialog", {dialog: dialog});
		var btn = el.find('a.button');
		if (btn) {
			if (!dialog.action) {
				btn.attr('href', 'javascript:void(0)');
				if (callback) {
					btn.click(callback);
				} else {
					btn.click(function(e) {
						el.fadeOut(0.5, function() {
							el.replaceWith(replace);
						});
					});
				}
			}
		}
		replace.before(el);
		replace.detach();
		
		return {
			close: function() {
				el.fadeOut(0.5);
			},
			clear: function() {
				el.fadeOut(0.5, function() {
					el.replaceWith(replace);
				});
			}
		};
	},
	clear: function() {
		Dialog.el.fadeOut(0.5, function() {
			Dialog.el.replaceWith(Dialog.replace);
			Dialog.el = null;
			Dialog.replace = null;
		});
	},
	close: function() {
		Dialog.el.fadeOut(0.5, function() {
			Dialog.el.remove();
			Dialog.el = null;
		});
		Dialog.replace = null;
	}
};