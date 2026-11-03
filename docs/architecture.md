# Architecture

API v1 extensions are independently built ES modules. The private Core owns authentication, its Cesium viewer, campus datasets, registry, serving and runtime lifecycle. Extensions use only the public SDK contract. SDK package version and manifest apiVersion are separate: package corrections do not change API v1.

This public repository is the source of truth for SDK, starter, development host and documentation. Released tarballs are npm-compatible packages. The private Core consumes a reviewed, pinned distribution. Documentation HTML and raw Markdown are generated from these files; never maintain a second editorial copy on the platform website.

Trust flow: external source → public CI → release artifact → maintainer source and data review → private Core integration → maintainer installation. Public CI has no Core, PSU runner, server credentials or production deployment permissions. A checksum verifies artifact identity, not trustworthiness.

The SDK is a supported architectural interface. Same-origin JavaScript can use browser APIs beyond it and runs in the authenticated browser context. API v1 is not a hostile-code sandbox. Capability metadata is not authorization.

The development sandbox has no Core source and no network backend. It uses synthetic fixtures, real DOM containers and Cesium entity data objects. It does not emulate rendering, tile height, real navigation, PSU authentication or campus asset availability.
