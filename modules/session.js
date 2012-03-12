var db = null;


module.exports = function(gdb) {
	if (gdb) {
		db = gdb;
	}
	return {
		login: login,
		logout: logout,
		getUserName: getUserName,
		register: register,
		isLogged: isLogged,
		loginByToken: loginByToken,
		USER_LEVEL_USER: 1,
		USER_LEVEL_ADMIN: 2,
		USER_ANONYMOUS: 1,
		USER_REGISTERED: 2
	};
};

var getHash = function(name, password) {
	return sha1(name+password+'cowswithgunskajdhasi8462398aksjdhaosie0928347iuasdgfashgdkjashdFUCKYOUaslkdjalsid');
};

var sha1 = function(string) {
	var sha1 = require('sha1');
	return sha1(string);
	/*require('joose');
	require('joosex-namespace-depended');
	require('hash');
	return Hash.sha1(string);*/
};

var login = function(name, password, keep, isHashed, req, callback) {
	var lifetime = keep ? 31536000 : null;
	
	if (!name || name.length == 0 || !password || password.length == 0) {
		return callback("no username or password supplied");
	}
	
	if (typeof isHashed != 'undefined' && isHashed !== true) {
		password = getHash(name, password);
	}
	
	db.getUser(name, password, function(err, rows) {
		delete req.session.user;
		if (err) {
			callback("query error: "+err);
			throw err;
		} else if (!rows || rows.length < 1 || rows[0].id < 0) {
			callback("incorrect username or password combination");
			return;
		} else {
			var token = sha1(name+password+(new Date().toString()));
			db.setUserToken(rows[0].id, token, function(err) {
				if (err) {
					console.log('could not set user token', err);
				} else {
					regenerateSession(req, rows[0], lifetime, function() {
						req.session.user.token = token;
						callback();
					});
				}
				
			});
		}
	});
};

var loginByToken = function(token, req, callback) {
	db.getUserByToken(token, function(err, user) {
		delete req.session.user;
		if (err) {
			callback("query error: "+err);
		} else if (!user) {
			callback("incorrect token");
		} else {
			db.setUserToken(user.id, '', function(err) {
				if (err) {
					console.log('could not set user token', err);
				}
				regenerateSession(req, user, null, callback);
			});
		}
	});
};

var regenerateSession = function(req, user, lifetime, callback) {
	req.session.regenerate(function(err) {
		if (lifetime !== null) {
			req.session.cookie.expires = new Date(Date.now() + lifetime);
			req.session.cookie.maxAge = lifetime;
		}
		req.session.key = 'acechador';
		req.session.user = user;
		req.session.save();
		callback();
	});
};

var logout = function(req, callback) {
	delete req.session.user;
	req.session.regenerate(callback);
}

var getUserName = function(session) {
	return session.user ? session.user.name : 'desconocido';
};

var register = function(name, password, keep, email, isHashed, req, callback) {
	if (name.length < 1) {
		callback("El nombre de usuario debe contener al menos una letra, señor misterioso");
	} else if (name.match(/[^a-zA-Z0-9-_]/) !== null) {
		callback("Solo se permiten letras de la A a la Z, núos, y los caracteres '-' y '_' en el nombre de usuario.");
	} else if (password.length < 1) {
		callback("Tienes que poner una contraseña");
	} else {
		db.getUsers(name, function(err, rows) {
			if (err || rows.length > 0) {
				callback("Ese nombre de usuario ya está registrado.");
			} else {
				db.createUser(name, getHash(name, password), email, function(err, result) {
					if (err) {
						callback(err);
						
					} else {
						regenerateSession(req, {
							id: result.id,
							name: name,
							level: 1,
							token: 0
						}, keep ? 31536000 : null, callback);
						
					}
				});
			}
		});
	}
};

var isLogged = function(session) {
	return typeof session.user != "undefined" && session.user.id > 0;
};
