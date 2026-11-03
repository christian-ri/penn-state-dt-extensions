# Getting started

You need Node 22.12 or later, npm and Git. You do not need access to the private Core, PSU credentials, Cesium ion tokens or a server. Use the Node major in `.node-version` for CI.

Download `digital-twin-extension-starter.tar.gz` from a tagged GitHub release, extract it, then:

```sh
cd digital-twin-extension
npm ci
npm run build
npm test
npm run validate
npm run dev
```

Open the Vite URL printed in the terminal. This serves the included SDK development sandbox, not the Digital Twin. Use Activate, Deactivate, Core tool selected and the event controls to inspect the example. Navigation is recorded rather than rendered.

For a source checkout of this public repository:

```sh
npm ci
npm run check
npm run release:prepare
node scripts/create-extension.mjs /tmp/my-research-extension my-research
cd /tmp/my-research-extension
npm ci
npm run build
npm test
npm run validate
npm run dev
```

The generator requires release:prepare first so it can bundle the exact SDK, tools and sandbox tarballs. It fails if the destination exists. Package versions and the single extension.manifest.json are initialized together. Change the title, author and description before submitting.

Edit src/index.ts using only the installed SDK types. Import runtime Cesium objects explicitly from cesium when needed; the Core viewer is never available to extensions. The SDK is a build-time integration contract, not an injection of Core internals.

Use one source manifest. The Vite plugin emits dist/extension.manifest.json automatically. Do not create a public/ manifest copy. Build output contains index.js, style.css and the generated manifest.

Next read [testing](testing.md), [deployment](deployment.md), [security](security.md) and [compatibility](compatibility.md). A successful sandbox run does not prove Core integration.
