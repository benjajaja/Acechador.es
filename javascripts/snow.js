Snow = {
	load: function(count, radius) {
		var canvas = $("<canvas/>").appendTo($("#as"));
		if (!canvas[0].getContext) {
			return;
		}
		
		canvas.click(function() {
			clearInterval(Snow.interval);
			canvas.remove();
			window.location = $("#as-link").attr("href");
		});
		
		Snow.width = $("#as").width();
		Snow.height = $("#as").height();
		canvas.attr("width", Snow.width);
		canvas.attr("height", Snow.height);
		canvas.css("cursor", "pointer");
		
		Snow.ctx = canvas[0].getContext("2d");
		
		//canvas.css("display", "none");
		canvas.css({
			"position": "absolute",
			"top": "0"
		});
		
		Snow.flakes = [];
		
		for(var i = 0; i < count; i++) {
			Snow.flakes[i] = [
			    radius+Math.random() * (Snow.width - radius),
			    -radius,
			    0.2 * radius + Math.random() * (0.8 * radius)
			];
		}
		/*var lingrad = Snow.ctx.createLinearGradient(0, 0, Snow.width, Snow.height);
		lingrad.addColorStop(0, '#003366');
		lingrad.addColorStop(1, '#000000');
		Snow.ctx.fillStyle = lingrad;
		Snow.ctx.fillRect(0, 0, Snow.width, Snow.height);
		Snow.ctx.save();*/
		
		Snow.interval = setInterval(Snow.animate, 50);
	},
	
	animate: function() {
		Snow.draw();
		Snow.fall();
		Snow.checkPositions();
	},
	
	draw: function() {
		Snow.ctx.clearRect(0, 0, Snow.width, Snow.height);
		
		for(var i = 0; i < Snow.flakes.length; i++) {
			Snow.ctx.fillStyle = "rgba(255, 255, 255, "
				+ (0.9 * (Snow.height - Snow.flakes[i][1]) / Snow.height) + ")";
			Snow.ctx.beginPath();
			Snow.ctx.arc(Snow.flakes[i][0], Snow.flakes[i][1], Snow.flakes[i][2], 0, Math.PI * 2, true);
			Snow.ctx.closePath();
			Snow.ctx.fill();
		}
	},
	
	fall: function() {
		var step = 0.4;
		for(var i = 0; i < Snow.flakes.length; i++) {
			Snow.flakes[i][1] += step*Snow.flakes[i][2];
		}
	},
	
	checkPositions: function() {
		for(var i = 0; i < Snow.flakes.length; i++) {
			if (Snow.flakes[i][1] > Snow.height + Snow.flakes[i][2]) {
				Snow.flakes[i][0] = Snow.flakes[i][2] + Math.random() * (Snow.width - Snow.flakes[i][2]);
				Snow.flakes[i][1] = -Snow.flakes[i][2];
			}
		}
	}
};