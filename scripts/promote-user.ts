import { prisma } from "@/lib/prisma";

async function promoteUser() {
  const result = await prisma.user.update({
    where: { email: "testuser@biohub.io" },
    data: { role: "ADMIN" },
  });
  console.log("User promoted to ADMIN:", result);
}

promoteUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
