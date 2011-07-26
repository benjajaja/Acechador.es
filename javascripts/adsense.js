var Adsense = (function() {
	var o = {
		load: function() {
			$('.ads').each(function(i, el) {
				var classes = $(el).attr('class').split(' ');
				for(var i = 0; i < classes.length; i++) {
					if (classes[i] != 'ads') {
						var name = classes[i].substring(4);//.replace(/^[a-z]/, '');
						name = name.substring(0, 1).toUpperCase()+name.substring(1);
						if (typeof o['loadAd'+name] == 'function') {
							o['loadAd'+name](el);
							return;
						}
					}
				}
				console.log('loadAd'+name+' not found');
			});
		},
		
		loadAdsenseAd: function(el, sript, src) {
			var node = document.createElement('script');
			node.type = 'text/javascript';
			node.innerHTML = sript;
			el.appendChild(node);
			
			node = document.createElement('script');
			node.type = 'text/javascript';
			node.src = src;
			el.appendChild(node);
		},
		
		loadAdLeftpanel: function(el) {
			o.loadAdsenseAd(el, '<!--\ngoogle_ad_client = "ca-pub-1527586273799797"; google_ad_slot = "6017363415"; google_ad_width = 200; google_ad_height = 90;//-->',
				'http://pagead2.googlesyndication.com/pagead/show_ads.js');
		}
	};
	return o;
})();