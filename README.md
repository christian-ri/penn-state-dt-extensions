# Penn State Digital Twin Extensions

Build API v1 extensions without access to the private Digital Twin Core. This repository contains the supported SDK, artifact validator, standalone starter, Palmer Museum example and local development sandbox.

Start with [Getting started](docs/getting-started.md). Read [SDK reference](docs/sdk-reference.md), [testing](docs/testing.md), [security](docs/security.md) and [deployment](docs/deployment.md). Use tagged releases for reproducible starter archives.

```sh
npm ci
npm run check
npm run release:prepare
npm run test:standalone
```

The sandbox uses synthetic data. Actual Core integration and production installation remain maintainer tasks. No PSU credentials or private Core files are needed for the commands above.

Documentation is maintained once in docs/. npm run build generates HTML and raw Markdown for the public platform's /developers/extensions/ portal. No production deployment is performed by this repository.

MIT licensed. See [LICENSE](LICENSE) and [CONTRIBUTING](CONTRIBUTING.md).
