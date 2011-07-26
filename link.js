module.exports = function(app, layout, db) {



	var getComments = function(link, callback) {
		db.getComments(link.id, function(err, comments) {
			if (err) throw err;
			for(var i = 0; i < comments.length; i++) {
				if (comments[i].image_id > 0) {
					comments[i].image = {
						'id': comments[i].image_id,
						'width': comments[i].image_width,
						'height': comments[i].image_height,
						'filename': comments[i].image_filename,
						'src': 'img/user/thumb/'+comments[i].image_id+'.png',
						'href': 'img/user/'+comments[i].image_id+'.jpg'
					};
				}
				if (!comments[i].username) {
					comments[i].submitterName = comments[i].submitter_ref;
				}
			}
			link.comments = comments;
			callback(link);
		});
	};

	app.get('/r/:category/:id/:ref/?', layout.handle({
		handle: function(req, res) {
			var ref = req.params.ref;
			db.getLink(req.params.id, function(err, link) {
				if (err || !link || link.length != 1 || !link[0].id) {
					layout.showDialogError(req, res, {
						message: 'Enlace no encontrado'
					});
				} else {
					var onload = ['Comments.attach($("#submit"));'];
					if (!layout.session.isLogged(req.session)) {
						onload.push('LoginOffer.attach($("#login"), $("#postcomment").find("input[name=submitter]"));');
					}
					if (link[0].video_site == 2) { //FIXME: use constant
						onload.push('Preview.load(true);');
					}
					
					getComments(link[0], function(link) {
						layout.render(req, res, {
							pageTemplate: 'page_link',
							link: link,
							onload: onload
						});
					});
				}
			});
		}
	}));
};