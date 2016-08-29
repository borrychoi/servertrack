import threading
import time

MIN_INSTANCE=1
MAX_INSTANCE=1000

class MyThread (threading.Thread):
    def __init__(self, threadFunc, params, name):
        threading.Thread.__init__(self)
        self.func = threadFunc
        self.params = params
        self.name = name
    def run(self):
        print("Starting " + self.name)
        if len(self.params) > 0:
            self.func(self.params, self.name)
        else:
            self.func(self.name)

def runTasks(numInstance, func, params):
    result = True
    if numInstance < 0:
        print("Warning: MIN instances is 1. using 1 instead of %d"%numInstance)
        numInstance = 1
    elif numInstance > MAX_INSTANCE:
        print("Warning: max instances is %d. using %d instead of %d"%
                (MAX_INSTANCE, MAX_INSTANCE, numInstance))
        numInstance = MAX_INSTANCE
    print("Creating %d threads..."%numInstance)
    start_time = time.time()
    
    threads = {}
    try:
        for id in range(numInstance):
            threads[id] = MyThread(func, params, "thread-"+str(id))
            threads[id].start()
    except Exception as e:
        result = False
        print("Exception: cannot create thread: %s"%(str(e)))
    
    for id in threads:
        threads[id].join()
    end_time = time.time()
    print("Completed %d threads in %d miliseconds..."%
            (numInstance, (end_time-start_time)*1000.0))
    return result

