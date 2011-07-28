
module.exports = function(db, layout, options) {
	var fb = require('../facebook');
	var provider = require('../linklistprovider')(db);
	return {
		run: function() {
			console.log('chicking if there\'s something to publish to facebook...');
			provider.getLinks({
						limit: 10
					}, function(links) {
				if (links[0].fbpost === null) {
					var link = links[0];
					console.log('will publish '+link.name+' to facebook...');
					
					fb.accessToken(options.appid, options.appsecret,
							function(err, accessToken) {
						if (err) {
							res.send(err);
						} else {
							
							var post = {
								name: link.name,
								link: layout.urls.base+link.href,
								caption: 'enviado por ',
								message: ''
							};
							
							if (link.submitter_type == 2) {
								post.caption += link.username;
							} else {
								post.caption += link.submitter;
							}
							//post.message += ' en '

							if (link.video_site == 2) {
								post.picture = layout.urls.static+'/img/videos/thumb_'+link.id+'.jpg';
							}

							fb.publish(accessToken, options.pageid, post, function(err, id) {
								if (err) {
									console.log(err);
								} else {
									db.updateLink(link.id, {'fbpost': id}, function(err) {
										if (err) {
											console.log(err);
										} else {
											console.log('published: '+id);
										}
									});
									
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