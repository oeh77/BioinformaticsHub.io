/**
 * Script to demote an admin back to regular user
 * 
 * Usage:
 *   npx ts-node scripts/demote-admin.ts <email>
 * 
 * Example:
 *   npx ts-node scripts/demote-admin.ts admin@biohub.io
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function demoteFromAdmin(email: string) {
  if (!email) {
    console.error("❌ Error: Please provide an email address");
    console.log("\nUsage: npx ts-node scripts/demote-admin.ts <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      process.exit(1);
    }

    if (user.role === "USER") {
      console.log(`ℹ️  User "${email}" is already a regular USER`);
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "USER" },
    });

    console.log(`✅ Successfully demoted "${updatedUser.name || email}" to USER role`);
  } catch (error) {
    console.error("❌ Error demoting user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
demoteFromAdmin(email);
