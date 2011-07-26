Votes = {
	vote: function(link, value) {
		jQuery.ajax({
			url: 'ajax/vote.php',
			data: {
				link: link,
				vote: value
			},
			success: Votes.success
		});
	},
	success: function(data) {
		if (typeof console == 'undefined') {
			return;
		}
		console.log(data);
	}
};