const http = require("http");
const https = require("https");
const { URL } = require("url");

function requestOnce(targetUrl) {
  const parsed = new URL(targetUrl);
  const lib = parsed.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      parsed,
      {
        method: "GET",
        // VULN-021: TLS verification is disabled for preview fetches.
        rejectUnauthorized: false,
        timeout: 3000
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk.toString("utf8");
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Preview request timed out."));
    });
    req.end();
  });
}

async function fetchPreview(targetUrl) {
  // VULN-022: Arbitrary URL fetching creates an SSRF primitive to internal services.
  return requestOnce(targetUrl);
}

module.exports = {
  fetchPreview
};

