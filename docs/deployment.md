# Releases and maintainer handoff

Extension authors own their repositories and release artifacts. Core maintainers own integration and installation. This toolkit does not grant production access.

1. Commit source, including vendor/*.tgz. Create/push a matching version tag only after checks, data review and publication authorization. For the original toolkit v1.0.0 starter, run git add --force vendor/*.tgz because its generated ignore file excluded those tarballs. Toolkit v1.0.1 corrects this automatically.
2. Run npm ci, npm run build, npm test and npm run validate.
3. Inspect dist for private data, unexpected dependencies and source maps.
4. Archive only dist; compute SHA-256 for the archive you submit.
5. Either connect the eligible repository and publish a reviewed, correctly attested release, or manually upload the archive in the Extension Portal. Supply exact repository/tag/commit, checksum, manifest, compatibility notes and data/network handling. After manual upload email cvr5739@psu.edu with submission ID/version/checksum.
6. The platform performs isolated artifact scans. The maintainer reviews source/dependencies/data, verifies exact bytes/provenance and tests integration in the private Core environment. A clean malware scan does not establish safety.
7. The maintainer explicitly confirms installation through the protected platform workflow and selects activation separately. Repository connection and portal approval do not authorize production installation. Authors do not receive SSH, runner access or server paths.

Updates follow the same process. Preserve earlier reviewed artifacts for rollback. Disable prevents future loads after refresh; it does not remove code already running in an open browser.

## Toolkit maintainer release

Run npm ci, npm run check, npm run release:prepare and npm run test:standalone. Review publication/review.md and run npm run check:publication. Tag the matching toolkit version only when package versions, compatibility notes and CHANGELOG agree. The release workflow runs tests on GitHub-hosted runners and creates a draft release with packages, starter, Palmer example, documentation portal and SHA256SUMS. Review actual archive/package contents before publishing the draft. Never attach Core files or change the workflow to a PSU runner.

SDK package tarballs are vendored inside starter/example archives with npm integrity in their lockfiles. This avoids a private registry or npm publication requirement. Future npm publication can use the same packages after namespace ownership is verified.


## Extension Portal and automatic release discovery

Read [Repository connections](repository-connections.md) for the source marker, read-only GitHub App selection, administrator connection approval, signed release requirements and manual-upload fallback. New source-generated starters include onboarding files; old v1.0.1 archives need the documented retrofit. After manual upload contact cvr5739@psu.edu with submission ID/version/checksum. Connection or release publication does not install an extension.
