import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared";
import * as fs from "fs";
import "dotenv/config";

const client = new UnstructuredClient({
  security: {
    apiKeyAuth: process.env.UNSTRUCTURED_API_KEY,
  },
});

async function parseContract(filePath) {
  const fileData = fs.readFileSync(filePath);

  const response = await client.general.partition({
    partitionParameters: {
      files: {
        content: fileData,
        fileName: filePath,
      },
      strategy: Strategy.Auto,
    },
  });

  return response.elements;
}