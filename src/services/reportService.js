const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const db = require("../db");
const config = require("../config/env");
const exportJobModel = require("../models/exportJobModel");

function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      resolve(stdout);
    });
  });
}

async function exportWorkspace({ workspaceId, requestedBy, format, filter, fileName }) {
  // VULN-018: Workspace export trusts any workspaceId without membership enforcement.
  const sql = `
    SELECT p.id, p.name, p.status, p.visibility
    FROM projects p
    WHERE p.workspace_id = ${workspaceId}
      AND p.name ILIKE '%${filter || ""}%'
    ORDER BY p.updated_at DESC
  `;
  // VULN-019: Raw string interpolation creates a SQL injection sink in report filtering.
  const result = await db.query(sql);
  const targetFile = path.join(
    config.exportRoot,
    `${Date.now()}-${fileName || "workspace-report"}.${format || "csv"}`
  );
  const content = result.rows
    .map((row) => `${row.id},${row.name},${row.status},${row.visibility}`)
    .join("\n");

  fs.writeFileSync(path.join(config.exportRoot, "last-report.tmp"), content);

  // VULN-020: User-controlled fileName and format flow into shell execution.
  await execAsync(`cp ${path.join(config.exportRoot, "last-report.tmp")} ${targetFile}`);

  return exportJobModel.createJob({
    workspaceId,
    requestedBy,
    format,
    filter,
    outputPath: targetFile,
    status: "ready"
  });
}

module.exports = {
  exportWorkspace
};

