var proxy = require('http-proxy');
var https = require('https');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var production = false;
for(var i = 0; i < process.argv.length; i++) {
	if (process.argv[i] == "-p") {
		production = true;
	}
}


var log4js = require('log4js');
log4js.configure('log4js.json', {});
process.on('uncaughtException', function (err) {
	log4js.getLogger('console').fatal('Uncaught exception:', err);
});
log4js.addAppender(log4js.consoleAppender(), 'console');
log4js.addAppender(log4js.fileAppender('./logs/proxy'), 'console');



fs.readFile('./proxy.json', function(err, data) {
	data = JSON.parse(data);
	
	if (production) {
		proxy.createServer({hostnameOnly: true, router: getRouterData(data.hosts)}).listen(80);
		console.log('proxy listening on port 80');
		
		var httpsOptions = (function() {
			var fs = require('fs');
			return {
			  ca:   fs.readFileSync('keys/sub.class1.server.ca.pem'),
			  key:  fs.readFileSync('keys/ssl.key'),
			  cert: fs.readFileSync('keys/ssl.crt')
			};
		})();
		for(var i = 0; i < data.hosts.length; i++) {
			if (data.hosts[i].app && data.hosts[i].app.secureport) {
				(function() {
					var sslproxy = new proxy.HttpProxy({
					  target: {
						https: true
					  }
					});
					https.createServer(httpsOptions, function (req, res) {
						sslproxy.proxyRequest(req, res, {
							host: 'localhost', 
							port: data.hosts[i].app.secureport
						});
					}).listen(443);
				})();
				break;
			}
		}

		console.log('dropping privileges down to user "'+data.user+'"');
		process.setuid(data.user);
		

	}
	
	startScripts(data.hosts, production);
});

function getRouterData(hosts) {
	var router = {};
	for(var i = 0; i < hosts.length; i++) {
		for(var j = 0; j < hosts[i].domains.length; j++) {
			if (hosts[i].address) {
				router[hosts[i].domains[j]] = hosts[i].address;
				
			} else {
				router[hosts[i].domains[j]] = '127.0.0.1:'+hosts[i].app.port;
				
			}
		}
	}
	return router;
}

function startScripts(hosts, production) {
	var port;
	var child;
	for(var i = 0; i < hosts.length; i++) {
		if (hosts[i].app) {
			port = production ? hosts[i].app.port : hosts[i].app.devport;
			
			var args = [hosts[i].app.script, '--port', port];
			if (production) {
				args.push('-p');
			}
			if (hosts[i].app.secureport) {
				args.push('--secureport');
				args.push(hosts[i].app.secureport);
			}
			args.push('-d');
			for(var j = 0; j < hosts[i].domains.length; j++) {
				args.push(hosts[i].domains[j]);
			}
			
			var cwd = path.dirname(args[0]);
			args[0] = path.basename(args[0]);
			console.log('spawning node '+args[0]+' inside '+cwd+' on '+port+' for domain '+JSON.stringify(hosts[i].domains));
			
			child = spawn('node', args, {cwd: cwd});
			child.stderr.on('data', function(data) {
				console.error(args[0]+': '+data);
			});
			child.on('exit', function(code, signal) {
				if (code) {
					console.error(args[0]+' exited ('+code+','+signal+')');
				} else {
					console.error(args[0]+' exited.');
				}
				// TODO: restart?
			});
			
			process.on('exit', function() {
				child.kill();
			});
		}
	}
}