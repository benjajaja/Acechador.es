var PlusOne = function() {
	return {
		callback: function(status) {
			console.log(arguments);
			if (status.state == "on") {
				console.log("¡Gracias!");
			} else {
				console.log("pues nada...");
			}
		},
		load: function() {
			if (typeof gapi == "undefined") {
				return;
			}
			var base = $(document).find("head").first().find("base").attr("href");
			if (!base) {
				base = "acechador.es";
				console.log("Can't find base tag");
			}
			base += "/";
			var containers = $(".links .link_actions");
			for(var i = 0, ilen = containers.length; i < ilen; i++) {
				var plusoneContainer = $(containers[i]).find(".plusone");
				var href = base+plusoneContainer.prev().attr("href");
				gapi.plusone.render(plusoneContainer[0].id, {"href": href, "size": "small", "count": false, "callback": "__acechadores_plusoneCallback"});
			}

		}
	};
}();
var __acechadores_plusoneCallback = PlusOne.callback;