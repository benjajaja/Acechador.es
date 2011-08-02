module.exports = function(app, layout, db) {



	

	var provider = require('../modules/linkprovider')(db);
	
	app.get('/r/:category/:id/:ref/?', function(req, res) {
		var ref = req.params.ref;
		provider.getLink({
					alphaid: req.params.id,
					user: (req.session.user && req.session.user.id ? req.session.user.id : null),
					comments: true
				},
				function(err, link) {
			if (err) {
				layout.render(req, res, dialog({
					message: 'Enlace no encontrado',
					action: layout.getReturnUrl(req, true),
					error: true
				}).asGlobal());
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
	});
};