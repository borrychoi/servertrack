'use strict';

var mock = require('mock');
var assert = require('chai').assert;
var moment = require('moment');
var MyRequest = require('./myRequest');

var config;
try {
	config = JSON.parse(fs.readFileSync('../../config/config.json', 'utf8'));
}
catch (e) {
	config = {
		"server": "localhost",
		"port": 3001
	};
}
var serializeTasks = function(arr, fn, done)
{
    var current = 0;

    fn(arr[current], function iterate() {
        if (++current < arr.length) {
            fn(arr[current], iterate);
        } else {
            done();
        }
    });
}

var request = new MyRequest(config.server, config.port);

describe('#ServerTrack', function() {
    describe('#parameters', function() {
    	var sample = {cpu:3.7, mem:98.3};
    	it('#add - should return error when server name is empty', function(done) {
        	request.add("", sample, function(err, result) {
        		assert.equal(err==true && result==404, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when server name is space-only', function(done) {
        	request.add("     ", sample, function(err, result) {
        		assert.equal(err==true && result==500, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when server name is too long - longer than 64 bytes', function(done) {
    		var very_long_server_name = "server_name_123456789012345678901234567890123456789012345678901234567890";
        	request.add(very_long_server_name, sample, function(err, result) {
        		assert.equal(err==true && result==500, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when server name is 1-byte length', function(done) {
        	request.add("a", sample, function(err, result) {
        		assert.equal(err, false, 'add: return error - '+result);
        		done();
        	});
    	})
    	it('#report - should return error when report type is emtry', function(done) {
        	request.report("myserver", "", function(err, result) {
        		assert.equal(err==true && result==404, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#report - should return error when report type is space-only', function(done) {
        	request.report("myserver", "    ", function(err, result) {
        		assert.equal(err==true && result==404, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#report - should return error when report type is unknown', function(done) {
        	request.report("myserver", "unknown", function(err, result) {
        		assert.equal(err==true && result==500, true, 'add: return success - '+result);
        		done();
        	});
    	})
    })

    describe('#add-endpoint', function() {
    	var server_name = "myServer";
    	var sample;
        beforeEach(function () {
            sample = {cpu:3.7, mem:98.3};
        });
    	it('#add - should return success when add valid load data', function(done) {
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when cpu load == 0.0', function(done) {
    		sample.cpu = 0.0;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when mem load == 0.0', function(done) {
    		sample.mem = 0.0;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when cpu load == 100.0', function(done) {
    		sample.cpu = 100.0;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when mem load == 100.0', function(done) {
    		sample.mem = 100.0;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when cpu load is missing', function(done) {
    		delete sample.cpu;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when mem load is missing', function(done) {
    		delete sample.mem;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when cpu load is not number type', function(done) {
    		sample.cpu = "0.0";
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when mem load is not number type', function(done) {
    		sample.mem = "0.0";
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when cpu load is negative value', function(done) {
    		sample.cpu *= -1.0;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when mem load is negative value', function(done) {
    		sample.mem *= -1.0;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when cpu load is greater than 100.0', function(done) {
    		sample.cpu += 100.0;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when mem load is greater than 100.0', function(done) {
    		sample.mem += 100.0;
        	request.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    })
    describe('#report-endpoint', function() {
    	var server_name = "myServer";
    	var samples;
        describe('#scenario - add & get reports should return non-empty result', function() {
            beforeEach(function () {
                samples = [
                	{cpu:3.7, mem:98.3},
                	{cpu:13.7, mem:88.3},
                	{cpu:23.7, mem:78.3},
                	{cpu:33.7, mem:68.3},
                	{cpu:43.7, mem:58.3},
                	{cpu:53.7, mem:48.3},
                	{cpu:63.7, mem:38.3},
                	{cpu:73.7, mem:28.3},
                	{cpu:83.7, mem:18.3},
                	{cpu:93.7, mem:8.3}
                ];
            });
	        it('#report - add records and get byMinute report', function(done) {
	            var run = function(sample, next) {
	                request.add(server_name, sample, function(err, result) {
	            		assert.equal(err, false, 'add: return err - '+result);
	                    next();
	                });
	            }
	            serializeTasks(samples, run, done);       
	        })
	        it('#report - get byMinute report', function(done) {
	            request.report(server_name, 'byMinute', function(err, result) {
	        		assert.equal(err, false, 'report: return err - '+result);
	        		assert.equal(result.length > 0, true);
	        		//console.log(result);
	                done();
	            });
	        })
	        it('#report - get byHour report', function(done) {
	            request.report(server_name, 'byHour', function(err, result) {
	        		assert.equal(err, false, 'report: return err - '+result);
	        		assert.equal(result.length > 0, true);
	        		//console.log(result);
	                done();
	            });
	        })
        })
        describe('#scenario - no data & get reports should return error', function() {
        	var server_name = "serverWithNoData";
	        it('#report - get byMinute report', function(done) {
	            request.report(server_name, 'byMinute', function(err, result) {
	        		assert.equal(err, true, 'report: return success - '+result);
	        		assert.equal(result, 404);
	                done();
	            });
	        })
	        it('#report - get byHour report', function(done) {
	            request.report(server_name, 'byHour', function(err, result) {
	        		assert.equal(err, true, 'report: return success - '+result);
	        		assert.equal(result, 404);
	                done();
	            });
	        })
        })
    })

    describe('#add-mock', function() {
    	var server_name = "myServer";
    	var sample;
    	var store;
        beforeEach(function () {
            sample = {cpu:3.7, mem:98.3};
            store = mock('../../lib/metricsStore', {}, require);
        });
    	it('#add - should return success when add valid load data', function(done) {
        	store.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when cpu load == 0.0', function(done) {
    		sample.cpu = 0.0;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when mem load == 0.0', function(done) {
    		sample.mem = 0.0;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when cpu load == 100.0', function(done) {
    		sample.cpu = 100.0;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return success when mem load == 100.0', function(done) {
    		sample.mem = 100.0;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, false, 'add: return err - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when cpu load is missing', function(done) {
    		delete sample.cpu;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when mem load is missing', function(done) {
    		delete sample.mem;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when cpu load is not number type', function(done) {
    		sample.cpu = "0.0";
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when mem load is not number type', function(done) {
    		sample.mem = "0.0";
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when cpu load is negative value', function(done) {
    		sample.cpu *= -1.0;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when mem load is negative value', function(done) {
    		sample.mem *= -1.0;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when cpu load is greater than 100.0', function(done) {
    		sample.cpu += 100.0;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    	it('#add - should return error when mem load is greater than 100.0', function(done) {
    		sample.mem += 100.0;
    		store.add(server_name, sample, function(err, result) {
        		assert.equal(err, true, 'add: return success - '+result);
        		done();
        	});
    	})
    })
    describe('#report-mock', function() {
    	var server_name = "myServer";

        describe('#scenario - add & get reports should return non-empty result', function() {
            var store = mock('../../lib/metricsStore', {}, require);
        	var samples, avgCpu, avgMem;
        	
            before(function () {
            	samples = [];
            	for (var x = 0; x < 1; x++) {
            		var cpu = Math.round(Math.random() * 10000) / 100;
            		var mem = Math.round(Math.random() * 10000) / 100;
            		samples[x] = {cpu: cpu, mem: mem};
            	}
                avgCpu = samples.reduce(function(a, load) {
                	return a + load.cpu;
                }, 0.0) / samples.length;
                avgMem = samples.reduce(function(a, load) {
                	return a + load.mem;
                }, 0.0) / samples.length;
            });
	        it('#report - add records and get byMinute report', function(done) {
	            var run = function(sample, next) {
	                store.add(server_name, sample, function(err, result) {
	            		assert.equal(err, false, 'add: return err - '+result);
	                    next();
	                });
	            }
	            serializeTasks(samples, run, done);       
	        })
	        it('#report - get byMinute report', function(done) {
	            store.report(server_name, 'byMinute', function(err, result) {
	        		assert.equal(err, false, 'report: return err - '+result);
	        		console.log(result);
	        		assert.equal(result.length == 1, true);
	        		assert.equal(result[0].avgCpu == avgCpu, true);
	        		assert.equal(result[0].avgMem == avgMem, true);
	                done();
	            });
	        })
	        it('#report - get byHour report', function(done) {
	        	store.report(server_name, 'byHour', function(err, result) {
	        		assert.equal(err, false, 'report: return err - '+result);
	        		console.log(result);
	        		assert.equal(result.length == 1, true);
	        		assert.equal(result[0].avgCpu == avgCpu, true);
	        		assert.equal(result[0].avgMem == avgMem, true);
	                done();
	            });
	        })
        })
        describe('#scenario - no data & get reports should return error', function() {
            var store = mock('../../lib/metricsStore', {}, require);
        	var server_name = "serverWithNoData";
	        it('#report - get byMinute report', function(done) {
	        	store.report(server_name, 'byMinute', function(err, result) {
	        		assert.equal(err, true, 'report: return success - '+result);
	                done();
	            });
	        })
	        it('#report - get byHour report', function(done) {
	        	store.report(server_name, 'byHour', function(err, result) {
	        		assert.equal(err, true, 'report: return success - '+result);
	                done();
	            });
	        })
        })
    })
});
