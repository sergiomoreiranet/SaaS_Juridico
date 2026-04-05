import "dotenv/config";
import { db } from "./index";
import { tenants, users } from "./schema";

async function run() {
  const allTenants = await db.select().from(tenants);
  const allUsers = await db.select().from(users);

  console.log("=== TENANTS ===");
  allTenants.forEach(t => console.log(`${t.id} - ${t.name} (${t.slug})`));

  console.log("\n=== USERS ===");
  allUsers.forEach(u => console.log(`${u.email} -> Tenant: ${u.tenantId}`));
  process.exit(0);
}
run();
