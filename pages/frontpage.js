

var getFromParam = function(from) {
	return 0;
};


module.exports = function(app, layout, db) {
	var handler = function(req, res, next) {
		var page = req.params.page > 0 ? req.params.page - 1: 0;
		var from = getFromParam(req.params.from);
		
		require('../modules/linklistprovider')(db).getLinks({
				user: (req.session.user && req.session.user.id ? req.session.user.id : null),
				from: from,
				page: page
			}, function(rows, pages) {
			
				layout.render(req, res, {
					pageTemplate: 'page_frontpage',
					links: rows,
					pages: pages,
					onload: [
						'Preview.load();',
						'Votes.load();',
						//'PlusOne.load();'
					]
				});
			});
			
		
	};
	app.get('/', handler);
	app.get('/inline/:inline', handler);
	
	app.get('/pag/:page', handler);
	app.get('/pag/:page/inline/:inline', handler);
	
	app.get('/nav/:nav', handler);
	app.get('/nav/:nav/inline/:inline', handler);
};