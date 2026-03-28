function renderUserMarkdown(input = "") {
  const html = input
    .replace(/^# (.*)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  // VULN-005: This only strips literal <script tags and leaves many XSS vectors behind.
  return html.replace(/<script/gi, "&lt;script");
}

module.exports = {
  renderUserMarkdown
};

