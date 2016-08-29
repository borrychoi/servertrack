import os, sys
import httplib, urllib
import time
import inspect
import json

class MyRequest:
    def __init__(self, baseUrl, basePort):
        self.baseUrl = baseUrl
        self.basePort = basePort
        
    def stringify(self, payload):
        json_str = json.dumps(payload)
        json_bytes = json_str.encode('utf-8')
        return json_bytes

    def add(self, server_name, load):
        ts=time.time()
        conn = httplib.HTTPConnection(self.baseUrl, self.basePort)
        endpoint = "/servertrack/"+server_name+"/add";
        
        header = {
        	"Content-type": "application/json"
        }
        
        jsonbytes = self.stringify(load)
        
        conn.request("POST", endpoint, jsonbytes, header);
        response = conn.getresponse()
        te=time.time()
        print("XTIME: %s=%dms"%(inspect.currentframe().f_code.co_name, (te-ts)*1000.0))
        if response.status != 200:
            print("ERROR: add failed - endpoint({0}), status({1})".format(endpoint, response.status))
            print("                            message({0}))".format(response.read()))
            return None
        data = response.read()
        print("add:rsp="+data)
        return data

    def getSummary(self, server_name, type):
        ts=time.time()
        conn = httplib.HTTPConnection(self.baseUrl, self.basePort)
        endpoint = "/servertrack/"+server_name+"/report/"+type;
        print("getsummary:"+endpoint)
        
        header = {
            "Content-type": "application/json"
        }
        conn.request("GET", endpoint, None, header);
        response = conn.getresponse()
        te=time.time()
        print("XTIME: %s=%dms"%(inspect.currentframe().f_code.co_name, (te-ts)*1000.0))
        if response.status != 200:
            print("ERROR: getSummary failed - endpoint({0}), status({1})".format(endpoint, response.status))
            print("                            message({0}))".format(response.read()))
            return None
        data = response.read()
        print("getSummary:rsp="+data)
        return data