#!/bin/bash
printf "\n**Load.sh loads an index template and an ingest pipeline to process Apache web logs into Elasticsearch**\n\n"
echo -n "Elasticsearch cluster URL: "
read url
echo -n "Username: "
read username
echo -n "Password: "
read -s password
echo

# load index template
if curl -f -XPUT "$url/_index_template/web-logs" -u $username:$password -H 'Content-Type: application/json' -d "@web-logs-template.json"
then echo " - Loaded index template for web logs"
else echo " Could not load index template"
exit
fi

# load ingest pipeline
if curl -f -XPUT "$url/_ingest/pipeline/web-logs" -u $username:$password -H 'Content-Type: application/json' -d "@web-logs-pipeline.json"
then echo " - Loaded ingest pipeline for Apache"
else echo " Could not load ingest pipeline for Apache"
exit
fi



printf "\n*Loaded components successfully\n"