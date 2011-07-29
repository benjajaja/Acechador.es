module.exports = function(app, layout, db) {
	app.get('/u/:username', function(req, res, next) {
		db.getUser(req.params.username, function(err, user) {
			if (err || !user || !user.id) {
				console.log(err);
				layout.showDialogError(req, res, {message: 'Ese usuario no existe'});
			} else {
				require('./modules/linklistprovider')(db).getLinks({
					where: {
						clause: 'submitter_type = ? AND submitter = ?',
						parameters: [2, user.id]
					}
				}, function(rows, pages) {
					layout.render(req, res, {
						pageTemplate: 'page_frontpage',
						links: rows,
						//pages: pages
					});
				});
			}
		});
	});
};