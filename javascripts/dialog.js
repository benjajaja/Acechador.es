

Dialog = {
	el: null,
	replace: null,
	show: function(json, replace, callback) {
		if (typeof json.dialog == "undefined" && typeof json.title != "undefined") {
			AcHelper.log('WARNING: deprecated call to Dialog.show; must pass object with "dialog" property!');
			json = {dialog: json};
		}
		if (typeof json.dialog.buttonLabel == "undefined") {
			json.dialog.buttonLabel = "Vale";
		}
		var el = Skel.fetch("dialog", json);
		var btn = el.find('a.button');
		if (btn) {
			if (!json.dialog.action) {
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