

module.exports = function(db) {

        var getComments = function(link, callback) {
                db.getComments(link.id, function(err, comments) {
                        if (!err) {
                                for(var i = 0; i < comments.length; i++) {
                                        if (comments[i].image_id > 0) {
                                                comments[i].image = {
                                                        'id': comments[i].image_id,
                                                        'width': comments[i].image_width,
                                                        'height': comments[i].image_height,
                                                        'filename': comments[i].image_filename,
                                                        'src': 'img/user/thumb/'+comments[i].image_id+'.png',
                                                        'href': 'img/user/'+comments[i].image_id+'.jpg'
                                                };
                                        }
                                        if (!comments[i].username) {
                                                comments[i].submitterName = comments[i].submitter_ref;
                                        }
                                }
                                link.comments = comments;
                        }
                        
                        callback(err, link);
                });
        };

        return {
                getLink: function(options, callback) {
                        if (typeof options == 'string') {
                                options = {'alphaid': options};
                        }
                        db.getLink(options.alphaid, function(err, link) {
                                if (err) {
                                        console.log(err);
                                        callback(err, []);
                                } else {
                                        var formatter = require('./timeformatter');
                                        link.antiquity = formatter.antiquity(link.timestamp);

                                        link.href = '/r/'+link.category_ref+'/'+link.alphaid+'/'+link.ref;

                                        if (options.comments) {
                                                getComments(link, callback);
                                        } else {
                                                callback(null, link);
                                        }
                                }
                        });
                }
        }
};