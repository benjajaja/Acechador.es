module.exports = function db(options) {
	var db = null;
	console.log("connecting to "+options.hostname+"...");
	new (require('db-mysql')).Database(options).connect(function(error) {
		if (error) {
			options.callback(error);
		} else {
			db = this;
			console.log("CONNECTED");
			options.callback();
		}
	});
	return {
		query: function() {
			return db.query();
		}
	};
};