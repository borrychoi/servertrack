'use strict';
 
var time = require('time');
 
if (!Array.prototype.groupBy) {
    Array.prototype.groupBy = function (f)
    {
        var groups = {};
        this.forEach(function(o) {
            var group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o); 
        });
      
        return Object.keys(groups).map(function (group) {
            return groups[group];
        });
    };
}
 
 
// assume that maximum 2k load metrics records from one server per day
const MAX_RECORDS = 2000;
var metricsStore = {};
 
var isValidLoadNumber = function(number) {
	return typeof(number) === 'number' && number >= 0.0 && number <= 100.0;
}
var sanityCheck = function(load) {
    if (load == null) {
       return({success:false, message:"load == null"});
    }
	if (isValidLoadNumber(load.cpu) == false)
		return({success:false, message:"invalid cpu data"});
	
	if (isValidLoadNumber(load.mem) == false)
		return({success:false, message:"invalid mem data"});

	return({success: true, message:""});
}
 
var sumCpu = function(prev, load) {
    return prev+load.cpu;
}
var sumMem = function(prev, load) {
    return prev+load.mem;
}
 
var getAvg = function(arr) {
    var avgCpu = arr.reduce(sumCpu, 0.0)/arr.length;
    var avgMem = arr.reduce(sumMem, 0.0)/arr.length;
    console.log(avgCpu.toFixed(2));
    console.log(avgMem.toFixed(2));
    return {basetime: arr[0].timestamp, avgCpu: avgCpu, avgMem: avgMem};
};
 
var getAvg2 = function(arr) {
	var totCpu = 0.0;
	var totMem = 0.0;
	
	for (var x = 0; x < arr.length; x++) {
		totCpu += arr[x].cpu;
		totMem += arr[x].mem;
	}
    var avgCpu = totCpu/arr.length;
    var avgMem = totMem/arr.length;
    return {basetime: arr[0].timestamp, avgCpu: avgCpu, avgMem: avgMem};
};
 
var filterBy = function(loads, from, pastInSecond) {
    var filtered = loads.filter(function(load) {
        if (load.timestamp <= from && load.timestamp >= (from - pastInSecond))
            return true;
        else
            return false;
    });
    return filtered;
}
 
var groupBy = function(loads, from, groupInSecond) {
    var groups = loads.groupBy(function(load) {
        var delta = from - load.timestamp;
        return Math.floor(delta/groupInSecond);
    })
    return groups;
}

//load = {cpu:double, mem:double}
var add = function(server_name, load, cb) {
	var result = sanityCheck(load);
	if (result.success == false) {
		cb != null && cb(true, result);
		return;
	}
	
    //console.log("adding to "+server_name+":"+JSON.stringify(load));
	
    var now = time.time();
    var metric = {timestamp: now, cpu: load.cpu, mem: load.mem};
    if (metricsStore[server_name] == null) {
        metricsStore[server_name] = {current: 0, loads: []};
    }
    var serverMetrics = metricsStore[server_name];
    var loads = serverMetrics.loads;
    loads[serverMetrics.current] = metric;
    serverMetrics.current++;
    if (serverMetrics.current >= MAX_RECORDS) {
        serverMetircs.current = 0;
    }
    //console.log("add: current="+serverMetrics.current);
    cb != null && cb(false, result);
}
 
var report = function(server_name, type, cb) {
	var pastInSecond = 60*60;	
	var groupInSecond = 60;
	if (type == 'byhour') {
		pastInSecond = 60*60*24;
		groupInSecond = 60*60;
	}
	
    var serverReports = [];
    var serverMetrics = metricsStore[server_name];
    if (serverMetrics == null) {
    	cb != null && cb(true, null)
    	return;
    }
    var loads = serverMetrics.loads;
    //console.log(loads);
    var now = time.time();
    var filtered = filterBy(loads, now, pastInSecond);
    //console.log(filtered);
    var grouped = groupBy(filtered, now, groupInSecond);
    //console.log(grouped);
    
    grouped.forEach(function(arr) {
    	var result = getAvg2(arr);
    	serverReports.push(result);
    });
    //console.log(report);
    cb != null && cb(false, serverReports);
}
 
exports.add= add;
exports.report = report;
