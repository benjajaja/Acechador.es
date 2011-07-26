Auth = {
	register: function() {
		var dlg = $(document.createElement('div'));
		dlg.attr('title', 'Rrgistro');
		dlg.html(Auth.getRegisterForm());
		$(document.body).append(dlg);
		dlg.dialog({
			modal: true,
			closeText: '×'
		});
	},
	getRegisterForm: function() {
		var form = $(document.createElement('div'));
		var lblName = $(document.createElement('label'));
		lblName.html('Nombre');
		var inpName = $(document.createElement('input'));
		lblName.append(inpName);
		form.append(lblName);
		return form;
	}
};