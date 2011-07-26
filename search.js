module.exports = function(app, layout, db) {
	app.get('/search/?', function(req, res, next) {
		require('./linklistprovider')(db).getLinks({
				where: {
					//clause: 'ac_links.name LIKE _latin1 ? COLLATE latin1_spanish_ci',
					clause: 'name LIKE ?',
					parameters: ['%'+req.query.q+'%' || ""]
				}
			}, function(rows, pages) {
				layout.render(req, res, {
					pageTemplate: 'page_frontpage',
					links: rows,
					//pages: pages
				});
			});
	});
};