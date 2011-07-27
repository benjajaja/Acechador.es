module.exports = function(app, layout) {
	app.get('*', function(req, res, next){
		if (req.url == "/privacidad") {
			layout.render(req, res, {
				pageTemplate: 'static'+req.url
			});
		} else {
			next();
		}
	});
	
	app.all('*', function(req, res, next) {
		var filepath = req.url.indexOf('?') !== -1 ? req.url.substring(0, req.url.indexOf('?')) : req.url;
		var path = require('path');
		path.exists(__dirname + '/public/'+filepath, function(exists) {
			if (!exists) {
				var extension = path.extname(filepath);
				if (extension && ['.jpg', '.png'].indexOf(extension) !== -1) {
					res.send('not found', 404);
				} else {
					require('fs').readFile(__dirname + '/views/error.html', function(err, data) {
						res.send(data, 404);
					});
				}
			} else {
				res.header('Cache-Control', 'max-age=2592000, must-revalidate');
				res.sendfile(__dirname + '/public/' + filepath);
			}
		});
	});
};