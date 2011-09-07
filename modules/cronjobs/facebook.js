function makeFbPost(baseUrl, imageUrl, link) {
	if (link.href) {
		throw new Error('Cannot create facebook post without link.href');
	}
	var post = {
		name: link.name,
		link: baseUrl+link.href,
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
		post.picture = imageUrl+'/img/videos/thumb_'+link.id+'.jpg';
	}
	return post;
}

module.exports = function(db, layout, options) {
	var fb = require('../facebook');
	var provider = require('../linklistprovider')(db);
	return {
		run: function() {
			provider.getLinks({
						limit: 10
					}, function(links) {
				if (links[0].fbpost === null) {
					var link = links[0];
					console.log('will publish '+link.name+' to facebook...');
					
					fb.accessToken(options.appid, options.appsecret,
							function(err, accessToken) {
						if (err) {
							console.error(err);
						} else {
							
							var post;
							try {
								post = makeFbPost(layout.urls.base, layout.urls.static, link);
								fb.publish(accessToken, options.pageid, post, function(err, id) {
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
							} catch(e) {
								console.error(e);
								
							}
						}
					});
				} else {
					console.log('latest link already published');
				}
			});
		}
	};
};