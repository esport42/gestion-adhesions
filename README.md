# E-Sport 42 G.U.Y.S.
Sign-up application for E-Sport 42.

## Requirements
To run this app you need:
* NodeJS and NPM
* An account on 42 intra (to access the API)
* Admin access to the G Suite domain you want your users to be added to
* A TLS (HTTPS) certificate

## Configuration
### 42 intra API
First, [create an application](https://profile.intra.42.fr/oauth/applications/new)
on 42 intra with user public data scope. Set the redirect URI to the address
where you plan to serve the app followed by `/stage1`.

Then run
```
npm config set es42-guys:ft_client_id UID
npm config set es42-guys:ft_client_secret SECRET
```
with the UID and SECRET values you got from the intra.

### Google APIs
#### Creating a service account
For security reasons, we recommend this to be done with a Google account in your
domain and controlled by an administrator.

Go to [the google cloud console](https://console.cloud.google.com), create a
project, and enable the following APIs:
* [Admin SDK](https://console.cloud.google.com/apis/api/admin/overview)
* [Gmail API](https://console.cloud.google.com/apis/api/gmail/overview)

Then, [create a service account](https://console.cloud.google.com/iam-admin/serviceaccounts/project)
with G Suite delegation enabled. Download your key in JSON format and save it as
`keys/google-credentials.json` in the application directory.

#### Authorizing access to your domain
This must be done by a domain administrator.
Go to [the manage oauth clients page](https://admin.google.com/ManageOauthClients)
in your admin console and authorize a new client with:
* Client name set to the client ID of the service account you created at the previous step
* The following scopes:
    * `https://www.googleapis.com/auth/admin.directory.user`
    * `https://www.googleapis.com/auth/gmail.send`

#### App configuration
Set `google_user` to a domain admin account:
```
npm config set es42-guys:google_user USER@YOURDOMAIN.COM
```
Anything the app does on your domain will appear to have been done by the user
you set here. Most notably, e-mails will be sent from this account's e-mail
address.

If your domain is not esport42.fr, you must also set `google_domain`:
```
npm config set es42-guys:google_domain YOURDOMAIN.COM
```

### TLS Certificate
Put your certificate and key in `keys/tls-cert.pem` and `keys/tls-key.pem`
respectively.

For testing without a certificate from an authority, you can create a
self-signed certificate with the following command (assuming openssl is
installed on your system):
```
openssl req -new -x509 -newkey rsa:4096 -nodes -keyout keys/tls-key.pem -out keys/tls-cert.pem
```

### App settings
Set `soge_author` to the name of the person in your organization who signs the
membership certificates. The app will generate certificates in that person's
name. You should make sure they are aware of it and agree to it, otherwise you
may be liable of making false documents.
```
npm config set es42-guys:soge_author NAME
```

#### Optional settings
These all have a default value. You can change it with the following command:
```
npm config set es42-guys:OPTION VALUE
```
| Option name | Description | Default value |
| --- | --- | --- |
| host | Name or IP address the server should bind to. If unset, the server listens on all interfaces. | none |
| port | HTTPS port, on which the app and api are served. If unset, HTTPS is disabled. | 443 |
| insecure\_port | Plain HTTP port. Requests to this port are redirected to HTTPS, no actual content is served over plain HTTP unless HTTPS is disabled. Serving content over plain HTTP is only intended for serving this app behind a reverse proxy and is unsupported and insecure in any other cases. If unset, plain HTTP is disabled. | 80 |
| app\_prefix | URL path prefix the client app is served on and configured for. This is experimental and unsupported. If unset, the app is served on root (/). | none |
| serve\_app | If set to false, the client app is not served. You still need to set the necessary options and run the install or rebuild-client-app scripts if you want to serve the app from another server. Also, the API server currently does not set CORS headers, so it only works if the API and client app are served from the same origin (e.g. with a reverse proxy). | true |
| api\_request\_limit | Maximum number of requests a single client (IP address) can make to the API over a `api_request_limit_period` seconds period. 0 disables rate limiting. | 20 |
| api\_request\_limit\_period | Time period in seconds during which a single client cannot make more requests than `api_request_limit`. | 60 |
| api\_request\_limit\_ban\_threshold | Clients that make more than this number of requests during the period are banned. 0 disables it. | 120 |
| api\_request\_limit\_ban\_duration | Time in seconds after which bans expire. | 86400 |

After making changes to the `app_prefix` or `ft_client_id` options, it is
necessary to rebuild the client app. The install scripts take care of it
automatically, but if you change these options after install you must run:
```
npm run rebuild-client-app
```
If you don't, the values used by the client app and the server won't match and
it will most likely blow up in a few millions pieces, with a small cloud of
white smoke.

## Installation
```
npm install
```
This will install both the server and client app dependencies and build the
client app.

## Running
```
npm start
```
