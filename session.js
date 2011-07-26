var db = null;

exports.USER_LEVEL_USER = 1;
exports.USER_LEVEL_ADMIN = 2;

exports.start = function(express, app, gdb) {
	db = gdb;
};

var getHash = function(name, password) {
	require('joose');
	require('joosex-namespace-depended');
	require('hash');
	return Hash.sha1(name+password+'cowswithgunskajdhasi8462398aksjdhaosie0928347iuasdgfashgdkjashdFUCKYOUaslkdjalsid');
};

exports.login = function(name, password, keep, isHashed, req, callback) {
	var lifetime = keep ? 31536000 : null;
	
	if (!name || name.length == 0 || !password || password.length == 0) {
		return callback("no username or password supplied");
	}
	
	if (typeof isHashed != 'undefined' && isHashed !== true) {
		password = getHash(name, password);
	}
	
	
	
	db.query().select(['id', 'name', 'level', 'token']).from('ac_users').where('name = ? AND hash = ?', [name, password]).limit(1)
			.execute(function(err, rows) {
		delete req.session.user;
		if (err) {
			callback("query error: "+err);
			throw err;
		} else if (!rows || rows.length < 1 || rows[0].id < 0) {
			callback("incorrect username or password combination");
			return;
		} else {
			regenerateSession(req, rows[0], lifetime, callback);
		}
	});
};

var regenerateSession = function(req, user, lifetime, callback) {
	req.session.regenerate(function(err) {
		if (lifetime !== null) {
			req.session.cookie.expires = new Date(Date.now() + lifetime);
			req.session.cookie.maxAge = lifetime;
		}
		req.session.user = user;
		req.session.save();
		callback();
	});
};

exports.logout = function(req, callback) {
	delete req.session.user;
	req.session.regenerate(callback);
}

exports.getUserName = function(session) {
	return session.user ? session.user.name : 'desconocido';
};

exports.register = function(name, password, keep, email, isHashed, req, callback) {
	if (name.length < 1) {
		callback("El nombre de usuario debe contener al menos una letra, señor misterioso");
	} else if (name.match(/[^a-zA-Z0-9-_]/) !== null) {
		callback("Solo se permiten letras de la A a la Z, núos, y los caracteres '-' y '_' en el nombre de usuario.");
	} else if (password.length < 1) {
		callback("Tienes que poner una contraseña");
	} else {
		db.query().select(['id']).from('ac_users').where('name = ?', [name]).limit(1).execute(function(err, rows) {
			if (err || rows.length > 0) {
				callback("Ese nombre de usuario ya está registrado.");
			} else {
				db.query().insert('ac_users',
						['name', 'hash', 'email', 'level', 'timestamp_registered', 'token'],
						[name, getHash(name, password), email, 1, new Date(), '0'])
					.execute(function(err, result) {
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

exports.isLogged = function(session) {
	return typeof session.user != "undefined" && session.user.id > 0;
};