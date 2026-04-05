import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";

async function run() {
  const allUsers = await db.select({
    name: users.name,
    email: users.email,
    role: users.role
  }).from(users);

  console.log("=== USUÁRIOS E PAPÉIS ATUAIS NO BANCO ===");
  allUsers.forEach(u => console.log(`- ${u.name} (${u.email}) -> Papel: [ ${u.role.toUpperCase()} ]`));
  process.exit(0);
}

run();
