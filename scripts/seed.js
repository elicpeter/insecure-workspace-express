const fs = require("fs");
const path = require("path");
const db = require("../src/db");

async function seed() {
  const dir = path.join(__dirname, "..", "src", "db", "seeds");
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    process.stdout.write(`Seeding ${file}\n`);
    await db.query(sql);
  }

  process.stdout.write("Seed complete.\n");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});

