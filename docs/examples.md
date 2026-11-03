# Examples

The starter demonstrates a typed marker, toolbar toggle, side panel and visibility management. The complete Palmer example demonstrates synthetic sensor readings, trend charts, side panel, map overlay and navigation fallback. It contains no live telemetry. A referenced asset ID is an example identifier, not permission to access an asset; its absence is handled by a coordinate fallback.

Run npm run release:prepare, extract the generated Palmer archive, then npm ci, npm run build, npm test, npm run validate and npm run dev. The source template is packaged by the same release tool as the starter.

Contract tests cover additional building/space lookups, events, GeoJSON ownership, fetch fixtures and cleanup. See tests/sandbox.test.mjs for executable SDK examples. These examples do not include proprietary campus datasets or Core backend implementations.
