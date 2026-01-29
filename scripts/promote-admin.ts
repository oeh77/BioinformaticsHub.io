/**
 * Script to promote a user to admin role
 * 
 * Usage:
 *   npx ts-node scripts/promote-admin.ts <email>
 *   
 * Or with npm script:
 *   npm run promote-admin <email>
 * 
 * Example:
 *   npx ts-node scripts/promote-admin.ts admin@biohub.io
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function promoteToAdmin(email: string) {
  if (!email) {
    console.error("❌ Error: Please provide an email address");
    console.log("\nUsage: npx ts-node scripts/promote-admin.ts <email>");
    console.log("Example: npx ts-node scripts/promote-admin.ts user@example.com");
    process.exit(1);
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      console.log("\nMake sure the user has registered first.");
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`ℹ️  User "${email}" is already an admin`);
      process.exit(0);
    }

    // Promote to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully promoted "${updatedUser.name || email}" to ADMIN role`);
    console.log(`\nUser details:`);
    console.log(`  ID: ${updatedUser.id}`);
    console.log(`  Name: ${updatedUser.name || "Not set"}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Role: ${updatedUser.role}`);
  } catch (error) {
    console.error("❌ Error promoting user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
promoteToAdmin(email);
