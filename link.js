module.exports = function(app, layout, db) {



	

	var provider = require('./modules/linkprovider')(db);
	
	app.get('/r/:category/:id/:ref/?', layout.handle({
		handle: function(req, res) {
			var ref = req.params.ref;
			provider.getLink({
						alphaid: req.params.id,
						user: (req.session.user && req.session.user.id ? req.session.user.id : null),
						comments: true
					},
					function(err, link) {
				if (err) {
					layout.showDialogError(req, res, {
						message: 'Enlace no encontrado'
					});
				} else {
					var onload = ['Comments.attach($("#submit"));', 'Votes.load();', 'Facebook.addLikeLink();'];
					if (!layout.session.isLogged(req.session)) {
						onload.push('LoginOffer.attach($("#login"), $("#postcomment").find("input[name=submitter]"));');
					}
					if (link.video_site == 2) { //FIXME: use constant
						onload.push('Preview.load(true);');
					}
					
					
					layout.render(req, res, {
						pageTemplate: 'page_link',
						link: link,
						onload: onload
					});
					
				}
			});
		}
	}));
};