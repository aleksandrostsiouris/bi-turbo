import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import express, { Router, Request, Response } from "express";
import { Readable } from "stream";
import fs from "fs-extra";

export const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  console.log("GET /artifacts called");
  const blobClient = new BlobServiceClient(
    process.env.AZURE_STORAGE_BLOB_URL!,
    new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT_NAME!,
      process.env.AZURE_STORAGE_ACCOUNT_KEY!
    )
  );
  const containerClient = blobClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME!);

  const cacheDir = `${process.cwd()}\\.cache`;
  const existings = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    if (blob.name.includes("gitignore")) continue;
    const bl = containerClient.getBlobClient(blob.name);

    const filePath = `${cacheDir}/${bl.name}`;
    const exists = await fs.pathExists(filePath);
    if (exists) {
      existings.push(bl.name);
      continue;
    }

    fs.open(filePath, 'w', async (err, _) => {
      await bl.downloadToFile(`${cacheDir}/${blob.name}`, undefined, undefined);
      if (err) console.error(err);
    });
  }
});

// GET specifc artifact //
router.get("/:hash", async (req: Request, res: Response) => {
  const hash = req.params.hash;
  console.log("GET artifacts/:hash called with hash", hash);

  if (!hash) {
    res.status(500).send({
      statusCode: 500,
      message: "hash is empty"
    });
  }

  const blobClient = new BlobServiceClient(
    process.env.AZURE_STORAGE_BLOB_URL!,
    new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT_NAME!,
      process.env.AZURE_STORAGE_ACCOUNT_KEY!
    )
  );
  const containerClient = blobClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME!);

  let buffers: Buffer[] = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    if (blob.name.includes("gitignore") || !blob.name.includes(hash)) continue;
    console.log("Found artifact", blob.name)
    const bl = containerClient.getBlobClient(blob.name);
    const buffer = await bl.downloadToBuffer(undefined, undefined, { concurrency: 10 });
    buffers.push(buffer);
  }

  if (buffers.length <= 0) {
    res.status(400).send({
      msg: "No artifact found"
    });
    return;
  }

  if (!req.headers["user-agent"]) {
    console.error("User-Agent header is missing")
    res.sendStatus(400);
    return;
  }

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Authorization', req.headers.authorization!)
  res.setHeader('User-Agent', req.headers["user-agent"]!);
  res.sendStatus(200)
});

// PUT specifc artifact //
router.put("/:hash", async (req: Request, res: Response) => {
  const hash = req.params.hash;
  console.log("PUT artifacts/:hash called with hash", hash);

  const blobServiceClient = new BlobServiceClient(
    process.env.AZURE_STORAGE_BLOB_URL!,
    new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT_NAME!,
      process.env.AZURE_STORAGE_ACCOUNT_KEY!
    )
  );
  const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME!);
  const blobClient = containerClient.getBlockBlobClient(`${hash}.tar.zst`);

  console.log(`Attempting to upload cache build ${hash}..`);
  const result = await blobClient.uploadStream(Readable.from(req.body));

  if (result.errorCode) {
    console.error(result.errorCode);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});
