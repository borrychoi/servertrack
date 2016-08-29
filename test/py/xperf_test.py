import argparse
import time
import os, sys
import random
import string
import json

import myThread
from myRequest import MyRequest

MIN_THREAD = 1
MIN_LOOP = 1
MAX_THREAD = 100
MAX_LOOP = 1000

def addLoad(params, threadName):
	request = params["target"]
	loop = params["loop"]
	print("thread(%s): starts for loop(%d)"%(threadName, loop))
	start = time.time()
	server_name = "server_%02d"%(random.randint(0, 99));
	for x in range(loop):
		load = {
			"cpu": float(format(random.uniform(0.0, 100.0),'.2f')),
			"mem": float(format(random.uniform(0.0, 100.0), '.2f'))
		}
		request.add(server_name, load)
		if (x+1) == loop:
			break;
		time.sleep(random.randint(57, 63))
	end = time.time()
	print("thread(%s): elapsed(%dms) for iter(%d)"% (threadName, (end-start)*1000.0, loop))

def getSummary(request, type):
	for x in range(0, 99):
		server_name = "server_%02d"%x
		result = request.getSummary(server_name, type)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--thread', dest='thread', type=int, action='store', default=1, help='# of thread')
    parser.add_argument('--loop', dest='loop', type=int, action='store', default=10, help='# of loop')
    args = parser.parse_args()

    num_thread = args.thread
    num_loop = args.loop

    if num_thread <= 0:
        num_thread = MIN_THREAD
    elif num_thread > MAX_THREAD:
        num_thread = MAX_THREAD

    if num_loop <= 0:
        num_loop = MIN_LOOP
    elif num_loop > MAX_LOOP:
        num_loop = MAX_LOOP

    try:
        with open("../../config/config.json", 'r') as infile:
            config = json.load(infile)
    except Exception as ex:
    	print("Exception: "+str(ex))
        config = {
        	"base_url": "localhost",
        	"base_port": 3001
        }

    request = MyRequest(config["server"], config["port"])
    params = {
        "target": request,
        "loop": num_loop
    }

    print("(MAIN): Running with #thread=%d, #loop=%d"%(num_thread, num_loop))
    start = time.time()
    myThread.runTasks(num_thread, addLoad, params)
    getSummary(request, "byMinute")
    getSummary(request, "byHour")
    end = time.time()
    print("(MAIN): Total elapsed: %d second(s)"%(end-start))
