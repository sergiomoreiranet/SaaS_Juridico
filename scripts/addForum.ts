import { db } from "../src/db";
import { sql } from "drizzle-orm";
async function run() {
  await db.execute(sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS forum TEXT;`);
  console.log("Migration executed!");
  process.exit(0);
}
run();
