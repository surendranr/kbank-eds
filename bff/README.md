# Kotak BFF — Adobe App Builder

Server-side "Backend For Frontend" for the EDS `api-demo` block. One web action
(`rates`) fetches exchange rates server-side and returns a trimmed JSON shape.

This folder is deploy-ready but is **not** part of the EDS site build — it is
excluded via `.hlxignore` (not served) and `.eslintignore` (Node runtime, not
browser code). It deploys to Adobe's cloud, not to the website.

## What it does

`GET <action-url>?base=USD` →

```json
{ "base": "USD", "updated": "...", "rates": [ { "code": "EUR", "rate": 0.92 } ] }
```

Same shape the `api-demo` block's Direct panel produces client-side — so both
panels render identically and only the fetch path differs.

## Which Adobe service to select

In the [Adobe Developer Console](https://developer.adobe.com/console), add the
**App Builder** template only (it provisions an **I/O Runtime** namespace).
You do **not** need API Mesh or App Builder Data Services for this action.

## Deploy (run on your machine)

Requires an Adobe org with App Builder entitlement and your Adobe ID added.

```bash
npm install -g @adobe/aio-cli
aio login                      # opens a browser to authenticate
aio console project create     # or: aio console org/project/workspace select
cd bff
aio app use                    # bind this folder to your project workspace (writes .env)
aio app deploy                 # deploys the action, prints the web action URL
```

Copy the printed URL (looks like
`https://<namespace>.adobeioruntime.net/api/v1/web/kotak-bff/rates`) into the
`api-demo` block's **BFF Action URL** field.

## Local test without deploy

```bash
cd bff
aio app dev        # runs the action locally, prints a localhost URL
curl "http://localhost:9080/api/v1/web/kotak-bff/rates?base=USD"
```
