Skel = {
	isLoaded: false,
	templates: {},
	data: {},

	getTemplate: function(name) {
		/*if (!Skel.templates[name].parsed) {
			try {
				Skel.templates[name].template = jsontemplate.Template(Skel.templates[name].template);
			} catch (e) {
				console.log("JsonTemplate exception: " + e.message);
			}
			Skel.templates[name].parsed = true;
		}*/
		return Skel.templates[name].template;
	},
	fetch: function(template, data) {
		// inherit unset properties
		if (typeof Skel.templates[template].data != 'undefined') {
			for(var property in Skel.templates[template].data) {
				if (typeof data[property] == "undefined") {
					data[property] = Skel.templates[template].data[property];
					console.log("inheriting "+property);
				}
			}
		}
		// return html element
		//return $(document.createElement('div')).html(Skel.getTemplate(template).expand(data)).children();
		//console.log(Skel.templates[template].template, data);
		try {
			return jQuery.tmpl(Skel.templates[template].template, data);
		} catch (e) {
			console.log('Could not fetch template "'+template+'": '+e, data);
			return null;
		}
	}
};