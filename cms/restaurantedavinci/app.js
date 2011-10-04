process.on('uncaughtException', function (err) {
	//log4js.getLogger('console').fatal('Uncaught exception:', err);
	console.error('Uncaught exception:', err);
});

var log4js = require('log4js');
log4js.configure('log4js.json', {});


if (!production) {
	log4js.addAppender(log4js.consoleAppender(), 'console');
}
log4js.addAppender(log4js.fileAppender('./logs/log'), 'console');
log4js.addAppender(log4js.fileAppender('./logs/access'), 'access');

var port, production, domains;
for(var i = 0; i < process.argv.length; i++) {
	if (process.argv[i] == '--port') {
		port = process.argv[++i];
	} else if (process.argv[i] == '-p') {
		production = (process.argv[++i] == '1');
	} else if (process.argv[i] == '-d') {
		domains = process.argv.splice(i + 1);
		break;
	}
}

(function(domains, port, production, log4js) {
	
	var express = require('express')
	var app = express.createServer();
	
	app.configure(function() {
		app.set('views', __dirname + '/views');
		app.set('view engine', 'html');
		app.register('.html', require("jqtpl").express);
		app.set('view options', {layout: false});
		app.use(express.bodyParser());
		
		app.use(express.methodOverride());
		app.use(app.router);
		if (production) {
			app.enable('saveCacheResources');
		}
		
		app.use(log4js.connectLogger(log4js.getLogger('logger'), { level: log4js.levels.INFO }));
	});
	
	app.all('/:lang?', function(req, res, next) {
		req,lang = req.params.lang;
		next();
	});
	
	app.all('/', function(req, res, next) {
		res.send('lang: '+req.lang);
	});
	
	app.all('/page/:page/:lang?', function(req, res, next) {
		next();
	});
	
	app.all('/page/:page/en', function(req, res, next) {
		next();
	});
	
	app.all('/page/:page', function(req, res, next) {
		res.send('page: '+req.params.page);
	});
	
	
	
	app.listen(port);
	console.log('CMS started on port '+port);
})(domains, port, production, log4js);