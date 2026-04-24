import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { configDotenv } from "dotenv";

configDotenv();

console.log("process.env.AWS_REGION", process.env.AWS_REGION)
console.log("process.env.AWS_Access", process.env.AWS_ACCESS_KEY)
console.log("process.env.AWS_Secret", process.env.AWS_SECRET_KEY)
console.log("process.env.NODE_ENV", process.env.NODE_ENV)

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export async function uploadToS3(key, body) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: "text/plain",
    })
  );

  return key;
}

export async function getSignedS3Url(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60, // in seconds
  });

  return url;
}