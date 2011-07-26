Bunny = {
	int: null,
	bunny: null,
	load: function() {
		if ($.cookie('bunny') == 1) {
			return;
		}
		
		Bunny.bunny = $('#bunny');
		Bunny.bunny.show();
		$(document).scroll(Bunny.onScroll);
	},
	onScroll: function(e) {
		if (!Bunny.int) {
			Bunny.int = setTimeout(Bunny.checkScroll, 500);
		}
	},
	checkScroll: function() {
		if ($(document).scrollTop() + Bunny.getViewportHeight()
			>= Bunny.bunny.offset().top) {
			Bunny.bunny.fadeOut(1000);
			$.cookie('bunny', 1);
			$(document).unbind('scroll', Bunny.onScroll);
		}
		clearInterval(Bunny.int);
		Bunny.int = null;
	},
	
	getViewportHeight: function() {
        var height = window.innerHeight; // Safari, Opera
        var mode = document.compatMode;

        if ( (mode || !$.support.boxModel) ) { // IE, Gecko
            height = (mode == 'CSS1Compat') ?
            document.documentElement.clientHeight : // Standards
            document.body.clientHeight; // Quirks
        }

        return height;
    }
};