module.exports = function(app, layout, db) {
	app.get('/u/:username', function(req, res, next) {
		db.getUser(req.params.username, function(err, user) {
			if (err || !user || !user.id) {
				console.log(err);
				layout.render(req, res, dialog({
					message: 'Ese usuario no existe',
					action: layout.getReturnUrl(req, true),
					error: true
				}).asGlobal());
				
			} else {
				require('../modules/linklistprovider')(db).getLinks({
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