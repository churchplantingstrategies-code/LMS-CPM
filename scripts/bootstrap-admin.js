const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const db = new PrismaClient();

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@ediscipleship.local";
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin12345!";
  const role = process.env.BOOTSTRAP_ADMIN_ROLE || "SUPER_ADMIN";
  const hash = bcrypt.hashSync(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: {
      role,
      password: hash,
      name: "Platform Super Admin",
    },
    create: {
      email,
      name: "Platform Super Admin",
      password: hash,
      role,
    },
  });

  console.log("ADMIN_READY", user.email, user.role);
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error("BOOTSTRAP_ADMIN_ERROR", error);
  process.exit(1);
});
