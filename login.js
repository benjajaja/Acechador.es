module.exports = function(app, layout) {
	var o = {
		handle: function(req, res, next) {
			if (req.route.path == '/logout/?') {
				layout.session.logout(req, function(err) {
					layout.showDialogInfo(req, res, {title: 'Desconectado', message: 'Puedes estar tranquilo'});
				});
				
			} else if (req.body) {
				layout.session.login(req.body.name, req.body.password, req.body.keep, false, req, function(err) {
					if (err) {
						console.log(err);
						layout.showDialogError(req, res, {message: 'Usuario o contraseña incorrectos'});
					} else {
						layout.showDialogInfo(req, res, {message: 'Bienvenido, '+layout.session.getUserName(req.session)});
					}
				});
				
			} else {
				layout.showDialogError(req, res, {message: 'Esta página necesita datos de un formulario'});
			}
		}
	};
	app.all('/login/?', layout.handle(o));
	app.all('/logout/?', layout.handle(o));

	return o;
};