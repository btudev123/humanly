import { neon } from "@neondatabase/serverless";

type NeonClient = ReturnType<typeof neon>;

let client: NeonClient | null = null;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL or POSTGRES_URL is required for this operation.");
  }

  if (!client) {
    client = neon(databaseUrl);
  }

  return client;
}
