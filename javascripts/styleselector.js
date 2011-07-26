StyleSelector = {
	load: function(value) {
		if (typeof value == 'undefined' || value == null) {
			value = 3;
		}
		StyleSelector.selector = $("#styleselector").slider({
	    	min: 0,
	    	max: 3,
	    	value: value,
	    	change: StyleSelector.set
	    });
		$('#stylelabels a').each(function(i, anchor) {
			$(anchor).click(function(e){
				StyleSelector.selector.slider('value', i);
				e.preventDefault();
				$('#stylelabels a').each(function(j, anchor2) {
					$(anchor2).removeClass('on');
				});
				$(anchor).addClass('on');
			});
		});
	},
	set: function(e, ui) {
		var head = typeof document.head != 'undefined' ? document.head : document.getElementsByTagName('head')[0];
		var links = head.getElementsByTagName("link");
		if (ui.value == 0) {
			var styles = ['null'];
		} else if (ui.value == 1) {
			var styles = ['?weight=0'];
		} else if (ui.value == 2) {
			var styles = ['?weight=0', '?weight=1'];
		} else if (ui.value == 3) {
			var styles = ['?weight=0', '?weight=1', '?weight=2'];
		}
		for (var i = 0; i < links.length; i++ ) {
			if (links[i].getAttribute("rel").indexOf("style")!= -1
					&& links[i].getAttribute("rel")) {
				var isDisabled = true;
				for(var j = 0; j < styles.length; j++) { // may use jquery.inrray()
					if (links[i].getAttribute("href").indexOf(styles[j]) != -1) {
						isDisabled = false;
						break;
					}
				}
				links[i].disabled = isDisabled;
				links[i].media = isDisabled ? 'print' : 'screen';
			}
		}
		$.cookie('styleSelector', ui.value);
		
		//$(document).scrollTo(StyleSelector.selector, 500);
	}
};