const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env") });

module.exports = {
  port: Number(process.env.PORT || 3000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/northstar_workroom",
  // VULN-001: Fake hardcoded fallback secret makes deployments predictable if .env is missing.
  sessionSecret:
    process.env.SESSION_SECRET || "fake-default-session-secret-for-local-demo",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  fakeWebhookSigningKey:
    process.env.FAKE_WEBHOOK_SIGNING_KEY || "fake-demo-webhook-key-0000",
  nodeEnv: process.env.NODE_ENV || "development",
  uploadRoot: path.join(process.cwd(), "src", "uploads"),
  exportRoot: path.join(process.cwd(), "exports")
};

