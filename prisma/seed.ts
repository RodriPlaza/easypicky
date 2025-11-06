// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPw = process.env.ADMIN_PW || "";
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const adminName = process.env.ADMIN_NAME || "";
  if (adminPw == "" || adminEmail == "" || adminName == "") {
    console.log("Admin not created: Please fill all admin data on .env");
  } else {
    const hashedPassword = await bcrypt.hash(adminPw, 12);

    const admin = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || "",
        name: "Admin Usuario",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    console.log("Admin created:", admin);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
