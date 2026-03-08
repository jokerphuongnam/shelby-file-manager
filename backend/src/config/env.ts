import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",

  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim()),

  aptos: {
    network: (process.env.APTOS_NETWORK ?? "testnet") as
      | "testnet"
      | "local"
      | "shelbynet",
  },

  shelby: {
    apiKey: requireEnv("SHELBY_API_KEY"),
  },

  upload: {
    maxFileSizeBytes: parseInt(
      process.env.MAX_FILE_SIZE ?? String(50 * 1024 * 1024),
      10
    ),
  },
} as const;
