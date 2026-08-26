const { db } = require("../config/firebase");
const { seedDatabase } = require("./seedData");

async function run() {
  try {
    await seedDatabase(db);
    console.log("🚀 [Seed Runner] Database seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ [Seed Runner] Error seeding database:", error);
    process.exit(1);
  }
}

run();
