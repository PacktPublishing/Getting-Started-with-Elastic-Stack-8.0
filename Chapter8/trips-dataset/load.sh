#!/bin/bash
printf "\n**Load.sh loads an index template for Flight trip data into Elasticsearch**\n\n"
echo -n "Elasticsearch cluster URL: "
read url
echo -n "Username: "
read username
echo -n "Password: "
read -s password
echo

# load index template
if curl -f -XPUT "$url/_index_template/trips" -u $username:$password -H 'Content-Type: application/json' -d "@flights-template.json"
then echo " - Loaded index template for web logs"
else echo " Could not load index template"
exit
fi