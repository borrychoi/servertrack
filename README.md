# servertrack
Tracks Server Load Metrics.
 
# Features
1. keep server load metrics data for last 24 hours in in-memory storage using key = server name.
- each server reports load metrics every minute
2. return average load metrics for last 60 minutes or for last 24 hours.
- load metrics report is on-demand
 
# program outline
 
* Posting server load - /servertrack/{serverName}/add
JSON payload sample: {"cpu": 0.0, "mem": 1.1}
 
* server load report - /servertrack/{serverName}/summary/{reportType}
- By Hour average report: reportType='byHour'
- By Minute average report: reportType='byMinute'
 
# Limitation/Consideration
1. due to memory size limitation, maximum record number for each server is 2K
- per spec, each server reports load metrics every minute.
- 60(per hour) * 24(per day) = 1440 records(per day)
- so, maximum 2K records per server is enough for keeping 24 hours record.

2. memory storage size (for 5000 servers)
- estimated storage size = 5K * 2K * 64Byte = 640MByte per day

3. memory storage is curcular buffer with 2K records.
- if it reaches to the top, it will wrap to bottom to overwrite oldest record first.

# Setup and Test Execution
1. Express server
config/config.json - {server: "localhost", port:3001}
2. Test
* test/js - mocha tests - 
* test/py - python tests
- Usage: python xperf_test.py --thread <#thread> --loop <#loop>
- Usage: python stress_test.py --thread <#thread> --loop <#loop> --duration <seconds>