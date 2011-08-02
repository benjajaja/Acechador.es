

module.exports = function(app, layout, db) {
	var dialog = require('../modules/dialog');
	var showDialogError = function(req, res, data) {
		data.action = layout.getReturnUrl(req, true);
		data.error = true;
		layout.render(req, res, dialog(data).asGlobal({isHttps: true}));
	};

	var showDialogInfo = function(req, res, data) {
		data.action = layout.getReturnUrl(req, true);
		layout.render(req, res, dialog(data).asGlobal({isHttps: true}));
	};

	app.all('/admin/publish/:alphaid', function(req, res, next) {
		if (!req.session.user || req.session.user.level !== require('../modules/session')().USER_LEVEL_ADMIN) {
			showDialogError(req, res, {message: 'Aqui no hay nada. ¡Venga fuera de aqui!'});
			
		} else {
			require('../modules/linkprovider')(db).getLink(req.params.alphaid, function(err, link) {
				var fb = require('../modules/facebook');

				fb.accessToken('105797889471287', 'cc03e4f1e198f45214616aa73e62a39a',
						function(err, accessToken) {
					if (err) {
						res.send(err);
					} else {
						
						var post = {
							name: link.name,
							link: layout.urls.base+link.href,
							caption: 'enviado por ',
							message: ''
						};
						
						if (link.submitter_type == 2) {
							post.caption += link.username;
						} else {
							post.caption += link.submitter;
						}
						//post.message += ' en '

						if (link.video_site == 2) {
							post.picture = layout.urls.static+'/img/videos/thumb_'+link.id+'.jpg';
						}

						fb.publish('acechador.es', post, function(err, id) {
							if (err) {
								res.send(err);
							} else {
								res.send('published: '+id);
							}
						});
					}
				});


			});
		};
	});

	app.all('/admin/setimagesizes', function(req, res, next) {
		if (!req.session.user || req.session.user.level !== require('../modules/session')().USER_LEVEL_ADMIN) {
			showDialogError(req, res, {message: 'Aqui no hay nada. ¡Venga fuera de aqui!'});
			
		} else {
			if (typeof req.query.confirm == "undefined") {
				showDialogInfo(req, res, {
					message: '¿Seguro que quieres recacalcular y fijar TODOS los tamaños?',
					confirm: {
						yes: {
							label: '¡Sí coño!',
							action: '/admin/setimagesizes/?confirm'
						},
						no: {
							label: 'No.'
						},
					}
				});
				
			} else {
				db.query(true).select('*').from('ac_videos').order('id DESC').limit(250).execute(function(err, rows) {
					var im = require('imagemagick');
					var i = -1;
					var update = function(err, result) {
						if (!err && i < rows.length - 1) {
							i++;
							try {
								im.identify('public/img/videos/thumb_'+rows[i].id+'.jpg', function(err, features){
									if (err) {
										console.log(err);
										update();
									} else {
										db.query().update('ac_videos').set({
												'thumbnail_width': features.width,
												'thumbnail_height': features.height
											}).where('id = ?', [rows[i].id])
											.execute(update);
									}
								});
							} catch (e) {
								console.log(e);
								update();
							}
						} else {
							showDialogInfo(req, res, {
								message: 'Tamaños recacalculados',
								action: '/'
							});
						}
					}
					update();
					
				});
			}
		}
	});

	app.all('/admin/setids', function(req, res, next) {
		if (!req.session.user || req.session.user.level !== require('./modules/session')().USER_LEVEL_ADMIN) {
			showDialogError(req, res, {message: 'Aqui no hay nada. ¡Venga fuera de aqui!'});
			
		} else {
			if (typeof req.query.confirm == "undefined") {
				showDialogInfo(req, res, {
					message: '¿Seguro que quieres recacalcular y fijar TODOS los ids?',
					confirm: {
						yes: {
							label: '¡Sí coño!',
							action: '/admin/setids/?confirm'
						},
						no: {
							label: 'No.'
						},
					}
				});
				
			} else {
				db.query().select('id').from('ac_links').execute(function(err, rows) {
					var alphaid = require('../modules/alphaid');

					var i = -1;
					var updateAlphaId = function(err, result) {
						if (!err && i < rows.length - 1) {
							i++;
							db.query().update('ac_links').set({'alphaid': alphaid.hash(rows[i].id)}).where('id = ?', [rows[i].id])
								.execute(updateAlphaId);
						} else {
							showDialogInfo(req, res, {
								message: 'Ids recacalculados',
								action: '/'
							});
						}
					}
					updateAlphaId();
					
				});
			}
		}
	});

	app.all('/admin/delete/:type/:id/?', function(req, res, next) {
		if (!req.session.user || req.session.user.level !== require('../modules/session')().USER_LEVEL_ADMIN) {
			showDialogError(req, res, {message: 'Aqui no hay nada. ¡Venga fuera de aqui!'});
			
		} else {
			var type = req.params.type;
			if (['link'].indexOf(type) === -1) {
				showDialogError(req, res, {message: 'No sé como borrar eso'});
				
			} else {
				var id = parseInt(req.params.id);
				if (isNaN(id)) {
					showDialogError(req, res, {message: 'No sé como convertir ese ID a un número'});
					
				} else {
					if (typeof req.query.confirm == "undefined") {
						showDialogInfo(req, res, {
							message: '¿Seguro que quieres borrar el objeto de tipo "'+type+'" con ID "'+id+'"?',
							confirm: {
								yes: {
									label: '¡Sí coño!',
									action: '/admin/delete/'+type+'/'+id+'/?confirm'
								},
								no: {
									label: 'No.'
								},
							}
						});
						
					} else {
						deleteObject(type, id, function(err, message) {
							if(err) {
								showDialogError(req, res, {message: message});
								console.log(err);
								
							} else {
								showDialogInfo(req, res, {
									message: message,
									action: layout.urls.base
								});
							}
						});
						
					}
				}
			}
		}
	});
	
	var deleteObject = function(type, id, callback) {
		if (type == "link") {
			db.query().select('id').from('ac_links').where('id = ?', [id]).execute(function(err, rows) {
				if (err) {
					callback(err, 'No encuentro ID en la BD');
					
				} else {
					db.query().delete().from('ac_comments').where('link = ?', [id]).execute(function(err, rows) {
						if (err) {
							callback(err, 'Error al borrar comentarios');
							
						} else {
							db.query().delete().from('ac_videos').where('id = ?', [id]).execute(function(err, rows) {
								if (err) {
									callback(err, 'Error al borrar datos de video');
									
								} else {
									deleteObject("videoImage", id, function(err) {
										if (err) {
											console.log('could not delete video image', err);
										}
										
										db.query().select(['fbpost']).from('ac_links').where('id = ?', [id]).execute(function(err, rows) {
											if (err) {
												console.log(err);
											} else if (rows && rows.length === 1 && rows[0].fbpost !== null) {
												try {
													var fb = require('../modules/facebook');
													fb.accessToken(options.appid, options.appsecret,
															function(err, accessToken) {
														if (!err) {
															fb.delete(accessToken, rows[0].fbpost, function(err) {
																if (err) {
																	console.log(err);
																}
															});
														}
													});
												} catch (e) {
													console.log('exception when deleting facebook post', e);
													db.query(true).delete().from('ac_links').where('id = ?', [id]).execute(function(err, rows) {
														if (err) {
															callback(err, 'Error al borrar datos del enlace');
															
														} else {
															callback(null, 'Enlace y dependencias eliminados');
															
														}
													});
												}
											}
										
											db.query(true).delete().from('ac_links').where('id = ?', [id]).execute(function(err, rows) {
												if (err) {
													callback(err, 'Error al borrar datos del enlace');
													
												} else {
													callback(null, 'Enlace y dependencias eliminados');
													
												}
											});
										});
									});
								
								}
							});
						
						}
					});
				
				}
			});
		} else if (type == "videoImage") {
			
			var path = 'public/img/videos/thumb_'+id+'.jpg';
			require('path').exists(path, function(exists) {
				if (exists) {
					require('fs').unlink(path, callback);
					
				} else {
					callback();
					
				}
			});
			
		} else {
			callback('cannot delete object of unknown type "'+type+'"', 'Tipo de objeto incorrecto');
		}
	};

};