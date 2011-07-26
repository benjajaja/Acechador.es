module.exports = function(app, layout, db) {
	app.get('/search/?', function(req, res, next) {
		if (req.query.q) {
			require('./linklistprovider')(db).getLinks({
					filter: {
						fields: ['name'],
						value: req.query.q || ''
					}
				}, function(rows, pages) {
					layout.render(req, res, {
						pageTemplate: 'page_frontpage',
						links: rows,
						//pages: pages
					});
				});
		} else {
			layout.showDialogError(req, res, {message: 'Tienes que introducir un término de búsqueda.'});
		}
	});
};