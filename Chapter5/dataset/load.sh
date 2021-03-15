#!/bin/bash
printf "\n**Load.sh loads an index template for webapp logs into Elasticsearch**\n\n"
echo -n "Elasticsearch cluster URL: "
read url
echo -n "Username: "
read username
echo -n "Password: "
read -s password
echo

# load index template
if curl -f -XPUT "$url/_index_template/webapp-template" -u $username:$password -H 'Content-Type: application/json' -d "@webapp-template.json"
then echo " - Loaded index template for web app"
else echo " Could not load index template"
exit
fi

# load ingest pipeline
if curl -f -XPUT "$url/_ingest/pipeline/webapp-pipeline" -u $username:$password -H 'Content-Type: application/json' -d "@webapp-pipeline.json"
then echo " - Loaded ingest pipeline for web app"
else echo " Could not load ingest pipeline for web app"
exit
fi

printf "\n*Loaded components successfully\n"