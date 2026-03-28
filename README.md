<div align="center">
  <img src="assets/nyx-logo.png" alt="nyx logo" width="300"/>

**A realistic intentionally vulnerable web application for security analysis.**
</div>

---

## WARNING

This repository contains an intentionally vulnerable web application.

* It is unsafe by design.
* It is for local educational security testing only.
* It must never be deployed to any environment.
* All included credentials, tokens, and secrets are fake placeholders.

## AI Disclaimer

This repository was generated with AI assistance. It may contain mistakes beyond the intentional insecurity, rough edges, and unrealistic implementation choices. Treat it as a local-only demo target and not as production-ready software.

## Overview

Northstar Workroom is a small collaboration SaaS designed to resemble a real-world application with layered architecture and realistic data flow.

It includes:

* user registration, login, logout, and session handling
* teams/workspaces with memberships and invitations
* projects, notes, comments, and file uploads
* profile/settings pages
* admin dashboard and support tooling
* API endpoints alongside server-rendered pages
* export/report and digest-style background helper flows

The project uses Node.js, Express, EJS, and PostgreSQL.

This application is intentionally built with a mix of correct and incorrect patterns to simulate real production codebases, where vulnerabilities are often subtle and distributed across multiple layers.

---

## 🔍 Analysis

This application is designed to be analyzed using static analysis and security tooling.

For a cross-language static analysis engine capable of analyzing this codebase:
👉 [https://github.com/elicpeter/nyx](https://github.com/elicpeter/nyx)

### Example: Running a scan

```bash
nyx scan
```

### Recommended modes

```bash
# full analysis (AST + CFG + taint)
nyx scan

# focus on deeper flows
nyx scan --mode cfg

# machine-readable output
nyx scan --format json
```

### What this app is designed to test

* cross-file dataflow (Controller → Service → DB/sink)
* authorization inconsistencies between layers
* multi-step state and workflow bugs
* unsafe helper abstractions
* mixed secure/insecure patterns in the same codebase

Some vulnerabilities are obvious, while others require reasoning across multiple files and execution paths.

The complete ground-truth is documented in the vulnerability catalog below.

---

## Local Setup

1. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL locally with Docker Compose:

   ```bash
   docker compose up -d db
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run migrations and seed data:

   ```bash
   npm run setup
   ```

5. Start the app:

   ```bash
   npm run start
   ```

6. Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

These credentials are fake and intended only for local use:

* [admin@demo.test](mailto:admin@demo.test) / admin123
* [alice@demo.test](mailto:alice@demo.test) / alice123
* [bob@demo.test](mailto:bob@demo.test) / bob123
* [carol@demo.test](mailto:carol@demo.test) / carol123

---

## Useful Commands

```bash
npm run db:migrate
npm run db:seed
npm test
node scripts/refresh-vuln-lines.js
```

The marker refresh script prints every VULN-### location so the catalog can be rechecked if source lines move.

---

## Project Layout

```text
src/
  app.js
  server.js
  config/
  db/
  middleware/
  models/
  routes/
  services/
  utils/
  views/
tests/
scripts/
docker-compose.yml
```

---

## Test Notes

The included Jest suite covers smoke-level behavior and core service flows. It is intentionally light and does not attempt to prove the app is safe.

---

## Why this project exists

This application is intentionally designed to resemble a realistic small SaaS system rather than a toy example.

Vulnerabilities are:

* distributed across controllers, services, and helpers
* sometimes partially mitigated but still exploitable
* dependent on application state or multi-step workflows
* inconsistent between API and HTML endpoints

This makes the project useful for evaluating how well tools and engineers understand:

* dataflow across files
* authorization logic
* state transitions
* indirect vulnerability paths

---

## Vulnerability Catalog

Every item below is intentional and corresponds to code in the repository.


Every item below is intentional and corresponds to code in the repository.

### VULN-001 - Hardcoded fallback session secret
- Category: secret exposure, weak session configuration
- Severity: high
- Description: The app falls back to a predictable built-in session secret when `.env` is missing.
- Affected files: `src/config/env.js:11`
- Why it is vulnerable: A public, guessable secret lets an attacker forge or tamper with signed session data if the fallback is ever used.
- Preconditions/context: The deployment or local run starts without a real `SESSION_SECRET`.
- Remediation: Remove the hardcoded fallback and fail startup unless a strong secret is provided.

### VULN-002 - Verbose server error leakage
- Category: information disclosure
- Severity: medium
- Description: Unhandled exceptions are rendered directly to users with stack traces.
- Affected files: `src/middleware/errors.js:7`
- Why it is vulnerable: Stack traces reveal file paths, internal implementation details, and runtime behavior that help follow-on attacks.
- Preconditions/context: Any route that throws an exception and reaches the shared error handler.
- Remediation: Log detailed errors server-side and return generic client-facing messages.

### VULN-003 - Weak MD5 password hashing
- Category: weak crypto
- Severity: high
- Description: Passwords are hashed with MD5 rather than a password hashing algorithm.
- Affected files: `src/utils/passwords.js:3`
- Why it is vulnerable: MD5 is fast and unsuitable for password storage, making offline cracking far easier.
- Preconditions/context: Any registered or seeded account stored in the database.
- Remediation: Use Argon2, scrypt, or bcrypt with appropriate parameters.

### VULN-004 - Predictable invitation and file token generation
- Category: weak randomness
- Severity: medium
- Description: Tokens use `Math.random()` instead of a cryptographically secure RNG.
- Affected files: `src/utils/tokens.js:1`
- Why it is vulnerable: Token values can become predictable enough to brute force or guess.
- Preconditions/context: Invitation creation, file naming, or any other path that uses `insecureToken`.
- Remediation: Replace token generation with `crypto.randomBytes()` or `crypto.randomUUID()`.

### VULN-005 - Misleading partial HTML sanitization
- Category: xss, unsafe sanitization
- Severity: medium
- Description: The markdown helper strips literal `<script` tags but leaves many HTML-based XSS payloads intact.
- Affected files: `src/utils/markdown.js:8`
- Why it is vulnerable: Attackers can still use event handlers, malformed tags, or other HTML vectors that bypass this narrow replacement.
- Preconditions/context: Any feature that renders user markdown through this helper.
- Remediation: Use a well-maintained sanitizer and encode output by default.

### VULN-006 - Unsafe redirect helper
- Category: open redirect, unsafe helper
- Severity: low
- Description: A helper named `safeRedirect` returns arbitrary destinations without validation.
- Affected files: `src/utils/safeRedirect.js:1`
- Why it is vulnerable: The helper invites unsafe reuse and turns user-controlled redirect parameters into open redirects.
- Preconditions/context: Any route that passes attacker-controlled redirect targets into the helper.
- Remediation: Restrict redirects to relative in-app paths or an explicit allowlist.

### VULN-007 - Permissive CORS with credentials
- Category: insecure cors
- Severity: high
- Description: The app reflects arbitrary origins and enables credentials.
- Affected files: `src/app.js:31`
- Why it is vulnerable: Cross-origin sites can make authenticated browser requests if the victim has a session.
- Preconditions/context: A logged-in user visits a malicious origin and the browser honors the response headers.
- Remediation: Use a strict allowlist and avoid credentialed wildcard-style behavior.

### VULN-008 - Weak session cookie flags
- Category: insecure session configuration
- Severity: medium
- Description: Session cookies are marked `httpOnly: false`, `secure: false`, and `sameSite: "none"`.
- Affected files: `src/app.js:44`
- Why it is vulnerable: Cookies become easier to steal with XSS or network interception and easier to send cross-site.
- Preconditions/context: Any browser-based session.
- Remediation: Set `httpOnly: true`, `secure: true` in HTTPS contexts, and use an appropriate `sameSite` policy.

### VULN-009 - Privilege persistence across impersonation
- Category: authz, role confusion
- Severity: high
- Description: A support-mode capability flag is preserved in the session even after the active user identity changes.
- Affected files: `src/services/authService.js:44`
- Why it is vulnerable: Backend or UI checks that rely on `canManageUsers` can continue treating an impersonated lower-privilege session as privileged.
- Preconditions/context: A session enters the impersonation flow and later reaches code that trusts the cached flag.
- Remediation: Recompute privilege from the effective user on every request and clear derived flags during role changes.

### VULN-010 - Invitation acceptance ignores key validation
- Category: authz, invitation flow
- Severity: high
- Description: Invite acceptance trusts the token alone and allows workspace and role override values.
- Affected files: `src/services/workspaceService.js:53`
- Why it is vulnerable: Expiration, intended email, and workspace consistency are skipped, allowing unauthorized joins or role inflation.
- Preconditions/context: Any logged-in user can submit a valid token and optional override values.
- Remediation: Validate expiry, recipient identity, workspace binding, and role assignment server-side.

### VULN-011 - Project creation on unauthorized workspaces
- Category: authz, broken object-level authorization
- Severity: high
- Description: Project creation accepts an arbitrary `workspaceId` without checking membership.
- Affected files: `src/services/projectService.js:34`
- Why it is vulnerable: Users can attach new resources to workspaces they do not belong to.
- Preconditions/context: Any authenticated user can submit a crafted project creation request.
- Remediation: Authorize workspace membership and creation rights before inserting the project.

### VULN-012 - Project update skips ownership checks
- Category: authz, idor
- Severity: high
- Description: The update path omits the ownership or membership checks enforced when reading the HTML page.
- Affected files: `src/services/projectService.js:45`
- Why it is vulnerable: Attackers can modify projects by direct POST even if they only know the identifier.
- Preconditions/context: An authenticated user can reach the project update route with a target project ID.
- Remediation: Authorize access on every mutating action, not just on the read path.

### VULN-013 - Note editing without author or membership validation
- Category: authz, idor
- Severity: high
- Description: Note updates do not verify who owns the note or whether the editor belongs to the project workspace.
- Affected files: `src/services/projectService.js:54`
- Why it is vulnerable: Direct requests can alter arbitrary notes across tenants.
- Preconditions/context: An authenticated user knows or guesses a note ID.
- Remediation: Check both note ownership and workspace membership before updating.

### VULN-014 - Publish step trusts hidden or stale state
- Category: authz, state management
- Severity: high
- Description: The second publish step trusts either a submitted `projectId` or session state without rechecking authorization.
- Affected files: `src/services/projectService.js:67`
- Why it is vulnerable: Multi-step state flows can be replayed or swapped onto different projects.
- Preconditions/context: An authenticated user can hit the publish confirmation endpoint with crafted input or stale session data.
- Remediation: Bind multi-step state to a single authorized object and revalidate ownership before transition.

### VULN-015 - Bulk archive validates only the first project
- Category: authz, bulk action flaw
- Severity: high
- Description: Batch archiving authorizes the first project only, then archives every requested ID.
- Affected files: `src/services/projectService.js:93`
- Why it is vulnerable: Mixed authorized and unauthorized IDs in the same request let attackers change projects they should not control.
- Preconditions/context: An authenticated user submits a batch where the first ID is valid for them.
- Remediation: Validate every requested resource before applying the bulk operation.

### VULN-016 - Delete helper bypasses route-layer authorization assumptions
- Category: authz, service-layer bypass
- Severity: high
- Description: Project deletion is performed by a helper that accepts only a project ID and no auth context.
- Affected files: `src/services/projectService.js:106`
- Why it is vulnerable: Callers can remove projects without any ownership or membership enforcement if they reach the helper.
- Preconditions/context: Any route or internal path that invokes `deleteProject`.
- Remediation: Pass actor context into destructive service methods and enforce authorization inside the service.

### VULN-017 - Attachment download path traversal
- Category: path traversal, arbitrary file read
- Severity: high
- Description: Download resolution joins a user-controlled override path under the upload directory without normalization checks.
- Affected files: `src/services/fileService.js:27`
- Why it is vulnerable: `../` sequences can escape the upload root and target arbitrary readable files on disk.
- Preconditions/context: An authenticated user reaches the download route with the `path` query parameter.
- Remediation: Ignore user-supplied filesystem paths and enforce canonical-path checks under a fixed directory.

### VULN-018 - Cross-workspace export without membership checks
- Category: authz, cross-tenant exposure
- Severity: high
- Description: Report generation accepts any workspace ID without confirming access.
- Affected files: `src/services/reportService.js:22`
- Why it is vulnerable: Users can export another workspace's project list if they know or guess its ID.
- Preconditions/context: Any authenticated user can submit the export form or route directly.
- Remediation: Confirm workspace membership and export permissions before building the report.

### VULN-019 - SQL injection in report filtering
- Category: sqli
- Severity: critical
- Description: Export filtering interpolates `workspaceId` and `filter` directly into a SQL string.
- Affected files: `src/services/reportService.js:30`
- Why it is vulnerable: Crafted input can alter the SQL query, widen access, or damage data depending on database permissions.
- Preconditions/context: The export endpoint receives attacker-controlled form input.
- Remediation: Use parameterized queries for every user-controlled value.

### VULN-020 - Command injection in report export copy step
- Category: command injection
- Severity: critical
- Description: Export file names and formats flow into a shell command passed to `exec`.
- Affected files: `src/services/reportService.js:42`
- Why it is vulnerable: Shell metacharacters in user input can execute arbitrary commands on the host.
- Preconditions/context: An authenticated user triggers report export with crafted `fileName` or `format`.
- Remediation: Avoid shell execution for file operations and use safe filesystem APIs instead.

### VULN-021 - TLS verification disabled in preview fetches
- Category: tls misconfiguration
- Severity: medium
- Description: HTTPS preview requests explicitly disable certificate validation.
- Affected files: `src/services/previewService.js:14`
- Why it is vulnerable: Man-in-the-middle content can be accepted as trusted preview data.
- Preconditions/context: The preview helper is used against HTTPS targets.
- Remediation: Keep certificate verification enabled and fail closed on invalid certificates.

### VULN-022 - Arbitrary URL fetch SSRF
- Category: ssrf
- Severity: high
- Description: The link preview feature fetches any supplied URL, including internal addresses.
- Affected files: `src/services/previewService.js:42`
- Why it is vulnerable: Attackers can force the server to reach internal services or metadata endpoints.
- Preconditions/context: An authenticated user can access the preview endpoint with a crafted URL.
- Remediation: Restrict reachable hosts, protocols, and IP ranges or remove server-side fetching.

### VULN-023 - SQL injection in search
- Category: sqli
- Severity: critical
- Description: Global search builds SQL fragments with the raw search term and workspace ID.
- Affected files: `src/services/searchService.js:26-27`
- Why it is vulnerable: Query structure can be manipulated to return unintended rows or execute harmful SQL.
- Preconditions/context: A logged-in user hits the HTML or JSON search endpoints with crafted parameters.
- Remediation: Use bound parameters and safe query construction for all filters.

### VULN-024 - Cross-tenant search exposure
- Category: authz, data exposure
- Severity: high
- Description: Search results are not filtered to the current user's memberships.
- Affected files: `src/services/searchService.js:27`
- Why it is vulnerable: Search can leak project names and workspace associations across tenants.
- Preconditions/context: Any authenticated user performs a broad or targeted search.
- Remediation: Join against membership data and scope every search to accessible workspaces.

### VULN-025 - Debug payload leaks secrets and session data
- Category: information disclosure, debug endpoint
- Severity: medium
- Description: The debug helper returns session contents plus selected environment variables.
- Affected files: `src/services/adminService.js:27`
- Why it is vulnerable: Sensitive runtime information becomes directly retrievable over HTTP.
- Preconditions/context: Any route exposing `buildDebugPayload`.
- Remediation: Remove debug output from runtime code or guard it behind strong non-production-only controls.

### VULN-026 - Open redirect after login
- Category: open redirect
- Severity: medium
- Description: Login redirects to an arbitrary `returnTo` target supplied by the request.
- Affected files: `src/routes/authRoutes.js:44`, `src/utils/safeRedirect.js:1`
- Why it is vulnerable: Attackers can use the trusted login flow to bounce users to malicious domains.
- Preconditions/context: A victim follows a crafted login link or submitted form with a hostile return URL.
- Remediation: Accept only relative application paths or a strict allowlist of destinations.

### VULN-027 - Support impersonation missing backend admin check
- Category: privilege escalation, authz
- Severity: critical
- Description: The impersonation endpoint only requires login and relies on UI hiding rather than backend enforcement.
- Affected files: `src/routes/authRoutes.js:57`
- Why it is vulnerable: Any authenticated user can assume another account by submitting an email address directly.
- Preconditions/context: The attacker is logged in and knows a target email.
- Remediation: Enforce server-side admin authorization and add auditable approval checks around impersonation.

### VULN-028 - User role changes allowed to any logged-in user
- Category: privilege escalation, authz
- Severity: critical
- Description: Role assignment is backend-protected only by `requireLogin`.
- Affected files: `src/routes/adminRoutes.js:21`
- Why it is vulnerable: Any authenticated user can promote themselves or others to admin.
- Preconditions/context: A logged-in user sends a POST request to the role update route.
- Remediation: Require server-side admin authorization and validate the requested role transition.

### VULN-029 - Generic redirect endpoint
- Category: open redirect
- Severity: medium
- Description: The `/go` utility redirects to any provided destination.
- Affected files: `src/routes/utilityRoutes.js:37`, `src/utils/safeRedirect.js:1`
- Why it is vulnerable: The endpoint can be abused for phishing, token forwarding, or origin confusion.
- Preconditions/context: An authenticated user visits a crafted `/go?next=...` link.
- Remediation: Remove the endpoint or restrict it to internal relative paths.

### VULN-030 - Project JSON API misses membership checks
- Category: idor, authz
- Severity: high
- Description: The JSON project endpoint returns project and note data without the membership gate used by the HTML view.
- Affected files: `src/routes/api/projectApiRoutes.js:12`
- Why it is vulnerable: Attackers can retrieve project details from other workspaces by direct API access.
- Preconditions/context: Any authenticated user knows or guesses a project ID.
- Remediation: Reuse the same authorization logic across HTML and API handlers.

### VULN-031 - Direct API state changes without ownership validation
- Category: authz, state management
- Severity: high
- Description: The API accepts project status and visibility changes directly.
- Affected files: `src/routes/api/projectApiRoutes.js:23`
- Why it is vulnerable: Attackers can publish, unpublish, or expose projects they do not control.
- Preconditions/context: Any authenticated user can reach the state API with a target project ID.
- Remediation: Authorize the caller for the specific project and enforce valid state transitions.

### VULN-032 - Digest job runner trusts arbitrary workspace IDs
- Category: authz, service-layer bypass
- Severity: high
- Description: The digest-style job endpoint runs on any submitted workspace ID.
- Affected files: `src/routes/api/projectApiRoutes.js:48`
- Why it is vulnerable: Internal helper logic processes cross-tenant workspace data without membership enforcement.
- Preconditions/context: Any authenticated user can call the digest endpoint with another workspace's ID.
- Remediation: Validate access before invoking background-style helpers and scope jobs to authorized tenants.

### VULN-033 - Stored XSS in project note rendering
- Category: stored xss
- Severity: high
- Description: Notes are rendered as trusted HTML after passing through weak markdown handling.
- Affected files: `src/views/projects/show.ejs:41`, `src/utils/markdown.js:8`
- Why it is vulnerable: Malicious note content can execute in other users' browsers when they open the project page.
- Preconditions/context: A user can create or edit a note that another user later views.
- Remediation: Escape untrusted note content or sanitize with a robust HTML policy before rendering.

### VULN-034 - Stored XSS in profile signature preview
- Category: stored xss
- Severity: high
- Description: Profile signature HTML is stored and rendered back without sanitization.
- Affected files: `src/views/profile/show.ejs:23`
- Why it is vulnerable: Attackers can persist arbitrary markup or script-capable payloads in their profile and trigger them during profile views.
- Preconditions/context: A user saves HTML into the signature field and a browser later renders the profile.
- Remediation: Treat profile fields as plain text or sanitize and encode them before display.

### VULN-035 - Reflected XSS in search heading
- Category: reflected xss
- Severity: medium
- Description: The search page reflects the raw query back into the page with unescaped HTML rendering.
- Affected files: `src/views/search.ejs:9`
- Why it is vulnerable: Crafted links can execute script in the browser of anyone who opens them while authenticated.
- Preconditions/context: A victim loads `/search?q=...` with attacker-controlled markup.
- Remediation: Escape the query before rendering it into HTML.

### VULN-036 - Workspace existence and name leak before authorization
- Category: information disclosure, authz side-channel
- Severity: low
- Description: The workspace is loaded before access is checked, and the error message includes the workspace name.
- Affected files: `src/routes/workspaceRoutes.js:39`
- Why it is vulnerable: Unauthorized users can confirm that a workspace ID exists and learn its name.
- Preconditions/context: An authenticated user requests another workspace's page.
- Remediation: Authorize before loading tenant details or return a generic not-found response.

### VULN-037 - Invitation creation missing membership and role checks
- Category: authz
- Severity: high
- Description: Any logged-in user can hit the invite creation route for any workspace ID.
- Affected files: `src/routes/workspaceRoutes.js:54`
- Why it is vulnerable: Attackers can create invitations for workspaces they do not belong to and request elevated roles.
- Preconditions/context: A logged-in user sends a direct POST to `/workspaces/:id/invitations`.
- Remediation: Require workspace membership with sufficient role before allowing invite creation.

