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
MAX_DURATION = 24 * 60 * 60 ## 24 hours
ITERATION_INTERVAL = 6

def addLoad(params, threadName):
	request = params["target"]
	loop = params["loop"]

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
			
def getSummary(request, type):
	for x in range(0, 99):
		server_name = "server_%02d"%x
		result = request.getSummary(server_name, type)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--thread', dest='thread', type=int, action='store', default=1, help='# of thread')
    parser.add_argument('--duration', dest='duration', type=int, action='store', default=60, help='duration(s)')
    parser.add_argument('--loop', dest='loop', type=int, action='store', default=10, help='# of loop')
    args = parser.parse_args()

    num_thread = args.thread
    duration = args.duration
    num_loop = args.loop
    
    if (duration > MAX_DURATION):
        duration = MAX_DURATION;
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
        	"server": "localhost",
        	"port": 3001
        }

    request = MyRequest(config["server"], config["port"])
    params = {
        "target": request,
        "loop": num_loop
    }
    
    print("(MAIN): stress long-run test starts")
    iter = 0;
    t_main_start = time.time()
    while True:
        t_iter_start = time.time()
        iter += 1
        print("main(%4d): Running with #thread=%d"%(iter, num_thread))
        myThread.runTasks(num_thread, addLoad, params)
        t_iter_end = time.time()
        print("main(%4d): Elapsed=%ds, Total=%d/%ds"%(iter, t_iter_end - t_iter_start, t_iter_end - t_main_start, duration))
        if (t_iter_end - t_main_start) > duration:
            break

        time.sleep(ITERATION_INTERVAL)
    
    t_main_end = time.time()
    getSummary(request, "byMinute")
    getSummary(request, "byHour")
    
    print("(MAIN): Stress long-run test ended. Total elapsed=%ds"%(t_main_end - t_main_start))
