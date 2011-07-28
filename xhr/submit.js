

var TYPE_LINK = 1;
var VIDEO_YOUTUBE = 2;

var escapeUrl = function(string) {
	return string.toString().toLowerCase().replace(/\s/g, '_')
		.replace(/ñ/, 'n')
		.replace(/Ñ/, 'N')
		.replace(/á/, 'a')
		.replace(/é/, 'e')
		.replace(/í/, 'i')
		.replace(/ó/, 'o')
		.replace(/[^a-z0-9_]/g, '')
};



var db = null, session = null;
var userpost = require('./userpost');



module.exports = function(app, gsession, gdb) {
	db = gdb;
	session = gsession;
	app.post('/xhr/submit/?', function(req, res) {
		handle(req, res);
	});
};

var handle = function(req, res) {
	res.contentType('application/json');

	db.getCategory(req.body.category, function(err, category) {
		if (err || category === null) {
			res.send({dialog: {
				title: 'Error al guardar enlace',
				className: 'dialogError',
				message: 'La categoría seleccionada ya no se encuentra',
				icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>',
				action: '/submit',
				buttonLabel: 'Volver'
			}});
		} else {
				
			userpost.getRequestUserData(session, req.body, req, function(err, user) {
				if (err) {
					if (err === userpost.ERROR_LOGIN) {
						res.send({dialog: {
							title: 'Usuario o contraseña incorrectos',
							className: 'dialogError',
							message: 'Si quieres enviar como anónimo, deja el campo de contraseña en blanco.',
							icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>'
						}}, 500);
					} else if (err === userpost.ERROR_REGISTRATION) {
						res.send({dialog: {
							title: 'Error',
							className: 'dialogError',
							message: 'Ha ocurrido un error al registrar tu cuenta nueva: '+(user ? user : '(no hay detalles del error)'),
							icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>'
						}}, 500);
					} else {
						res.send({dialog: {
							title: 'Error',
							className: 'dialogError',
							message: 'Ha ocurrido un error relacionado con la cuenta de usuario, consulte el manual página 823 párrafo 3.',
							icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>'
						}}, 500);
					}
				} else {
					submit(req.body.url, req.body.title, user, category, function(err, link) {
						if (err) {
							console.log(err);
							res.send({dialog: {
								title: 'Error al guardar enlace',
								className: 'dialogError',
								message: 'No he podido guardar el enlace.',
								icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>'
							}}, 500);
						
						} else {
							res.send({dialog: {
								title: 'Enlace enviado',
								message: 'Tu enlace se ha guardado correctamente. Pulsa continuar para ir a la página de tu enlace.',
								icon: 'i',
								action: link,
								buttonLabel: 'Continuar'
							}});
						}
						
					});
				}
			});
		}
	});

};



var submit = function(url, title, user, category, callback) {
	var ref = escapeUrl(title);
	console.log(title+' -> '+ref);
	db.createLink(url, title, ref, user.type, (user.type === userpost.USER_ANONYMOUS ? user.name : user.id), category.id,
			function(err, id, hash) {
		if (err) {
			console.log('could not insert link row!');
			console.log('"user": ', user);
			callback(err, null);
			
		} else {
			var href = '/r/'+category.ref+'/'+hash+'/'+ref;
			callback(null, href);

			if (user.type === userpost.USER_REGISTERED) {
				db.createVote(user.id, 1, id, 1);
			}
			addVideoLink(id, url, function(err) {
				
				if (err) {
					console.log(err);
				}
				
				/*var fb = require('../modules/facebook');
				fb.accessToken('105797889471287', 'cc03e4f1e198f45214616aa73e62a39a',
						function(err, accessToken) {
					if (!err) {
						var post = {
							name: title,
							link: layout.urls.base+href,
							caption: 'enviado por '+user.name,
							message: ''
						};
						
						if (isVideo) {
							post.picture = layout.urls.static+'/img/videos/thumb_'+id+'.jpg';
						}

						fb.publish('acechador.es', post, function(err, id) {
							if (err) {
								console.log(err);
							}
						});
					}
				});*/
			});

			
		}
	});
	
};


var addVideoLink = function(id, url, cb) {
	var matches = url.match(/^(.*)?youtube.com\/(v\/|watch\?v=)([A-Za-z0-9_\-]+)/);
	if (matches === null) {
		cb('not a youtube link');
		
	} else {
		console.log('getting youtube thumbnail');
		getVideoImage(matches[3], id, function(err, thumbnail) {
			thumbnail = thumbnail || {width: 0, height: 0};
			db.createLinkVideo(id, TYPE_LINK, VIDEO_YOUTUBE, matches[3], thumbnail.width, thumbnail.height,
					function(err, result) {
				if (err) {
					cb('Could not insert video link');
				} else {
					cb();
				}
				
			});
		});
		
		
	}
};


var getVideoImage = function(videoId, id, callback) {
	var path = 'public/img/videos/thumb_'+id+'.jpg';
	
	var fs = require ('fs');
	
	var http = require('http');
	
	try {
		var yt = http.createClient(80, 'img.youtube.com');
		var request = yt.request('GET', '/vi/'+videoId+'/1.jpg', {'host': 'img.youtube.com'});
		console.log('request for video thumb started');
		
		request.on('response', function (response) {
			console.log('request: response');
			try {
				var file = fs.createWriteStream(path);
			} catch (e) {
				console.log('could not create image file: '+e);
			}
			
			response.on('data', function (chunk) {
				console.log('writing data...');
				file.write(chunk);
				
			}).on('end', function(){
				console.log('request ended');
				
				file.on('close', function() {
					try {
						var im = require('imagemagick');
						im.identify(path, function(err, features){
							if (err) {
								console.log('cannot get downloaded image info', err);
								callback(err);
							} else {
								callback(null, features);
							}
						});
					} catch (e) {
						console
						callback('could not identify '+path);
					}
				});
				
				file.end();
				
			});
		});
		request.end();
		
	} catch (e) {
		console.log('exception when downloading video thumb: '+e);
		callback();
	}
};