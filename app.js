/*

	ACECHADOR.ES website to share links
	Copyright (C) 2009-2011 Benjamin Grosse

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

	
	TODO:
		PLANNED:
		* let admins delete comments

*/

var user = 0;
var production = false;
var port = 8888;
var securePort = 8443;
var cacheTag = '2011081001';
var httpsOptions = (function() {
	var fs = require('fs');
	return {
	  ca:   fs.readFileSync('keys/sub.class1.server.ca.pem'),
	  key:  fs.readFileSync('keys/ssl.key'),
	  cert: fs.readFileSync('keys/ssl.crt')
	};
})();

for(var i = 0; i < process.argv.length; i++) {
	if (process.argv[i] == "-u") {
		user = process.argv[i+1];
	} else if (process.argv[i] == "-p") {
		production = true;
		port = 8000;
		securePort = 443;
	}
}



var express = require('express')
var app = express.createServer();


// Configuration
var appConfigure = function(app){
	return function() {
		app.set('views', __dirname + '/views');
		app.set('view engine', 'html');
		app.register('.html', require("jqtpl").express);
		app.set('view options', {layout: false});
		app.use(express.bodyParser());
		app.use(express.cookieParser());
		app.use(express.session({
			secret: "la bandica gestiona fuerte",
			store: new (require('connect-redis')(express))
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
	};
};
app.configure(appConfigure(app));




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
		}, db);


		// Routes
		
		app.all('*', function(req, res, next) {
			if (req.query.token) {
				layout.session.loginByToken(req.query.token, req, function(err) {
					if (err) {
						console.log(err);
					}
					next();
				});
			} else {
				next();
			}
		});
		
		require('./pages/search')(app, layout, db);
		
		require('./pages/frontpage')(app, layout, db);
		
		require('./httpspages/login')(app, layout, true);
		
		require('./cachebundler')(app, cacheTag);

		require('./pages/link')(app, layout, db);

		require('./pages/submit')(app, layout, db);

		require('./pages/user')(app, layout, db);
		
		require('./pages/category')(app, layout, db);

		require('./xhr/submit')(app, layout.session, db, layout.urls);
		
		require('./xhr/comment')(app, layout.session, db);

		require('./xhr/vote')(app, layout.session, db);
		
		require('./rss')(app, db);
		
		require('./pages/changelog')(app, layout);
		
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
		
		(function() {
			var app = express.createServer(httpsOptions);
						
			app.configure(appConfigure(app));
			
			require('./cachebundler')(app, cacheTag);
			
			require('./httpspages/login')(app, layout);
			
			require('./xhr/submit')(app, layout.session, db, layout.urls);
			
			require('./httpspages/admin')(app, layout, db);
			
			require('./staticpages')(app, layout);
			
			app.listen(securePort);
			console.log("Express https server listening on port %d", app.address().port);
		})();
		
		
		if (user != 0) {
			(function() {
				var http = require('http'),
					proxy = require('http-proxy');

				var routerOptions = {
					router: {
						'minecraft.acechadores.com': '127.0.0.1:8080',
						'acechadores.com': '127.0.0.1:8000',
						'acechador.es': '127.0.0.1:8000',
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
	}
);




