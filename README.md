This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/zeit/next.js/tree/canary/packages/create-next-app).

# Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open <http://localhost:3000> with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

# Analyze Build size

To ananlyze build size and open up browser window visualizing bundle build up.

`ANALYZE=true yarn build`

# RPC creation and usage

## 1\. Define a Meta describing domain, action and shape of request & response

```javascript
export const roomFetchMeta = RPCMeta(
  "room",
  "fetch",
  t.type({
    uid: t.string,
  }),
  TRoom
);
```

_Note: put meta in separate file of below handler as it will be used both on the client and server_

## 2\. Create handler

```javascript
export const roomFetch = RPCHandlerFactory(meta, async (reqData) => {
  return await dynamoTableTapes.getRoomBySlug(reqData.uid);
});
```

## 3\. Call from server side or client side

Server side:

```javascript
// export type IResponse<T> = IOK<T> | IERR;
// type IRoom = t.TypeOf<typeof TRoom>;
const room: IResponse<IRoom> = await roomFetch.call({
  uid,
});
```

Client side:

```javascript
const room: IResponse<IRoom> = await RPCClientFactory(roomFetchMeta).call({
  uid,
});
```

# DynamoDB Backups

## Remote AWS Table backups

```javascript
import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb";
await dynamoTableTapes.backup();
```

## Local backup

Creating a _local_ backup of the DynamoDB table. Uses `npm install -g dynamodump`

```
AWS_ACCESS_KEY_ID=[KEY] AWS_SECRET_ACCESS_KEY=[KEY] dynamodump export-all-data --region=eu-central-1
```
