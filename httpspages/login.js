module.exports = function(app, layout, onlyLogout) {
	var dialog = require('../modules/dialog');
	var handle = function(req, res, next) {
		if (req.body) {
			layout.session.login(req.body.name, req.body.password, req.body.keep, false, req, function(err) {
				if (err) {
					console.log(err);
					layout.render(req, res, dialog({
						message: 'Usuario o contraseña incorrectos',
						action: layout.getReturnUrl(req, true),
						error: true
					}).asGlobal({isHttps: true}));
				} else {
					layout.render(req, res, dialog({
						message: 'Bienvenido, '+layout.session.getUserName(req.session),
						action: layout.getReturnUrl(req, true)
					}).asGlobal({isHttps: true}));
				}
			});
			
		} else {
			layout.render(req, res, dialog({
				message: 'Esta página necesita datos de un formulario',
				action: layout.getReturnUrl(req, true),
				error: true
			}).asGlobal({isHttps: true}));
		}
	};
	if (!onlyLogout) {
		app.all('/login/?', function(req, res, next) {
			if (req.body) {
				layout.session.login(req.body.name, req.body.password, req.body.keep, false, req, function(err) {
					if (err) {
						console.log(err);
						layout.render(req, res, dialog({
							message: 'Usuario o contraseña incorrectos',
							action: layout.getReturnUrl(req, true),
							error: true
						}).asGlobal({isHttps: true}));
					} else {
						layout.render(req, res, dialog({
							message: 'Bienvenido, '+layout.session.getUserName(req.session),
							action: layout.getReturnUrl(req, true)
						}).asGlobal({isHttps: true}));
					}
				});
				
			} else {
				layout.render(req, res, dialog({
					message: 'Esta página necesita datos de un formulario',
					action: layout.getReturnUrl(req, true),
					error: true
				}).asGlobal({isHttps: true}));
			}
		});
	} else {
		app.all('/logout/?', function(req, res, next) {
			layout.session.logout(req, function(err) {
				layout.render(req, res, dialog({
					title: 'Desconectado',
					message: 'Puedes estar tranquilo',
					action: layout.getReturnUrl(req, true)
				}).asGlobal());
			});
		});
	}
};