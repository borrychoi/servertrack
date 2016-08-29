var express = require('express');
var cluster = require('cluster');
var jsonParser = require('body-parser').json();
var http = require('http');
var servertrack_router = require('./routes/handler').router;
var fs = require('fs');
var numCPUs = require('os').cpus().length;

var config;
try {
	config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));
}
catch (e) {
	config = {
		server: "localhost",
		port: 3001
	};
}
var app = module.exports = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
};

// configuration
app.use(allowCrossDomain);
app.use(jsonParser);
app.use(servertrack_router);
if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
	var server = http.createServer(app);

	var listener = server.listen(config.port, function(){
	  console.log("Express: listening on port %d in %s mode", listener.address().port, app.settings.env);
	});
}
