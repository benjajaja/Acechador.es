module.exports = function(db, layout, fb) {
	//var fb = require('../facebook');
	var provider = require('../linklistprovider')(db);
	return {
		run: function() {
			provider.getLinks({
						limit: 10
					}, function(links) {
				if (links[0].fbpost === null) {
					var link = links[0];
					console.log('will publish '+link.name+' to facebook...');
					
					fb.publish(fb.makePost(layout.urls.base, layout.urls.static, link), function(err, id) {
						if (err) {
							console.log(err);
						} else {
							db.updateLink(link.id, {'fbpost': id}, function(err) {
								if (err) {
									console.error(err);
								} else {
									console.log('published: '+id);
								}
							});
							
						}
					});
					
				} else {
					console.log('latest link already published');
				}
			});
		}
	};
};