from flask import Flask,request,redirect,Response
from flask_cors import CORS
import requests
import os
from elasticapm.contrib.flask import ElasticAPM
import elasticapm
import time
import random

# define APM agent
app = Flask(__name__)
CORS(app)

# configure APM agent
app.config['ELASTIC_APM'] = {
    'SERVICE_NAME': 'recipe-search-service',
    'SERVER_URL': os.getenv("apm_server_url"),
    'SECRET_TOKEN': os.getenv("apm_server_password"),
    'ENVIRONMENT': os.getenv("apm_env")
}
apm = ElasticAPM(app)

# retrieve Elasticsearch cluster details
CLUSTER_URL = os.getenv("elastic_cluster_url")
USERNAME = os.getenv("elastic_user")
PASSWORD = os.getenv("elastic_password")

# expose server status for k8s health check
@app.route("/server_status")
def index():
    return "The API server is running!"

# proxy all requests to Elasticsearch
@app.route("/", methods=["GET","POST", "OPTIONS"])
@app.route("/<path:path>",methods=["GET","POST", "OPTIONS"])
def _proxy(*args, **kwargs):
    # override transaction name to group transactions by backend resource accessed
    elasticapm.set_transaction_name(request.method + " " + request.path)

    # add additional request metadata to transaction
    elasticapm.set_custom_context({'request.body': request.get_data()})

    resp = requests.request(
        method=request.method,
        url=request.url.replace(request.host_url, CLUSTER_URL),
        headers={key: value for (key, value) in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        auth=(USERNAME, PASSWORD),
        allow_redirects=False)

    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    headers = [(name, value) for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]

    response = Response(resp.content, resp.status_code, headers)
    
    # introduce random latency for demonstration purposes
    # check if random number is even
    if random.randint(1, 100) % 2 == 0:
        time.sleep(5)
        # make erronous request to a domain that doesnt exist
        try:
            resp = requests.get("https://www.recipe-search-service.com")
        except:
            # capture error details
            apm.capture_exception()
        # make a subsequent valid request
        resp = requests.get("https://www.google.com")

    
    return response
    

# run server on port 8000
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)