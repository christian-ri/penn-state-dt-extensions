# Testing

Run npm run check at this repository root. It compiles the sandbox, tests contracts, artifacts and lifecycle, checks TypeScript consumers, builds docs and audits the publication inventory. npm run release:prepare creates standalone bundles. Run node scripts/test-standalone.mjs to generate and build a project outside the repository.

In a generated project: npm ci, npm run build, npm test, npm run validate. The artifact test validates dist, so build before test. npm run dev opens the local SDK host.

## Sandbox fidelity

| Feature | Supported locally | Still requires Core |
| --- | --- | --- |
| Toolbar, side panel, overlay | Real DOM, toggles, render cleanup | Actual toolbar layout and stacking |
| Entities | Real Cesium Entity and EntityCollection, ownership | Rendering, picking, clamping and terrain |
| GeoJSON | Inline FeatureCollection data ownership | Geometry/style fidelity and URL loading |
| Buildings/spaces | Synthetic list/find/highlight | Real data availability and IDs |
| Events | Explicit event controls and isolated handlers | Actual Core selection and timing |
| Navigation | Recorded calls, missing-asset failure | Camera movement and loaded assets |
| API | Configured response fixtures and AbortSignal | Auth, routing, permissions, proxy and real data |
| Lifecycle | Activate, deactivate, failure and cleanup | Browser session and registry behavior |

GeoJSON options are recorded, not implemented. Sandbox fetching never calls a real service. Custom response fixtures use createSandbox options.responses keyed by request path. Entity coordinates do not render a map.

## Real integration checklist

A Core maintainer installs the exact reviewed artifact in a private test environment. Check protected serving, production base path, imports, CSS/assets, viewer readiness, real data, missing data, toolbar exclusivity, overlays, event handlers, navigation fallback and cleanup. Test one failing extension alongside a healthy one. Repeat with existing v1 artifacts. Refresh browsers after registry changes.

A staging instance is optional, requires approved access and data handling, and must not give external repositories production credentials. No staging service is created by this toolkit.
