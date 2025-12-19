import "dotenv/config";
import postgres from "postgres";

async function test() {
  const sql = postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  const res = await sql`select 1 as ok`;
  console.log("DB OK:", res);
  await sql.end({ timeout: 5 });
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
