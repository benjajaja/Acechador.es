var cacheResources = false;
var cacheTag = '0';
var fs = require('fs');
var styleSheets = ['stylesheet.css'];//, 'stylesheet_light.css', 'stylesheet_heavy.css'];

var scripts = ['adsense.js', 'achelper.js', 'auth.js', 'comment.js', 'dialog.js',
	'loadinghint.js', 'loginoffer.js', 'preview.js', 'skel.js',
	'submit.js', 'touchpad.js', 'votes.js',
	'jquery-1.6.2.min.js', 'jquery.cookie.js', 'openid-jquery.js', 'jquery.placeholder.js', 'jquery.scrollTo-min.js',
	'jquery.viewport.mini.js', 'swfobject.js', 'jquery.tmpl.min.js',
	//'sha1.js'
];
var templates = ['dialog.html', 'comment.html'];

var dateHelper = require('./datehelper');

var handleStylesheet = function(req, res) {
	var cachePath = 'stylesheets/.compressed/'+cacheTag+'.css.gz';
	var headers = {'Content-Type': 'text/css'};
	if (cacheResources) {
		headers['Cache-Control'] = 'max-age=2592000, must-revalidate';
		headers['Last-Modified'] = dateHelper.getRFC822Date(new Date());
	}
	
	var makePackage = function(write) {
		packageFiles('stylesheets/', styleSheets, function(data) {
			yuicompress(data, function(err, data) {
				data = gzip(data, function(data) {
					sendResponse(res, data, headers);
					if (write) {
						writeFile(cachePath, data);
					}
				});
			});
		});
	}
	
	if (cacheResources) {
		fs.readFile(cachePath, function (err, data) {
			if (err) {
				packageFiles('stylesheets/', styleSheets, function(data) {
					yuicompress(data, function(err, data) {
						data = gzip(data, function(data) {
							sendResponse(res, data, headers);
							writeFile(cachePath, data);
						});
					});
				});
				
			} else {
				sendResponse(res, data, headers);
				
			}
		});
	} else {
		packageFiles('stylesheets/', styleSheets, function(data) {
			data = gzip(data, function(data) {
				sendResponse(res, data, headers);
			});
		});
	}
};

var handleJavascript = function(req, res) {
	var cachePath = 'javascripts/.compressed/'+cacheTag+'.js.gz';
	var headers = {'Content-Type': 'text/javascript'};
	if (cacheResources) {
		headers['Cache-Control'] = 'max-age=2592000, must-revalidate';
		headers['Last-Modified'] = dateHelper.getRFC822Date(new Date());
	}
	if (cacheResources) {
		fs.readFile(cachePath, function (err, data) {
			if (err) {
				packageFiles('javascripts/', scripts, function(data) {
					packageFiles('views/', templates, function(templateData) {
						data += templateData;
						closure(data, function(err, data) {
							gzip(data, function(data) {
								sendResponse(res, data, headers);
								writeFile(cachePath, data);
							});
						});
					}, true);
					
				});
				
			} else {
				sendResponse(res, data, headers);
				
			}
		});
	} else {
		packageFiles('javascripts/', scripts, function(data) {
			packageFiles('views/', templates, function(templateData) {
				data += templateData;
				gzip(data, function(data) {
					sendResponse(res, data, headers);
				});
			}, true);
			
		});
	}
};

var closure = function(data, callback) {
	var cp = require('child_process');
	var command = 'java -jar javascripts/compiler.jar';
	var child = cp.exec(command, function(err, stdout, stderr) {
		if (err) {
			console.log('errors: ', stderr);
			callback(err, data);
			fs.writeFile('javascripts/.compressed/closure.log', 'INPUT:\n'+data + '\nSTDERR:\n' + stderr);
		} else {
			callback(err, stdout);
		}
		
	});
	
	child.stdin.end(data);
};

var yuicompress = function(data, callback) {
	var cp = require('child_process');
	var command = 'java -jar stylesheets/yuicompressor-2.4.6.jar --type css --charset utf-8';
	var child = cp.exec(command, function(err, stdout, stderr) {
		if (err) {
			console.log('errors: ', stderr);
			callback(err, data);
			fs.writeFile('stylesheets/.compressed/yuicompressor.log', 'INPUT:\n'+data + '\nSTDERR:\n' + stderr);
		} else {
			callback(err, stdout);
		}
		
	});
	
	child.stdin.end(data);
};

var makeTemplateWrapper = function(path, templates, callback) {
	var data = '';
	var index = 0;
	var concat = function() {
		if (index > templates.length - 1) {
			fs.writeFile('javascripts/.compressed/templates.js', data, callback);
		};
		fs.readFile(path+templates[index], function (err, templateData) {
			data += '\n/* '+templates[index]+' */\n';
			var name = files[index].replace(/\.html/, '');
			data += 'Skel.templates.'+name+' = {parsed: false};';
			data += 'Skel.templates.'+name+'.template = \''
				+ templateData.toString().replace(/\n/g, '').replace(/\r/g, '').replace(/'/g, '\\\'')
				+ '\';\n';
		});
		index++;
	};
	concat();
};

var handleFont = function(req, res) {
	var fontfile = req.params.font;
	var headers = {
		'ETag': 'a8-font-'+req.params.font,
		'Expires': dateHelper.getExpiryDate()
	};
	fs.readFile('stylesheets/.compressed/fonts/'+fontfile, function (err, data) {
		if (err) {
			fs.readFile('stylesheets/fonts/'+fontfile, function (err, data) {
				if (!err) {
					var data = gzip(data, function(data) {
						sendResponse(res, data, headers);
						writeFile('stylesheets/.compressed/fonts/'+fontfile, data);
					});
				} else {
					sendResponse(res, '404 not found');
				}
			});
			
		} else {
			sendResponse(res, data, headers);
		}
	});
};

var sendResponse = function(res, data, headers) {
	if (typeof headers != 'undefined') {
		for(var key in headers) {
			res.header(key, headers[key]);
		}
	}
	res.header('Content-Encoding', 'gzip');
	res.send(data);
};

var packageFiles = function(path, files, callback, isTemplate) {
	var string = '';
	var concat;
	
	concat = function(index) {
		fs.readFile(path+files[index], function (err, data) {
			if (err) {
				console.log(err);
				concat(++index);
			}
			string += '\n/* '+files[index]+' */\n';
			if (isTemplate) {
				var name = files[index].replace(/\.html/, '');
				string += 'Skel.templates.'+name+' = {parsed: false};';
				string += 'Skel.templates.'+name+'.template = \''
					+ data.toString().replace(/\n/g, '').replace(/\r/g, '').replace(/'/g, '\\\'')
					+ '\';\n';
				
			} else {
				string += data;
			}
			
			index++;
			if (index < files.length) {
				concat(index);
				
			} else {
				callback(string);
				
			}
		});
	};
	concat(0);
};

var gzip = function(data, callback) {
	var gzip = require('gzip');
	gzip(data, function(err, data) {
		if (err) throw err;
		callback(data);
	});
};

var writeFile = function(path, data) {
	fs.writeFile(path, data, function (err) {
		if (err) throw err;
	});
};

module.exports = function(app, gcacheTag) {
	cacheTag = gcacheTag;
	cacheResources = app.enabled('saveCacheResources');
	app.get(/\/stylesheet_([^\.]+)\.css/, handleStylesheet);
	app.get(/\/javascript_([^\.]+)\.js/, handleJavascript);
	app.get('/fonts/:font', handleFont);
	return {};
};