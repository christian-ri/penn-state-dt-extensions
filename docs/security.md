# Security and publication

API v1 runs trusted, reviewed JavaScript in an authenticated browser context. It is not a security sandbox. SDK restrictions and capability metadata do not prevent a malicious bundle from using browser APIs.

Never include secrets, auth tokens, service credentials, restricted research data, personal data, Core environment files or internal infrastructure configurations. VITE_* values and bundled source maps are visible to users. Use a maintainer-approved backend for private API access; never embed a private key in browser code.

Public workflows use GitHub-hosted runners and least permissions. They have no PSU access and no production deployment rights. The toolkit does not install releases into production. Every extension release requires source/data review and Core-maintainer installation.

Before every publication inspect publication/review.md, the explicit source inventory, npm pack output, release archive entries, checksums and generated documentation. Secret scanning is an additional check, not a substitute for data-owner and source review. Archive extraction must reject path traversal, symlinks and special files before running the installer.

Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/christian-ri/penn-state-dt-extensions/security/advisories/new), which is enabled for this repository. Do not post exploit details, credentials or restricted data in public issues.

Repository markers and workflow names establish compatibility only. Source and bundled-code behavior still require review. Never grant production access to author workflows. Separate build jobs from attestation and release-write jobs; attest/publish exact reviewed bytes. Checksums and unsigned provenance.json do not prove source authenticity or safety. See [repository connections](repository-connections.md) for selected-repository GitHub App access and private attestation limitations.
