import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type UploadResult = {
  url: string;
  key: string;
  provider: "s3" | "r2" | "local";
};

function sanitizeFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext).replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return `${base || "book-cover"}-${randomUUID()}${ext}`;
}

function getR2Config() {
  const accountAccessKey = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET;

  if (!accountAccessKey || !secretAccessKey || !endpoint || !bucket) {
    return null;
  }

  return {
    region: "auto",
    endpoint,
    bucket,
    credentials: {
      accessKeyId: accountAccessKey,
      secretAccessKey,
    },
    publicBaseUrl: process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || null,
  };
}

function getS3Config() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;

  if (!accessKeyId || !secretAccessKey || !region || !bucket) {
    return null;
  }

  return {
    region,
    bucket,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    publicBaseUrl: process.env.AWS_S3_PUBLIC_URL?.replace(/\/$/, "") || `https://${bucket}.s3.${region}.amazonaws.com`,
  };
}

async function uploadToObjectStorage({
  provider,
  key,
  buffer,
  contentType,
  fileName,
}: {
  provider: "s3" | "r2";
  key: string;
  buffer: Buffer;
  contentType: string;
  fileName: string;
}) {
  const config = provider === "r2" ? getR2Config() : getS3Config();
  if (!config) {
    throw new Error(`${provider.toUpperCase()} storage is not configured`);
  }

  const client = new S3Client({
    region: config.region,
    endpoint: "endpoint" in config ? config.endpoint : undefined,
    credentials: config.credentials,
    forcePathStyle: provider === "r2",
  });

  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
    ContentDisposition: `inline; filename="${fileName.replace(/"/g, "")}"`,
  }));

  if (!config.publicBaseUrl) {
    throw new Error(`Missing public base URL for ${provider.toUpperCase()} storage`);
  }

  return {
    url: `${config.publicBaseUrl}/${key}`,
    key,
    provider,
  } satisfies UploadResult;
}

async function uploadToLocal({ key, buffer }: { key: string; buffer: Buffer }) {
  const uploadDir = path.join(process.cwd(), "public", path.dirname(key));
  const filePath = path.join(process.cwd(), "public", key);
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(filePath, buffer);

  return {
    url: `/${key.replace(/\\/g, "/")}`,
    key,
    provider: "local",
  } satisfies UploadResult;
}

export async function uploadBookCover(file: File): Promise<UploadResult> {
  const fileName = sanitizeFileName(file.name);
  const key = path.posix.join("uploads", "book-covers", fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  if (getR2Config()) {
    return uploadToObjectStorage({ provider: "r2", key, buffer, contentType, fileName });
  }

  if (getS3Config()) {
    return uploadToObjectStorage({ provider: "s3", key, buffer, contentType, fileName });
  }

  return uploadToLocal({ key, buffer });
}