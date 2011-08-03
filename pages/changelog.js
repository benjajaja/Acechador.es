var fs = require('fs');
var datehelper = require('../modules/datehelper');
var exec = require('child_process').exec;

module.exports = function(app, layout) {
	app.get('/changelog/?', function(req, res, next) {
		try {
			getGitLog(function (err, data) {
				layout.render(req, res, {
						pageTemplate: 'page_changelog',
						commits: data
					});
			});
		} catch (e) {
			layout.render(req, res, dialog({
				message: '¡Ups! Me he hecho caca',
				action: layout.getReturnUrl(req, true),
				error: true
			}).asGlobal());
			console.log(e, e.stack);
		}
	});
};

var getGitLog = function(cb) {
	var each = function(array, fn) {
		for(var i = 0, ilen = array.length; i < ilen; i++) {
			fn(array[i], i, i === ilen-1);
		}
	};
	
	var result = [];
	exec('git log --pretty="format:%cd|%cn|%ce|%s|%b" --no-merges', function(error, stdout, stderr) {
		if(error) {
			cb(stderr);
			
		} else {
			each(stdout.split('\n'), function(line, i, last) {
				var parts = line.split('|');
				if (parts.length == 4) {
					result.push({
						date: datehelper.humanShort(new Date(parts[0])),
						message: parts[3],
						author: parts[1],
						email: parts[2]
					});
				}
				if (last) {
					cb(null, result);
				}
			});
		}
	});
};

var tailFile = function(path, count, callback) {
	fs.readFile(path, function (err, data) {
		var lines = data.toString().split('\n');
		var result = [];
		for(var i = lines.length - 1; i > 0 || i > lines.length - lines; i--) {
			var commit = {};
			var split = lines[i].split(">");
			if (split.length == 2) {
				split = split[1].split(' ');
				if (split.length > 0) {
					commit.date = datehelper.humanShort(new Date(parseInt(split[1]) * 1000));
				} else {
					continue;
				}
			} else {
				continue;
			}
			var split = lines[i].split("commit:");
			if (split.length == 2) {
				commit.message = split[1];
			} else {
				continue;
			}
			result.push(commit);
		}
		callback(err, result);
	});
};