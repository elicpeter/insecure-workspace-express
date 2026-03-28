const fs = require("fs");
const app = require("./app");
const config = require("./config/env");

for (const dir of [config.uploadRoot, config.exportRoot]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

console.log("WARNING: Northstar Workroom is intentionally insecure.");
console.log("WARNING: This AI-generated app is for local educational testing only.");
console.log("WARNING: Do not deploy it to any environment.");

app.listen(config.port, () => {
  console.log(`Northstar Workroom listening on ${config.appBaseUrl}`);
});

