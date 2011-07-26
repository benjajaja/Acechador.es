BlingBling = {
	result: 34,
	load: function() {
		if (!BlingBling.isWebKit()) {
			return;
		}
		
		var label = $(document.createElement('label'));
		label.text("Cosas que parpadean:");
		
		var span = $(document.createElement('span'));
		span.css('display', 'block');
		label.append(span);
		
		var input = $(document.createElement('input'));
		input.attr('type', 'checkbox');
		input.attr('checked', false);
		
		span.text(' Entretenerme');
		span.prepend(input);
		
		$('#blingbling').addClass('box');
		$('#blingbling').append(label);

		input.click(BlingBling.click);
	},
	
	isWebKit: function isWebKit() {
	    return RegExp(" AppleWebKit/").test(navigator.userAgent);
	},
	
	click: function() {
		if (!this.checked) {
			$('body').removeClass('blingbling');
			$.cookie('acechador_blingbling', 0);
		} else {
			$('body').addClass('blingbling');
			var audio = document.getElementById('audioRuleta');
			if (!audio) {
				audio = document.createElement('audio');
				audio.setAttribute('id', 'audioRuleta');
				$(this).parent().append(audio);
				audio.setAttribute('src', 'img/static/ruleta.mp3');
				audio.addEventListener('loadeddata', function() {
					$(this).parent().append($(document.createElement('span')).text('...'));
					audio.play();
					//http://www.random.org/integers/?num=1&min=0&max=36&col=1&base=10&format=plain&rnd=new
					BlingBling.result = Math.floor(Math.random()*37);
				}, false);
				audio.addEventListener('ended', function() {
					var parent = $(audio).parent().parent();
					parent.text(BlingBling.result+'');
					var color = '#000';
					var reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
					for(var i = 0; i < reds.length; i++) {
						if (BlingBling.result == reds[i]) {
							color = '#c00';
							break;
						}
					}
					parent.css({
						display: 'block',
						fontSize: '3em',
						backgroundColor: color,
						color: '#fff',
						textAlign: 'center'
					});
				}, false);
				audio.load();
				
			} else {
				console.log(audio);
				audio.play();
				
			}
			
			
			$.cookie('acechador_blingbling', 1);
		}
	}
};