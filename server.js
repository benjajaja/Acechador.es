var app = require('express').createServer();

app.get('/', function(req, res) {
	res.send('hola mundo');
});

app.listen(8000);
