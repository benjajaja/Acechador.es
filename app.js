/*

TODO:
* se another user's page (his links)
* allow those link protocols: http, https, ftp
PLANNED:
* let admins delete comments

*/

var user = 0;
var production = false;
var port = 8888;
var cacheTag = '2011072700';

for(var i = 0; i < process.argv.length; i++) {
	if (process.argv[i] == "-u") {
		user = process.argv[i+1];
	} else if (process.argv[i] == "-p") {
		production = true;
		port = 8000;
	}
}

if (user != 0) {
	(function() {
		var http = require('http'),
			proxy = require('http-proxy');

		var routerOptions = {
			router: {
				'minecraft.acechadores.com': '127.0.0.1:8080',
				'acechadores.com': '127.0.0.1:8000',
				'acechador.es': '127.0.0.1:8000'
			}
		};
		proxy.createServer(routerOptions).listen(80);
		console.log('proxying on port 80 for the following hosts:');
		for(var key in routerOptions.router) {
			console.log(key+': '+routerOptions.router[key]);
		};
		console.log('dropping privileges down to user "'+user+'"');
		process.setuid(user);
	})();
}

var express = require('express')
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'html');
	app.register('.html', require("jqtpl").express);
	app.set('view options', {layout: false});
	app.use(express.bodyParser());
	var RedisStore = require('connect-redis')(express);
	app.use(express.cookieParser());
	app.use(express.session({
		secret: "la bandica gestiona fuerte",
		store: new RedisStore,
	}));
	express.session.ignore.push('/robots.txt');
	express.session.ignore.push('/rss.xml');
	express.session.ignore.push('/img');
	express.session.ignore.push('/fonts');
	
	app.use(express.methodOverride());
	app.use(app.router);
	if (production) {
		app.enable('saveCacheResources');
	}
});





var db = require('./modules/db')({
	hostname: 'localhost',
	user: 'acechadores',
	password: 'acechante',
	database: 'acechadores',
	charset: 'utf8'
	},
	function(err) {
	
		if (err) throw err;
	
		var layout = require('./modules/layout')({
			domains: {
				www: 'acechador.es',
				static: 'static.acechadores.com',
			},
			cacheTag: cacheTag,
			production: production
		}, require('./modules/session')(db));


		// Routes
		
		require('./search')(app, layout, db);
		
		require('./frontpage')(app, layout, db);
		
		require('./cachebundler')(app, cacheTag);

		require('./link')(app, layout, db);

		require('./login')(app, layout);

		require('./submit')(app, layout, db);

		require('./xhr/submit')(app, layout.session, db);
		
		require('./xhr/comment')(app, layout.session, db);

		require('./xhr/vote')(app, layout.session, db);
		
		require('./rss')(app, db);
		
		require('./admin')(app, layout, db);

		// last rule - 404s!
		require('./staticpages')(app, layout);

		app.listen(port);
		console.log("Express server listening on port %d", app.address().port);
		
		var cron = require('cron');
		new cron.CronJob('0 0 11,23 * * *', require('./modules/cronjobs/facebook')(db, layout, {
			appid: '105797889471287',
			appsecret: 'cc03e4f1e198f45214616aa73e62a39a',
			pageid: 'acechador.es'
		}).run);
		
	});




