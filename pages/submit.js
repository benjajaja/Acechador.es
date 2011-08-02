



module.exports = function(app, layout, db) {
	var getCategories = function(callback) {
		db.getCategories(function(err, rows) {
			if (err) throw err;
			var categories = {};
			for(var i = 0; i < rows.length; i++) {
				categories[rows[i].ref] = rows[i].name;
			}
			callback(categories);
		});
	};
	
	var handler = function(req, res) {
		getCategories(function(categories) {
			layout.render(req, res, {
				pageTemplate: 'page_submit',
				form: {},
				categories: categories,
				onload: ['Submit.attach($("#submit"), '+(layout.session.isLogged(req.session)?'true':'false')+');']
			});
		});
	};
	
	app.all('/submit/?', handler);
};