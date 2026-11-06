# Standalone extension

This source directory is packaged into a self-contained release archive. Run npm run release:prepare at the public repository root first. In the extracted archive: npm ci, npm run build, npm test, npm run validate, npm run dev. See https://github.com/christian-ri/penn-state-dt-extensions/blob/main/docs/getting-started.md.


Repository onboarding is prepared in .psu-extension.json and .github/workflows/. Set your real manifest ID, artifact prefix and repository metadata before connecting. Read [repository connections](https://github.com/christian-ri/penn-state-dt-extensions/blob/main/docs/repository-connections.md). Run npm run release:prepare to build/test/validate/package only dist; publication and platform installation remain separate reviewed steps. Existing published v1.0.1 archives predate this onboarding scaffold.
