LoadingHint = {
	el: null,
	close: null,
	spinner: null,
	step: null,
	frames: ['○', '&#9684;', '&#9681;', '&#9685;', '&#9679;'],
	currentFrame: -1,
	show: function(replace, callback) {
		if (!LoadingHint.el) {
			LoadingHint.el = $(document.createElement('div'));
			LoadingHint.el.addClass('loadingHint');
			LoadingHint.close = $(document.createElement('div')).addClass('xclose').html('&times;');
			LoadingHint.el.append(LoadingHint.close);
			LoadingHint.close.click(LoadingHint.hide);
			
			LoadingHint.spinner = $(document.createElement('span'));
			LoadingHint.el.append(LoadingHint.spinner);
		} else {
			LoadingHint.hide();
		}
		
		if (callback) {
			LoadingHint.close.click(callback);
		}
		
		var parent = replace.parent();
		LoadingHint.el.width(replace.outerWidth());
		LoadingHint.el.height(replace.outerHeight());
		LoadingHint.el.css('lineHeight', replace.height()+'px');
		LoadingHint.el.offset(AcHelper.offset(replace));

		$(document.body).append(LoadingHint.el);
		LoadingHint.step = setInterval(LoadingHint.animate, 200);
		
	},
	hide: function() {
		clearInterval(LoadingHint.step);
		LoadingHint.step = null;
		LoadingHint.el.remove();
		LoadingHint.currentFrame = -1;
	},
	animate: function() {
		var text;
		LoadingHint.currentFrame++;
		if (LoadingHint.currentFrame >= LoadingHint.frames.length) {
			LoadingHint.currentFrame = 0;
		}
		LoadingHint.spinner.html(LoadingHint.frames[LoadingHint.currentFrame]);
	}
};