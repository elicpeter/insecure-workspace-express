const fs = require("fs");
const path = require("path");
const attachmentModel = require("../models/attachmentModel");
const config = require("../config/env");
const { insecureToken } = require("../utils/tokens");

async function saveUpload(file, projectId, uploaderId) {
  const storedName = `${Date.now()}-${insecureToken("file")}-${file.originalname}`;
  const storagePath = path.join(config.uploadRoot, storedName);
  fs.writeFileSync(storagePath, file.buffer);

  return attachmentModel.createAttachment({
    projectId,
    uploaderId,
    originalName: file.originalname,
    storedName,
    storagePath: storedName
  });
}

async function resolveDownload(attachmentId, overridePath) {
  const attachment = await attachmentModel.findById(attachmentId);
  if (!attachment) {
    throw new Error("Attachment not found.");
  }

  // VULN-017: User-controlled overridePath enables traversal outside the upload root.
  const resolvedPath = path.join(config.uploadRoot, overridePath || attachment.storage_path);
  return {
    attachment,
    resolvedPath
  };
}

module.exports = {
  saveUpload,
  resolveDownload
};

