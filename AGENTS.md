# Agent instructions

Read docs/getting-started.md, docs/security.md, docs/sdk-reference.md and docs/testing.md before implementing. The SDK declarations are authoritative. Never import private Core modules, copy restricted datasets, add credentials, use PSU runners or deploy to production.

Use npm ci, npm run check, npm run release:prepare and npm run test:standalone. Generated projects must work outside this checkout. Keep one manifest source; Vite emits the build copy. Preserve API v1 compatibility and update meaningful tests when changing lifecycle, validation or contracts.

Workflow: read docs → generate starter → inspect installed SDK → implement → sandbox and tests → build/validate → create the author's repository when authorized → release with checksum and source tag → maintainer handoff. A sandbox result never replaces Core integration.

Example Codex request: "Create a v1 extension with a toggle, side panel and synthetic markers using the released starter. Run build, tests and validation. Explain remaining Core integration checks. Do not publish beyond the authorization given."

Before publishing any repository, npm package, draft release or portal artifact, run check:publication and review publication/review.md plus actual packed contents. Human authorization for a repository or release does not authorize publishing private Core data. This project has no production credentials.
