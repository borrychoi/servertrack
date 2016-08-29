'use strict';

var metrics = require('../lib/metricsStore');
var express = require('express');
var router = express.Router();
var winston = require('winston');

const MAX_NAME_SZ = 64;
exports.router = router;

var logger = 
    new winston.Logger({transports: [
        new (winston.transports.File)({filename: 'servertrack.log', timestamp: true})
	]});

// servertrack/:server_name/add
var add = function(req, res) {
    var serverName = req.params.server_name.trim().toLowerCase();
    var load = req.body;
    console.log("add:/servertrack/"+serverName+"/add");
	if (serverName.length == 0) {
    	res.status(500).send({message: "invalid server name"});
    	return;
	}
	if (serverName.length > MAX_NAME_SZ) {
    	res.status(500).send({message: "too long server name"});
    	return;
	}
		
    metrics.add(serverName, load, function(err, result) {
        if (err) {
        	res.status(400).send({message: result.message});
        }
        else {
        	res.json({message: "success"});
        }
    });
};

// servertrack/:server_name/report/:type
var report = function(req, res) {
    var serverName = req.params.server_name.trim().toLowerCase();;
    var type = req.params.type.toLowerCase();

    console.log("report:/servertrack/"+serverName+"/report/"+type);
	if (type != "byminute" && type != "byhour") {
    	res.status(500).send({message: "invalid report type"});
    	return;
	}
	if (serverName.length == 0) {
    	res.status(500).send({message: "invalid server name"});
    	return;
	}
	if (serverName.length > MAX_NAME_SZ) {
    	res.status(500).send({message: "too long server name"});
    	return;
	}
		
    metrics.report(serverName, type, function(err, result) {
    	if (err) {
    		res.status(404).send({message: "not found"});
    	}
    	else {
    		console.log("report:"+type+" for "+serverName+":");
    		console.log(result);
    		res.json(result);
    	}
    })
};

router.use(function (req, res, next) {
    logger.info(req.method + ' request from ' + req.url);
    next();
});

router.use(function (err, req, res, next) {
    logger.error(err);
    res.status(400).send({message: 'Invalid request format'});
});


router.post('/servertrack/:server_name/add', add);
router.get('/servertrack/:server_name/report/:type', report);

