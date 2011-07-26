var Pink = {
	load: function() {
		var date = new Date();
		if (date.getMonth() != 11 || date.getDate() != 28) {
			return;
		}
		
		$(document.body).addClass("pink");
		
	}
}