// import http from "http";
// import https from "https";
// import { S3 } from "@aws-sdk/client-s3";
// import { NodeHttpHandler } from "@smithy/node-http-handler";

// export const s3 = new S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   Bucket: process.env.BUCKET,
//   region: process.env.AWS_REGION,
//   endpoint: process.env.S3_ENDPOINT,

//   requestHandler: new NodeHttpHandler({
//     httpAgent: new http.Agent({ maxSockets: 500 }),
//     httpsAgent: new https.Agent({ maxSockets: 500 }),
//   }),
// });
