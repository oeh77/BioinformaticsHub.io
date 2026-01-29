/**
 * Script to list all admin users
 * 
 * Usage:
 *   npx ts-node scripts/list-admins.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (admins.length === 0) {
      console.log("ℹ️  No admin users found");
      console.log("\nTo create an admin, run the seed or use:");
      console.log("  npx ts-node scripts/promote-admin.ts <email>");
      return;
    }

    console.log(`📋 Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name || "No name"}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error listing admins:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
