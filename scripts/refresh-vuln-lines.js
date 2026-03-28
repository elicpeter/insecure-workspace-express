const fs = require("fs");
const path = require("path");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "README.md"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, acc);
      continue;
    }

    if (!/\.(js|sql|ejs|yml|md|example)$/i.test(entry.name)) {
      continue;
    }

    const lines = fs.readFileSync(fullPath, "utf8").split("\n");
    lines.forEach((line, index) => {
      const match = line.match(/VULN-\d+/);
      if (match) {
        acc.push({
          id: match[0],
          file: path.relative(process.cwd(), fullPath),
          line: index + 1,
          text: line.trim()
        });
      }
    });
  }

  return acc;
}

const results = walk(process.cwd()).sort((a, b) => a.id.localeCompare(b.id));
for (const result of results) {
  console.log(`${result.id} ${result.file}:${result.line} ${result.text}`);
}
