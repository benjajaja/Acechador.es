exports.USER_ANONYMOUS = 1;
exports.USER_REGISTERED = 2;
	
exports.ERROR_LOGIN = 1;
exports.ERROR_REGISTRATION = 2;

exports.getRequestUserData = function(session, formdata, req, callback) {
	var user = {
		type: exports.USER_ANONYMOUS,
		name: 'Estepano'
	};
	
	if (req.session.user) {
		user.name = typeof req.session.user.name != 'undefined' ? req.session.user.name : user.name;
		user.type = exports.USER_REGISTERED;
		user.id = typeof req.session.user.id != 'undefined' ? req.session.user.id : 0;

		if (formdata.submitter && formdata.submitter != user.name && formdata.submitter != '') {
			user.type = exports.USER_ANONYMOUS;
			user.name = formdata.submitter;
		}
		callback(null, user);
		
	} else {
		if (formdata.password2) { // registration
			session.register(formdata.submitter, formdata.password, formdata.keep, formdata.email, false, req, function(err) {
				if (err) {
					callback(exports.ERROR_REGISTRATION, err);
				} else {
					callback(null, {
						type: exports.USER_REGISTERED,
						name: req.session.user.name,
						id: req.session.user.id
					});
				}
			});
		} else if (formdata.password) { // login
			session.login(formdata.submitter, formdata.password, formdata.keep, false, req, function(err) {
				if (err) {
					callback(exports.ERROR_LOGIN);
				} else {
					callback(null, {
						type: exports.USER_REGISTERED,
						name: req.session.user.name,
						id: req.session.user.id
					});
				}
			});
		} else {
			if (formdata.submitter != '') {
				user.name = formdata.submitter;
			}
			callback(null, user);
		}
	}
};