


module.exports = function(db) {
	var getLinks = function(options, callback) {
		options = options || {};
		options.page = options.page || 0;
		var pageLimit = 25;

		db.getLinks(options.filter, [pageLimit * options.page, pageLimit], function(err, links) {
			if (err) {
				console.log(err);
				callback([], []);
				return;
			}
			
			
			var index = 0;
			var formatter = require('./timeformatter');
			var getLinkData = function() {
				links[index].antiquity = formatter.antiquity(links[index].timestamp);
				db.getLinkCommentCount(links[index].id, function(err, comments) {
					links[index].comments = {'length': comments[0].count};
					index++;
					if (index < links.length) {
						getLinkData();
					} else {
						db.getLinkCount(options.filter, function(err, count) {
							if (err) throw err;
							var count = Math.ceil(count[0].count / pageLimit);
							var pages = [];
							for(var i = 0; i < count; i++) {
								pages.push({num: i+1, active: i == options.page});
							}
							callback(links, pages);
						});
					}
				});
			};
			if (links.length > 0) {
				getLinkData();
			} else {
				callback(links, []);
			}
		});
	};
	return {
		getLinks: getLinks
	};
};