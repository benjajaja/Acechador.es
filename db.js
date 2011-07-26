var cache = {
	categories: null
};

module.exports = function db(options, callback) {
	var db = null;
	console.log("connecting to "+options.hostname+"...");
	new (require('db-mysql')).Database(options).connect(function(error) {
		if (error) {
			callback(error);
		} else {
			db = this;
			console.log("CONNECTED");
			callback();
		}
	});

	return {
		query: function() {
			console.log("WARNING: deprecated call to db.query()");
			return db.query();
		},

		getUser: function(name, password, callback) {
			db.query().select(['id', 'name', 'level', 'token']).from('ac_users')
				.where('name = ? AND hash = ?', [name, password]).limit(1)
				.execute(callback);
		},
		getUsers: function(name, callback) {
			db.query().select(['id']).from('ac_users').where('name = ?', [name]).limit(1).execute(callback);
		},
		createUser: function(name, hash, email, callback) {
			db.query().insert('ac_users',
						['name', 'hash', 'email', 'level', 'timestamp_registered', 'token'],
						[name, hash, email, 1, new Date(), '0'])
					.execute(callback);
		},

		getLinks: function(filter, limit, callback) {
			var query = db.query().select(['ac_links.*', {'username': 'ac_users.name'}, {'video_site': 'ac_videos.site'}, 
					{'video_ref': 'ac_videos.ref'}, {'category_name': 'ac_categories.name'}, {'category_ref': 'ac_categories.ref'},
					{'thumbnail_width': 'ac_videos.thumbnail_width'}, {'thumbnail_height': 'ac_videos.thumbnail_height'}
					])
					.from('ac_links')
					.join({'type': 'LEFT', 'table': 'ac_users', 'conditions': 'ac_links.submitter_type = ? AND ac_users.id = ac_links.submitter'}, [2])
					.join({'type': 'LEFT', 'table': 'ac_videos', 'conditions': 'ac_videos.type = ? AND ac_videos.id = ac_links.id'}, [1])
					.join({'type': 'LEFT', 'table': 'ac_categories', 'conditions': 'ac_categories.id = ac_links.category'});
			applyFilter(query, filter);
			query.order({'timestamp': false, 'id': false});
			query.limit(limit[0], limit[1]);
			query.execute(callback);
		},
		getLinkCommentCount: function(id, callback) {
			db.query().select([{'count': 'COUNT(id)'}]).from('ac_comments').where('link = ?', [id])
						.execute(callback);
		},
		getLinkCount: function(filter, callback) {
			var query = db.query().select([{'count': 'COUNT(id)'}]).from('ac_links');
			applyFilter(query, filter);
			query.execute(callback);
		},

		getLink: function(alphaid, callback) {
			db.query().select(['ac_links.*', {'username': 'ac_users.name'}, {'video_site': 'ac_videos.site'}, 
					{'video_ref': 'ac_videos.ref'}, {'category_name': 'ac_categories.name'}, {'category_ref': 'ac_categories.ref'},
					{'thumbnail_width': 'ac_videos.thumbnail_width'}, {'thumbnail_height': 'ac_videos.thumbnail_height'}
					])
					.from('ac_links')
					.join({'type': 'LEFT', 'table': 'ac_users', 'conditions': 'ac_links.submitter_type = ? AND (ac_users.id = ac_links.submitter OR ac_users.name = ac_links.submitter)'}, [2])
					.join({'type': 'LEFT', 'table': 'ac_videos', 'conditions': 'ac_videos.type = ? AND ac_videos.id = ac_links.id'}, [1])
					.join({'type': 'LEFT', 'table': 'ac_categories', 'conditions': 'ac_categories.id = ac_links.category'})
					.where('ac_links.alphaid = ?', [alphaid])
					.order({'timestamp': false, 'id': false})
					.limit(1)
					.execute(callback);
		},
		getComments: function (id, callback) {
			db.query().select(['ac_comments.*', {'username': 'ac_users.name'}, {'image_id': 'ac_images.id'},
				{'image_width': 'ac_images.thumb_width'}, {'image_height': 'ac_images.thumb_height'},
				{'image_filename': 'ac_images.filename'}])
				.from('ac_comments')
				.join({'type': 'LEFT', 'table': 'ac_users', 'conditions': 'ac_comments.submitter_type = ? AND ac_users.id = ac_comments.submitter_ref'}, [2])
				.join({'type': 'LEFT', 'table': 'ac_images', 'conditions': 'ac_images.origin = ? AND ac_images.parent = ac_comments.id'}, [1])
				.where('link = ?', [id])
				.execute(callback);
		},

		getCategories: function(callback) {
			if (cache.categories === null) {
				db.query().select(['id', 'ref', 'name']).from('ac_categories').execute(function(err, rows) {
					cache.categories = rows;
					callback(null, cache.categories);
				});
			} else {
				callback(null, cache.categories);
			}
		},
		getCategory: function(ref, callback) {
			var getCategory = function(ref) {
				for(var i = 0, ilen = cache.categories.length; i < ilen; i++) {
					if (cache.categories[i].ref == ref) {
						return cache.categories[i];
					}
				}
				return null;
			};
			if (cache.categories === null) {
				db.query().select(['id', 'ref', 'name']).from('ac_categories').execute(function(err, rows) {
					cache.categories = rows;
					callback(null, getCategory(ref));
				});
			} else {
				callback(null, getCategory(ref));
			}
		},

		createLink: function(url, title, ref, userType, userReference, category, callback) {
			db.query().insert('ac_links',
				['url', 'name', 'ref', 'submitter_type', 'submitter', 'category', 'flags'],
				[url, title, ref, userType, userReference, category, 0])
			.execute(function(err, result) {
				if (err) {
					callback(err);
					
				} else {
					var id = result.id;
					var hash = require('./alphaid').hash(id);
					db.query().update('ac_links').set({'alphaid': hash}).where('id = ?', [id])
							.execute(function(err, result) {
						if (err) {
							console.log('could not update alphaid!');
						}
						callback(null, id, hash);
					});
					
					
				}
			});
		},
		createLinkVideo: function(id, type, site, ref, width, height, callback) {
			db.query().insert('ac_videos',
				['id', 'type', 'site', 'ref', 'thumbnail_width', 'thumbnail_height'],
				[id, type, site, ref, width, height])
			.execute(callback);
		},

		createComment: function(link, text, type, ref, callback) {
			db.query().insert('ac_comments',
				['link', 'comment', 'submitter_type', 'submitter_ref', 'parent', 'timestamp'],
				[link, text, type, ref, 0, new Date()])
			.execute(callback)
		},

		createImage: function(origin, id, filename, width, height, thumbWidth, thumbHeight, size, callback) {
			db.query().insert('ac_images',
				['origin', 'parent', 'filename', 'width', 'height', 'thumb_width', 'thumb_height', 'timestamp', 'size', 'data'],
				[origin, id, filename, width, height, thumbWidth, thumbHeight, new Date(), size, ''])
			.execute(callback);
		}
	};
};

var applyFilter = function(query, filter) {
	if (filter) {
		if (filter.fields) {
			for(var i = 0, ilen = filter.fields.length; i < ilen; i++) {
				query.where(filter.fields[i]+' LIKE ?', ['%'+filter.value+'%']);
			}
		} else {
			query.where(filter.value);
		}
	}
};