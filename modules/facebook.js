var raw = require('facebook-api').raw;


exports.accessToken = function(id, secret, cb) {
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

exports.publish = function(accessToken, pageId, post, cb) {
	post.access_token = accessToken;
	raw("POST", pageId+"/feed", post, function(err, data) {
		if (err) {
			cb(err);
		} else {
			cb(null, data.id);
		}
	});
};

exports.delete = function(accessToken, id, cb) {
	raw("DELETE", id, [], function(success) {
		cb(!success);
	});
};