import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} env var.`);
  }

  return value;
}

function publicBaseUrl() {
  const explicit = process.env.R2_PUBLIC_BASE_URL;

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const bucket = process.env.R2_BUCKET || "colegio-audios";
  return `https://pub-${accountId}.r2.dev/${bucket}`;
}

let cachedClient;

function getClient() {
  if (!cachedClient) {
    const accountId = requiredEnv("R2_ACCOUNT_ID");

    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY")
      }
    });
  }

  return cachedClient;
}

export async function uploadAudio({ buffer, contentType, id, fileName }) {
  const bucket = process.env.R2_BUCKET || "colegio-audios";
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const key = `notes/${id}/${Date.now()}-${safeName}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );

  return {
    key,
    url: `${publicBaseUrl()}/${key}`
  };
}
