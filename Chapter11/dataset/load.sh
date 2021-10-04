#!/bin/bash
printf "\n**Load.sh loads an index for recipes into Elasticsearch**\n\n"
echo -n "Elasticsearch cluster URL: "
read url
echo -n "Username: "
read username
echo -n "Password: "
read -s password
echo

# load index template
if curl -f -XPUT "$url/recipes" -u $username:$password -H 'Content-Type: application/json' -d "@recipe-index.json"
then echo " - Loaded index for recipes"
else echo " Could not load index"
exit
fi


printf "\n*Loaded index successfully\n"