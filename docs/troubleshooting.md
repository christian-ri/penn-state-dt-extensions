# Troubleshooting

- Vite shows no extension: use the included index.html and sandbox.ts with npm run dev; an ES module alone is not a preview page.
- Missing vendor tarball: download the release starter, or run npm run release:prepare before create-extension in a source checkout.
- Type errors on marker.show: use the full released SDK, not the former unknown-based starter copy.
- Native esbuild/rollup platform error: install using npm ci on the machine where Node runs; do not copy node_modules between architectures. Keep Node and npm on the same architecture.
- Invalid manifest: run npm run validate after build. Edit only the root manifest and rebuild.
- Missing CSS or entry: validate dist, not the source directory. Use relative asset paths and the supplied Vite library configuration.
- API returns 404 in sandbox: configure responses; the local host never calls Core services. In Core, the maintainer must provide the route.
- Asset navigation fails locally: expected; use coordinate fallback and test the real asset with a maintainer.
- Awaiting viewer-ready hangs activation: subscribe in activate and return; do not wait for the event there.
- Markers remain after toggle Off: set show=false in onChange(false). Toggle Off is different from deactivation.
- Timers or fetches continue after deactivate: clear timers and abort extension-owned requests yourself.
- Artifact passes validation but fails in Core: structural validation does not prove default export correctness, security, rendering or API behavior; follow the integration checklist.
