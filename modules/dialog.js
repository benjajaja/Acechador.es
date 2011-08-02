module.exports = function(data) {
	if (data.error) {
		delete data.error;
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

	for(var p in defaults) {
		if (typeof data[p] == 'undefined') {
			data[p] = defaults[p];
		}
	}
	
	
	data.asGlobal = function(global) {
		global = global || {};
		global.dialog = data;
		global.pageTemplate = 'dialog';
		
		return global;
	};
	
	return data;
};

