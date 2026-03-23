async function main() {
  const { ensureDemoCourse } = require("../lib/demo-course");
  const course = await ensureDemoCourse();
  console.log(`Demo course ready: ${course.title} (${course.slug})`);
}

main()
  .catch((error) => {
    console.error("Failed to seed demo course", error);
    process.exit(1);
  })
  .finally(async () => {
    const { db } = await import("../lib/db");
    await db.$disconnect();
  });