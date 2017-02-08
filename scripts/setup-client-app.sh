#!/bin/sh
cd client_app
echo '{"apiBaseUri":"/api","ftApiClientId":"'${npm_package_config_ft_client_id}'"}' >app-config.json
$(npm bin)/bower install
$(npm bin)/polymer build
