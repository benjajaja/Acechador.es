LoginOffer = {
	offering: null,
	registration: false,
	attach: function(container, input) {
		LoginOffer.el = container;
		LoginOffer.input = input;
		
		input.keyup(LoginOffer.nameChange);
		input.blur(function() {
			if (LoginOffer.offering === false) {
				LoginOffer.offering = null;
			}
		});
	},
	
	nameChange: function(e) {
		if (LoginOffer.offering === null) {
			LoginOffer.el.find('input').each(function(i, inp) {
				inp.disabled = false;
			});
			LoginOffer.el.fadeIn('slow', function() {
				//LoginOffer.input.unbind('keyup', Submit.submitterChange);
				LoginOffer.offering = true;
			});
		}
	},
	
	isOffering: function() {
		return LoginOffer.offering ? true : false;
	},
	
	isRegistration: function() {
		return LoginOffer.registration ? true : false;
	},
	
	toggleRegister: function(el) {
		LoginOffer.registration = !LoginOffer.registration;
		if (!LoginOffer.registration) {
			$(el).text('Cambiar a "hacer cuenta nueva"');
			$('.registerOnly').hide();
			LoginOffer.el.find('input[name=islogin]').val('1');
		} else {
			$(el).text('Cambiar a "usar mi cuenta"');
			$('.registerOnly').css('display', 'block');
			LoginOffer.el.find('input[name=islogin]').val('0');
		}
	}

};