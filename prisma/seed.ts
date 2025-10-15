// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPw = process.env.ADMIN_PW || "";
  const hashedPassword = await bcrypt.hash(adminPw, 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin Usuario",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("Admin created:", admin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
