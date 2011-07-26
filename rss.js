module.exports = function(app, db) {
	var handle = function(req, res, next){
		require('./linklistprovider')(db).getLinks({
				page: 0
			}, function(rows) {
			
			res.header('Content-Type', 'application/rss+xml; charset=utf-8');
			res.send(getRssXml(rows));
			
		});
	};
	app.all('/rss.xml', handle);
	app.all('/rss', handle);
	
	var getRssXml = function(rows) {
		var formatter = require('./datehelper');
		var string = '<?xml version="1.0" encoding="utf-8"?>';
		string += "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:content=\"http://purl.org/rss/1.0/modules/content/\">\
  <channel>\
    <title>Acechador.es</title>\
    <link>http://acechador.es/</link>\
    <atom:link rel=\"hub\" href=\"http://pubsubhubbub.appspot.com\"/>\
    <description>El rincón de los acechadores</description>\
    <language>es</language>\
    <atom:link href=\"http://acechador.es/rss.xml\" rel=\"self\" type=\"application/rss+xml\" />\
	<image>\
		<url>http://static.acechador.es/logo_small.png</url>\
		<title>Acechador.es</title>\
		<link>http://acechador.es/</link>\
		<height>100</height>\
		<width>100</width>\
	</image>";
	
		for(var i = 0, ilen = rows.length; i < ilen; i++) {
			string += "<item><guid>http://acechador.es/r/"+rows[i].category_ref+"/"+rows[i].alphaid+"/"+rows[i].ref+"</guid>";
			string += "<title>"+htmlEscape(rows[i].name)+"</title>";
			string += "<pubDate>"+formatter.getRFC822Date(rows[i].timestamp)+"</pubDate>";
			string += "<description>enviado por "+htmlEscape(rows[i].username ? rows[i].username : rows[i].submitter)+" en "+htmlEscape(rows[i].category_name)+"</description>";
			if (rows[i].video_id) {
				string += "<enclosure url=\"http://static.acechador.es/img/videos/thumb_"+rows[i].video_id+".jpg?id="+rows[i].video_ref+"\" length=\"3884\" type=\"image/jpeg\" />";
			}
			string += "</item>";
		}
		
		string += "</channel></rss>";
		return string;
	};
};

var htmlEscape = function(text) {
   return text.replace(/&/g,'&amp;').
     replace(/</g,'&lt;').
	 replace(/>/g,'&gt;');/*.
     replace(/"/g,'&quot;').
     replace(/'/g.'&#039;');*/
}