var IMAGE_MAX_WIDTH_THUMB = 200;
var IMAGE_MAX_HEIGHT_THUMB = 200;

var userpost = require('../modules/userpost');

module.exports = function(app, session, db) {

	app.post('/xhr/comment/?', function(req, res) {
		console.log('comment post...');
		res.contentType('application/json');
		userpost.getRequestUserData(session, req.body, req, function(err, user) {
			if (err) {
				if (err === userpost.ERROR_LOGIN) {
					res.send({dialog: {
						title: 'Usuario o contraseña incorrectos',
						className: 'dialogError',
						message: 'Si quieres enviar como anónimo, deja el campo de contraseña en blanco.',
						icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>',
						action: '/submit',
						buttonLabel: 'Volver'
					}});
				} else if (err === userpost.ERROR_REGISTRATION) {
					res.send({dialog: {
						title: 'Error',
						className: 'dialogError',
						message: 'Ha ocurrido un error al registrar tu cuenta nueva: '+(user ? user : '(no hay detalles del error)'),
						icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>',
						action: '/submit',
						buttonLabel: 'Volver'
					}});
				} else {
					res.send({dialog: {
						title: 'Error',
						className: 'dialogError',
						message: 'Ha ocurrido un error relacionado con la cuenta de usuario, consulte el manual página 823 párrafo 3.',
						icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>',
						action: '/submit',
						buttonLabel: 'Volver'
					}});
				}
			} else {
				comment(req.body.link, user, req.body.comment, req.body.imagedata, function(err, comment) {
					if (err) {
						console.log(err);
						res.send({dialog: {
							title: 'Error al guardar comentario',
							className: 'dialogError',
							message: 'No he podido guardar el comentario.',
							icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>',
							action: '/submit',
							buttonLabel: 'Volver'
						}});
					
					} else {
						res.send({
							dialog: {
								title: 'Comentario enviado',
								message: 'Tu comentario se ha guardado correctamente',
								icon: 'i',
								buttonLabel: 'Vale'
							},
							comment: comment
						});
					}
				});
			}
		});
		
	});
	
	var comment = function(link, user, text, imagedata, callback) {
		db.createComment(link, text, user.type, (user.type === userpost.USER_ANONYMOUS ? user.name : user.id),
				function(err, result) {
			if (err) {
				callback(err, null);
				
			} else {
				var data = {
					comment: text,
					antiquity: 'justo ahora'
				};
				data[user.type === userpost.USER_ANONYMOUS ? 'submitter_ref' : 'username'] = user.name;
				
				if (typeof imagedata != 'undefined' && imagedata !== null && imagedata.length > 0) {
					saveImageData(result.id, imagedata, function() { callback(null, data); });
					
				} else {
					callback(null, data);
					
				}
				
			}
		});
	};
	
	
	var saveImageData = function(id, imagedata, callback) {

		var type = imagedata.match(/^data:image\/(\w+);base64,/);
		if (type === null || type.length == 0) {
			console.log('unknown mime type', type);
			callback();
			
		} else {
			type = type[1];
			var data = imagedata.replace(/^data:image\/\w+;base64,/, "");
			var buf = new Buffer(data, 'base64');
			var tmpfile = '/tmp/canvas_image_'+id+'.'+type;
			
			var fs = require('fs');
			fs.writeFile(tmpfile, buf, function(err) {
				if (err) {
					console.log('cannot write tmp file: '+err);
					fs.unlink(tmpfile, callback);
					
				} else {
					var im = require('imagemagick');
					im.identify(tmpfile, function(err, features){
						if (err) {
							console.log('cannot get image features: '+err);
							fs.unlink(tmpfile, callback);
							
						} else {
							var thumbFeatures = proportionalSize(features, IMAGE_MAX_WIDTH_THUMB, IMAGE_MAX_HEIGHT_THUMB);
							fs.stat(tmpfile, function(err, stats) {
								if (err) {
									var size = 0;
									console.log('cannot get file size');
								} else {
									size = stats.size;
								}
								db.createImage(1, id, 'canvas', features.width, features.height, thumbFeatures.width, thumbFeatures.height, size,
										function(err, result) {
									if (err) {
										console.log('cannot insert row: '+err);
										fs.unlink(tmpfile, callback);
										
									} else {
										try {
											im.convert([tmpfile, 'public/img/user/'+result.id+'.jpg'], function(err, meta) {
												if (err) {
													console.log('im convert error: '+err);
													fs.unlink(tmpfile, callback);
													
												} else {
													im.convert([tmpfile, '-resize',  thumbFeatures.width+'x'+thumbFeatures.height, 'public/img/user/thumb/'+result.id+'.png'],
															function(err, meta) {
														fs.unlink(tmpfile, callback);
													});
												}
											});
										} catch (e) {
											console.log('imagemagick exception: '+e, e.stack);
											fs.unlink(tmpfile, callback);
										}
									}
								});
							});
						}
						
					});
				}
			});
		}
	};
}



var proportionalSize = function(size, width, height) {
	var dest = {};
	if (size.width >= size.height) {
		dest.height = Math.floor(width * size.height / size.width);
		dest.width = width;
	} else {
		dest.width = Math.floor(height * size.width / size.height);
		dest.height = height;
	}
	return dest;
};