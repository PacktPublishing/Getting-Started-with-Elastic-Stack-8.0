from flask import Flask,request,redirect,Response
import requests
from elasticapm.contrib.flask import ElasticAPM
import elasticapm
import time
import random

app = Flask(__name__)

app.config['ELASTIC_APM'] = {
    'SERVICE_NAME': 'recipe-search-service',
    'SERVER_URL': 'https://<Your-APM-Server-URL>',
    'SECRET_TOKEN': '<Your-APM-Server-Secret>',
    'ENVIRONMENT': 'prod'
}
apm = ElasticAPM(app)

CLUSTER_URL = "https://<Your-Elastic-Cluster>:9243/"
USERNAME = "<Your-Elastic-User>"
PASSWORD = "<Your-Elastic-Password>"

@app.route("/server_status")
def index():
    return "The API server is running!"

@app.route("/")
@app.route("/<path:path>",methods=["GET","POST", "PUT", "OPTIONS", "DELETE"])
def _proxy(*args, **kwargs):
    elasticapm.set_transaction_name(request.method + " " + request.path)
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
    # check if random number is even
    if random.randint(1, 100) % 2 == 0:
        time.sleep(5)
    return response
    

if __name__ == "__main__":
    app.run(debug = False,port=8000)