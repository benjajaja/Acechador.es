Comments = {
	form: null,
	file: null,
	url: null,
	attach: function(el) {
		var dropBox = el.find("#dropbox");
		dropBox[0].addEventListener("dragenter", Comments.cancelEvent, false);
		dropBox[0].addEventListener("dragover", Comments.cancelEvent, false);
		dropBox[0].addEventListener("drop", Comments.dropEvent, false);
		

		dropBox.find("input[type=file]").change(Comments.fileChange);
		
		var urlButton = dropBox.find("#dropbox-url");
		if (urlButton) {
			urlButton.click(Comments.promtUrl);
		}
		//dropBox.click(Comments.promtUrl);
		
		Comments.statusElement = el.find("#dropboxstatus");
	},
	
	promptUrl: function() {
		Comments.url = Comments.window.prompt("Pon la URL:");
		if (Comments.url != null) {
			Comments.file = null;
			Comments.statusElement.html(Comments.url);
		}
	},
	
	handleFiles: function(files) {
		if (files.length > 0) {
			Comments.file = files[0];
			Comments.statusElement.html(Comments.file.name);
		} else {
			Comments.file = null;
			Comments.statusElement.html("No has seleccionado ningún fichero");
		}		
	},
	
	dropEvent: function(e) {
		e.stopPropagation();
		e.preventDefault();
		
		var dt = e.dataTransfer;
		Comments.handleFiles(dt.files);
	},
	
	cancelEvent: function(e) {
		e.stopPropagation();
		e.preventDefault();
	},
	
	fileChange: function(e) {
		Comments.handleFiles(this.files);
	},
	
	comment: function(form) {
		Comments.form = form;
		
		if (!Comments.file) {
			Comments.post();
		} else {
			Comments.processFile();
		}
	},
	
	processFile: function() {
		var imageType = /image.*/;
		/*if copypasted an url into file dialog, type is an empty string
		if (!Comments.file.type.match(imageType)) {  
			Dialog.show({dialog: {
					title: "Error de imagen",
					message: "El formato no parece correcto."
				}}, Comments.form);
			console.log(Comments.file.type);
			return;
		}*/
		
		var reader = new FileReader(); 
		reader.onload = function() {
			console.log("file read");
			var img = $("<img/>");
			img.load(Comments.onImageLoad);
			img.error(function() {
				Dialog.show({dialog: {
					title: "Error de imagen",
					message: "No puedo acceder a la imagen seleccionada"
				}}, Comments.form);
				img.remove();
			});
			if (!Comments.container) {
				Comments.container = $("<div style=\"position:absolute;top:0;left:-100000px\"/>");
				$(document.body).append(Comments.container);
			}
			Comments.container.append(img);
			img[0].src = reader.result;
			console.log("img src set");
		};
		console.log("reading file...");
		reader.readAsDataURL(Comments.file);
	},
	
	onImageLoad: function(e) {
		console.log("img loaded");
		var img = $(e.target);
		
		
		var canvas = $("<canvas/>");
		canvas.attr("width", img.width());
		canvas.attr("height", img.height());
		
		var ctx = canvas[0].getContext("2d");
		ctx.drawImage(img[0], 0, 0);
		img.remove();
		
		
		Comments.post(canvas[0].toDataURL("image/jpeg"));
	},
	
	post: function(imagedata) {
		var data = {
			url: '/xhr/comment',
			type: 'POST',
			data: Comments.form.serializeArray(),
			dataType: 'json',
			success: Comments.success,
			error: Comments.error
		};
		if (imagedata) {
			data.data.push({name: "imagedata", value: imagedata});
		}
		jQuery.ajax(data);
		LoadingHint.show(Comments.form);
		return false;
	},
	
	success: function(data) {
		LoadingHint.hide();
		var comment = null;
		try {
			comment = data.comment;
		} catch (e) {
			console.log('exception');
			Comments.error();
			return;
		}
		if (comment == null) {
			console.log('.comment is null');
			Comments.error();
			return;
		}
		var commentElement = Skel.fetch("comment", comment);
		commentElement.css('display', 'none');
		commentElement.find("a.target_blank").attr("target", "_blank");
		
		var comments = $(".comments .comment");
		if (comments.length > 0) {
			$(comments[comments.length-1]).after(commentElement);
		} else {
			$(".comments").prepend(commentElement);
		}
		
		commentElement.fadeIn(2000);
		
		try {
			var dialog = Dialog.show(data.dialog, Comments.form, function() {
				dialog.close();
				
			});
		} catch (e) {
			console.log(e, data);
		}
	},
	error: function(request, status, e) {
		LoadingHint.hide();
		console.log(request);
		if (request && request.status == 500) {
			try {
				Dialog.show(jQuery.parseJSON(request.responseText).dialog, Comments.form);
			} catch (e2) {
				alert('Error interno');
				console.log(request, status, e, e2);
			}
		}
	}
};


