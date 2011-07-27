var userpost = require('./userpost');

var TYPE_LINK = 1;

module.exports = function(app, session, db) {
	app.post('/xhr/vote/?', function(req, res) {
		userpost.getRequestUserData(session, req.body, req, function(err, user) {
			if (err || user.type !== userpost.USER_REGISTERED) {
				res.send({dialog: {
						title: 'Error',
						className: 'dialogError',
						message: 'Tienes que estar registrado para votar',
						icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>'					}}, 500);

			} else {
				if (req.body.link) {
					db.hasVoted(user.id, TYPE_LINK, req.body.link, function(err, hasVoted, vote, linkId) {
						if (err) {
							res.send({dialog: {
							title: 'Error',
							className: 'dialogError',
							message: 'No he podido comprobar si ya has votado',
							icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>'					}}, 500);
							console.log(err);
						} else {
							var set = true;
							var callback = function(err, total) {
								if (err) {
									res.send({dialog: {
									title: 'Error',
									className: 'dialogError',
									message: 'No he podido guardar el voto',
									icon: '<span class="lefteye">&times</span><span class="righteye">&times</span><span class="mouth">&#8994;</span>'					}},
									500);
									console.log(err);
								} else {
									res.send({set: set, total: total});

								}
							};
							
							if (hasVoted) {
								if (vote == req.body.vote) {
									set = false;
									db.clearVote(user.id, TYPE_LINK, linkId, callback);
									
								} else {
									db.changeVote(user.id, TYPE_LINK, linkId, (vote ? -1 : 1), callback);
								}
								
							} else {
								db.createVote(user.id, TYPE_LINK, linkId, (req.body.vote ? 1 : -1), callback);
							}
						}
					});
				}
			}
		});
	});
};