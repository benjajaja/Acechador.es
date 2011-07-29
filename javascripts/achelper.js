var AcHelper = {
	offset: function(el) {
		try {
			var offset = $(el).offset();
			offset.top += $(document).scrollTop();
			offset.left += $(document).scrollLeft();
			return offset;
		} catch (e) {
			console.log(e);
			return el.offset();
		}		
	},
	
	log: function() {
		if (typeof console != 'undefined') {
			console.log.call(console, arguments);
		}
	}
};