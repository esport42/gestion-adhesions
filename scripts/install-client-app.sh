#!/bin/sh
cd client_app

echo '{"apiBaseUri":"/api","appPrefix":"'${npm_package_config_app_prefix}'","ftApiClientId":"'${npm_package_config_ft_client_id}'"}' >app-config.json

sed -i.backup -E 's/(href="|url="|'"'"'src'"'"', *'"'"')\//\1'$(echo ${npm_package_config_app_prefix} |sed 's/\//\\\//g')'\//g' index.html

$(npm bin)/bower install
$(npm bin)/polymer build
