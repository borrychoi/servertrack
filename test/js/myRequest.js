var agent = require('request');
var time = require('time');

var method = MyRequest.prototype;

function MyRequest(baseUrl, basePort) {
    this.baseUrl = baseUrl;
    this.basePort = basePort;    
    this.requestUrl = "http://"+this.baseUrl+":"+this.basePort.toString();
    this.header = {
        "Content-Type": "application/json"
    };
}

method.add = function(server_name, load, cb) {
    var endpoint = "/servertrack/"+server_name+"/add"
    var options = {
        url: this.requestUrl+endpoint,
        headers: this.header,
        body: load,
        json: true
    };

    agent.post(options, function(err, response, body) {
        if (err) {
            cb(true, 500);
        }
        else {
        	if (response.statusCode == 200) {
        		//console.log(body);
        		cb(false, body);
        	}
        	else {
        		cb(true, response.statusCode)
        	}
        }
    });
}

method.report = function(server_name, type, cb) {
    var endpoint = "/servertrack/"+server_name+"/report/"+type;
    var options = {
        url: this.requestUrl+endpoint,
        headers: this.header,
        json: true
    };

    agent.get(options, function(err, response, body) {
        if (err) {
            cb(true, 500);
        }
        else {
        	if (response.statusCode == 200) {
        		//console.log(body);
        		cb(false, body);
        	}
        	else {
        		cb(true, response.statusCode)
        	}
        }
    });
}

module.exports = MyRequest;