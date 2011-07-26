module.exports = function(app, layout, db) {



	var getComments = function(link, callback) {
		db.query().select(['ac_comments.*', {'username': 'ac_users.name'}, {'image_id': 'ac_images.id'},
				{'image_width': 'ac_images.thumb_width'}, {'image_height': 'ac_images.thumb_height'},
				{'image_filename': 'ac_images.filename'}])
				.from('ac_comments')
				.join({'type': 'LEFT', 'table': 'ac_users', 'conditions': 'ac_comments.submitter_type = ? AND ac_users.id = ac_comments.submitter_ref'}, [2])
				.join({'type': 'LEFT', 'table': 'ac_images', 'conditions': 'ac_images.origin = ? AND ac_images.parent = ac_comments.id'}, [1])
				.where('link = ?', [link.id])
				.execute(function(err, comments) {
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
			db.query().select(['ac_links.*', {'username': 'ac_users.name'}, {'video_site': 'ac_videos.site'}, 
					{'video_ref': 'ac_videos.ref'}, {'category_name': 'ac_categories.name'}, {'category_ref': 'ac_categories.ref'},
					{'thumbnail_width': 'ac_videos.thumbnail_width'}, {'thumbnail_height': 'ac_videos.thumbnail_height'}
					])
					.from('ac_links')
					.join({'type': 'LEFT', 'table': 'ac_users', 'conditions': 'ac_links.submitter_type = ? AND (ac_users.id = ac_links.submitter OR ac_users.name = ac_links.submitter)'}, [2])
					.join({'type': 'LEFT', 'table': 'ac_videos', 'conditions': 'ac_videos.type = ? AND ac_videos.id = ac_links.id'}, [1])
					.join({'type': 'LEFT', 'table': 'ac_categories', 'conditions': 'ac_categories.id = ac_links.category'})
					.where('ac_links.alphaid = ?', [req.params.id])
					.order({'timestamp': false, 'id': false})
					.limit(1)
					.execute(function(err, link) {
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