const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with users only...");

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123456", 12);
    const admin = await prisma.user.upsert({
      where: { email: "admin@webtruyen.com" },
      update: {},
      create: {
        email: "admin@webtruyen.com",
        passwordHash: adminPassword,
        name: "Administrator",
        role: "ADMIN",
      },
    });

    // Create demo user
    const userPassword = await bcrypt.hash("user123456", 12);
    const user = await prisma.user.upsert({
      where: { email: "user@example.com" },
      update: {},
      create: {
        email: "user@example.com",
        passwordHash: userPassword,
        name: "Demo User",
        role: "USER",
      },
    });

    console.log("✅ Database seeded successfully!");
    console.log("👤 Admin:", admin.email, "/ admin123456");
    console.log("👤 User:", user.email, "/ user123456");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
