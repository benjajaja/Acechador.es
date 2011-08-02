module.exports = function(app, layout, db) {
	app.get('/search/?', function(req, res, next) {
		if (req.query.q) {
			require('../modules/linklistprovider')(db).getLinks({
					filter: {
						fields: ['ac_links.name'],
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
			layout.render(req, res, dialog({
				message: 'Tienes que introducir un término de búsqueda.',
				action: layout.getReturnUrl(req, true),
				error: true
			}).asGlobal());
		}
	});
};