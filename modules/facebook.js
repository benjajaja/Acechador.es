var raw = require('facebook-api').raw;

var accessToken = function(id, secret, cb) {
	raw("GET", "oauth/access_token", {
		client_id: id,
		client_secret: secret,
		grant_type: 'client_credentials'
	}, function(err, data) {
		if (err || !data || !data.access_token) {
			cb(err || 'cannot get access token');
		} else {
			cb(null, data.access_token);
		}
	});
};

module.exports = function(options) {
	var fb = {
	};
	fb.makePost = function(baseUrl, imageUrl, link) {
		if (!link.href) {
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
	};
	
	fb.publish = function(post, cb) {
		accessToken(options.appid, options.appsecret, function(err, accessToken) {
			if (err) {
				cb(err);
			} else {
				post.access_token = accessToken;
				raw("POST", options.pageid+"/feed", post, function(err, data) {
					if (err) {
						cb(err);
					} else if (!data || !data.id) {
						cb('fb raw POST returned no data or no id in data');
					} else {
						cb(null, data.id);
					}
				});
			}
		});
	};
	


	/*fb.publish = function(accessToken, pageId, post, cb) {
		post.access_token = accessToken;
		raw("POST", pageId+"/feed", post, function(err, data) {
			if (err) {
				cb(err);
			} else {
				cb(null, data.id);
			}
		});
	};*/

	fb.delete = function(accessToken, id, cb) {
		raw("DELETE", id, [], function(success) {
			cb(!success);
		});
	};
	return fb;
};

