module.exports = function(app, layout, db) {
	app.get('/r/:category', function(req, res, next) {
		db.getCategory(req.params.category, function(err, category) {
			if (err || !category || !category.id) {
				console.log(err);
				layout.render(req, res, dialog({
					message: 'Esa categoría no existe',
					action: layout.getReturnUrl(req, true),
					error: true
				}).asGlobal());
				
			} else {
				require('../modules/linklistprovider')(db).getLinks({
					where: {
						clause: 'category = ?',
						parameters: [category.id]
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