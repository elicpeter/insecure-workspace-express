const fs = require("fs");
const path = require("path");
const db = require("../src/db");

async function migrate() {
  const dir = path.join(__dirname, "..", "src", "db", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    process.stdout.write(`Applying ${file}\n`);
    await db.query(sql);
  }

  process.stdout.write("Migrations complete.\n");
  process.exit(0);
}

migrate().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});

