


module.exports = function(db) {
	var getLinks = function(options, callback) {
		options = options || {};
		options.page = options.page || 0;
		var pageLimit = 25;
		
		var query = db.query().select(['ac_links.*', {'username': 'ac_users.name'}, {'video_site': 'ac_videos.site'}, 
				{'video_ref': 'ac_videos.ref'}, {'category_name': 'ac_categories.name'}, {'category_ref': 'ac_categories.ref'},
				{'thumbnail_width': 'ac_videos.thumbnail_width'}, {'thumbnail_height': 'ac_videos.thumbnail_height'}
				])
				.from('ac_links')
				//.join({'type': 'LEFT', 'table': 'ac_users', 'conditions': 'ac_links.submitter_type = ? AND (ac_users.id = ac_links.submitter OR ac_users.name = ac_links.submitter)'}, [2])
				.join({'type': 'LEFT', 'table': 'ac_users', 'conditions': 'ac_links.submitter_type = ? AND ac_users.id = ac_links.submitter'}, [2])
				.join({'type': 'LEFT', 'table': 'ac_videos', 'conditions': 'ac_videos.type = ? AND ac_videos.id = ac_links.id'}, [1])
				//.join({'type': 'LEFT', 'table': 'ac_images', 'conditions': 'ac_images.origin = ? AND ac_images.parent = ac_links.id'}, [2])
				.join({'type': 'LEFT', 'table': 'ac_categories', 'conditions': 'ac_categories.id = ac_links.category'});
		if (options.where) {
			if (options.where.parameters) {
				query.where(options.where.clause, options.where.parameters);
			} else {
				query.where(options.where.clause);
			}
		}
		
		//console.log(query.sql());
		//var query = db.query().select('*').from('frontpage');
		if (options.where) {
			if (options.where.parameters) {
				query.where(options.where.clause, options.where.parameters);
			} else {
				query.where(options.where.clause);
			}
		}
		query.order({'timestamp': false, 'id': false});
		query.limit(pageLimit * options.page, pageLimit);
		query.execute(function(err, links) {
			if (err) {
				console.log(err);
				callback([], []);
				return;
			}
			
			
			var index = 0;
			var formatter = require('./timeformatter');
			var getLinkData = function() {
				/*links[index].thumbnail_width = links[index].thumbnail_width || 120;
				links[index].thumbnail_height = links[index].thumbnail_height || 120;*/
				links[index].antiquity = formatter.antiquity(links[index].timestamp);
				db.query().select([{'count': 'COUNT(id)'}]).from('ac_comments').where('link = ?', [links[index].id])
						.execute(function(err, comments) {
					links[index].comments = {'length': comments[0].count};
					index++;
					if (index < links.length) {
						getLinkData();
					} else {
						
						db.query().select([{'count': 'COUNT(id)'}]).from('ac_links').execute(function(err, count) {
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