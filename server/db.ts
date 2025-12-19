import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@shared/schema";

// IMPORTANT for Supabase pooler + serverless:
// - prepare:false avoids PREPARE (transaction pooler 6543 doesn't support it)
// - ssl settings harden TLS (prevents cert-chain issues in some envs)
// - max:1 prevents serverless connection explosions
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(client, { schema });
export { client };
