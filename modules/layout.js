var tips = [
	'<span style=""><sup style="font-size: 1.3em">&#9835;</sup>&#9834;&#9835; <sup style="font-size: 1.3em">&#9835;</sup>&#9835;&#9834; <sup style="font-size: 1.3em">&#9834;</sup>&#9834; <sup style="font-size: 1.3em">&#9835;</sup>&#9835; <sup style="font-size: 1.3em">&#9835;</sup>&#9834;&#8230;</span>',
	'las drogas no son tan malas como las pintan?',
	'el 87% de las estadística son mentira?',
	'ahí estás seguro?',
	'no eres paranoico si de verdad van a por tí?',
	'tu no estás loco, <em>ellos</em> están locos?',
	'&#9881; &#9883; &#9762; &#9763; &#9832; ?'	,
	'la presa está a punto de caer?',
	'hay gente que nace con un don? Tu eres acechador.',
	'puede que hoy no hayas acechado lo suficiente?',
	'tus padres, los profesores, y la policía, ESTÁN TODOS EN TU CONTRA?',
	'no hay forma de probar que el mundo es real?',
	'la posibilidad de que mueras o sufras un accidente mientras acechas es casi cero?',
	'si duermes no acechas? Asi que ponte un café.',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> haciendo <strong>click</strong> con el <strong>botón del centro</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> pulsando <strong>CTRL</strong> mientras haces <strong>click</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> haciendo <strong>click</strong> con el <strong>botón del centro</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> pulsando <strong>CTRL</strong> mientras haces <strong>click</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> haciendo <strong>click</strong> con el <strong>botón del centro</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> pulsando <strong>CTRL</strong> mientras haces <strong>click</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> haciendo <strong>click</strong> con el <strong>botón del centro</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> pulsando <strong>CTRL</strong> mientras haces <strong>click</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> haciendo <strong>click</strong> con el <strong>botón del centro</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> pulsando <strong>CTRL</strong> mientras haces <strong>click</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> haciendo <strong>click</strong> con el <strong>botón del centro</strong>?',
	'puedes <strong>abrir</strong> enlaces en una <strong>pestaña nueva</strong> pulsando <strong>CTRL</strong> mientras haces <strong>click</strong>?',
	'tienes que acechar siempre?',
	'Google Chrome es más rápido que Firefox*, y está basado en Chromium que es open source? <a href="http://www.google.com/chrome" style="font-size: 0.8em; font-weight: bold">Descárgalo aqui</a>. <sub style="display:block;font-size:0.7em;font-style:italic">*que también está muy bien</sub>',
	'acechar está bien?',
	'tienes que acechar más?',
	'tienes que acechar más?',
	'tienes que acechar más?',
	'acechar viene de "acechar la pantalla"?',
	'en algunos países acechar es un delito? Piensa en ello y disfruta acechando.',
	'la muerte le llega al rico y al acechador?',
	'hay más de mil formas de acechar?',
	'San Estepano es el santo de los acechadores?',
	'acechar es bueno?',
	'acechar es cosa de uno, trolear es cosa de varios?',
	'no debes renegar a ser acechador?',
	'das internet macht frei?',
	'acechar garantiza* resultados satisfactorios? <sub style="display:block;font-size:0.7em;font-style:italic;line-height:1em">*acechador.es no garantiza una mierda</sub>',
	'el servidor de esta página está hecho con JavaScript?',
	'la bandica gestiona fuerte?',
	'hay que llevar polo los sábados?'
];


var merge = function(base, extending) {
	if (typeof extending != undefined && extending !== null) {
		for(var key in extending) {
			base[key] = extending[key];
		}
	}
	return base;
};

var dialog = function(data, req, isError) {
	if (isError) {
		var defaults = {
			title: 'Error',
			className: 'dialogError',
			message: 'Ha ocurrido un error, y ni siquiera tiene un mensaje específico, así que no puedo hacer nada para ayudarte.',
			icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>'
		};
	} else {
		var defaults = {
			title: 'Información',
			className: null,
			message: 'Hay un mensaje del sistema, pero a alguien se le ha olvidado poner el contenido.',
			icon: 'i'
		};
	}
	
	defaults.buttonLabel = 'Volver';

	return merge(defaults, data);
};



module.exports = function(options, session) {
	var o = {
		session: session
	};

	o.urls = {
		base: 'http://' + options.domains.www,
		static: 'http://' + options.domains.static
	};
	if (!options.production) {
		o.urls.base += ':8888';
	}
	
	var globals = function(req, override) {
		var globals = {
			styleSheetCacheVersion: options.cacheTag,
			urls: o.urls,
			title: 'Acechador.es',
			tip: tips[Math.floor(Math.random() * (tips.length - 1))]
			
		};
		
		
		if (req.session && req.session.user) {
			globals.login = {
				name: req.session.user.name,
				isAdmin: req.session.user.level === require('./session')().USER_LEVEL_ADMIN
			};
		}
		
		return merge(globals, override);
	};
	
	var globalsDialog = function(req, override, isError) {
		override.pageTemplate = 'dialog';
		override.dialog = dialog(override, req, isError);

		var referer = req.header('Referer') || req.header('Referrer') || '';
		if (referer.substring(0, o.urls.base.length) == o.urls.base) {
			override.dialog.action = referer.substring(o.urls.base.length);
			console.log('action: '+referer.substring(o.urls.base.length));
		} else {
			override.dialog.action = '/?noreferrer';
		}

		return globals(req, override);
	};
	

	var gzip = require('gzip');
	var minify = require('html-minifier').minify;
	o.render = function(req, res, data) {
		data = data || null;
		var timeStart = new Date().getTime();
		res.render('index', globals(req, data), function(err, data) {
			if (err) {
				res.send('<pre>Error: '+err+'\n'+err.stack);
				console.log(err.toString(), err.stack);
				return;
			}
			
			if (typeof req.query.mini != 'undefined') {
				gzip(minify(data, {
							removeComments: true,
							removeCommentsFromCDATA: false,
							removeCDATASectionsFromCDATA: false,
							collapseWhitespace: false,
							collapseBooleanAttributes: true,
							removeAttributeQuotes: true,
							removeRedundantAttributes: false,
							removeEmptyAttributes: false,
							removeEmptyElements: false,
							removeOptionalTags: false,
							removeScriptTypeAttributes: false,
							removeStyleLinkTypeAttributes: false
						}).replace(/\n/, ''), function(err, data) {
					if (err) throw err;
					res.header('Content-Encoding', 'gzip');
					res.header('Content-Type', 'text/html; charset=utf-8');
					res.send(data);
				});
			} else {
				gzip(data, function(err, data) {
					if (err) throw err;
					res.header('Content-Encoding', 'gzip');
					res.header('Content-Type', 'text/html; charset=utf-8');
					res.send(data);
				});
			}
		});
		console.log('Took '+(new Date().getTime() - timeStart)+' ms to render view');
	};
	
	o.showDialogError = function(req, res, dialogData) {
		res.render('index', globalsDialog(req, dialogData, true));	
	};
	o.showDialogInfo = function(req, res, dialogData) {
		res.render('index', globalsDialog(req, dialogData));	
	};
	
	o.handle = function(handler) {
		return function(req, res, next) {
			if (typeof handler == "object") {
				console.log("deprecated call to o.handle with object as parameter, pass a function instead");
				handler.handle(req, res, next);
			} else {
				handler(req, res, next);
			}
		};
	};
	return o;
};