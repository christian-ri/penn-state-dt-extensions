# Connect a repository to the Extension Portal

Portal: [https://i6-dt-platform.vmhost.psu.edu/dt-platform/extension-portal/](https://i6-dt-platform.vmhost.psu.edu/dt-platform/extension-portal/)

There are three separate decisions: connect a source repository, review each exact
release, and authorize installation. A push, successful build, connection request,
published release or portal approval alone never installs code on the platform.

## Required source files

The filename is **.psu-extension.json** (singular), at the repository root beside the
single source extension.manifest.json. The manifest must pass the SDK validator and
use apiVersion "1". The marker opts in to this platform and names real workflows:

```json
{
  "schemaVersion": 1,
  "platform": "penn-state-dt",
  "extensionId": "my-extension",
  "workflow": ".github/workflows/ci.yml",
  "securityWorkflow": ".github/workflows/security.yml",
  "artifact": "my-extension-{version}.tar.gz"
}
```

extensionId must equal the manifest ID. Replace my-extension in both fields. Both
workflow files must exist at the exact named paths on the repository default branch.
The artifact pattern must match the published release asset, e.g.
my-extension-0.2.1.tar.gz. One {version} placeholder is supported. Do not use the
GitHub Actions ZIP wrapper. Keep the source marker, .github workflows, development
sandbox, vendor packages and source credentials out of the distributable: archive
only validated dist. New source-generated starters and examples include these files;
existing v1.0.1 release archives need the retrofit below.

## Connect using GitHub

1. Commit/push the manifest, marker and workflows to your own repository default branch.
2. Sign in to the portal with GitHub and a verified email, rather than the fixed local
   administrator account when claiming a repository.
3. Choose **Choose repositories on GitHub**, then **Only select repositories** and
   the extension repository. This is a separate read-only GitHub App, not broader
   OAuth repo permission for the login. Organization policy may require approval.
4. After returning, the App installation ID should be filled. Choose **Find compatible
   repositories**; check subsequent pages if needed. Public personally-owned repos can
   also be checked without an App installation, subject to public API rate limits.
5. Select the compatible repository and choose **Request admin approval**. Ownership
   or admin/maintain rights are verified by GitHub; a copied marker is not authority.
6. The platform maintainer reviews the source snapshot and confirms the immutable
   request through the platform's separate protected GitHub workflow. If the source
   changes before approval, create a fresh connection request. Authors get no platform
   SSH, production runner or installation credentials.
7. After connection approval, stable GitHub Releases are checked every twelve hours
   (schedules can be delayed) or when the maintainer starts discovery. This imports
   candidates for review, not automatic production installation.

GitHub's own installation selector can show unrelated repositories. The portal's
selector filters by actual permissions, valid API 1 manifest, matching marker and
workflow existence. These prove technical compatibility, not harmless behavior.
Admin review, numeric repository identity, permanent extension-ID binding and
per-release source/data/security/integration checks remain mandatory.

## Publish a discoverable release

Keep extension ID stable. Increase the stable major.minor.patch version in both
package.json and extension.manifest.json and update the lockfile. Never replace an
old version's archive or move an existing tag: the platform rejects different bytes
under the same version and ordinary downgrades. Rollback is a separate maintainer action.

The included ci.yml builds/tests/validates on hosted runners, packages only dist,
then on an explicitly pushed vX.Y.Z tag attests the exact archive in a separate job
and prepares a **draft** GitHub Release. No project build scripts run with attestation
or release-write credentials. Review exact artifacts, checksums, data permissions,
provenance and both workflow results before publishing the draft. Do not rebuild the
archive after attestation. Archive basename, manifest version and tag must agree.

The security.yml checks known high/critical dependency vulnerabilities with npm audit
and scans JavaScript/TypeScript/secrets with Semgrep. Review findings rather than
suppressing checks to force discovery. Review and pin action/scanner versions under
your project's maintenance policy. A successful workflow named security is not proof
of complete security. Registry rules and advisory databases can change over time.

The platform requires successful push runs of the configured build and security
workflows for the exact release commit, and an artifact attestation matching the
configured repository, workflow, source commit and archive digest. It additionally
validates and scans the built archive in an isolated environment. All original
source/data/integration requirements still apply. GitHub artifact attestations for
private repositories depend on account/plan; if unsupported, use manual submission
instead of granting broader permissions or weakening provenance checks.

## Retrofit an existing v1.0.1 project

Keep the installed SDK API and vendor versions unchanged unless separately upgrading.
Add the marker above and adapt the author's ci.yml, security.yml and scripts/release.mjs
from the current source starter. Preserve project-specific checks and packaging.
Confirm new workflows run on push, including tags, use hosted runners and have no
platform access. Keep source manifest as the only manifest source. Do not edit dist
by hand. Commit/push onboarding source before asking the portal to rescan. For a new
release, bump the extension's own version; do not republish v0.2.0 with new bytes.

## Manual upload is still supported

Upload the validated tar.gz with its exact SHA-256, source repository/40-character
commit, test evidence and data/network note. After upload, **email cvr5739@psu.edu**
with submission ID, extension/version and checksum to request installation. The portal
provides a prefilled mailto; it does not send that email for you. Automated status
notifications may be unavailable until the platform configures its mail provider.
Structural and malware scans, maintainer review and protected installation approval
still apply. Contacting the admin is a request, not an installation authorization.

## Checklist for AI coding agents

- Read AGENTS.md, getting-started, security, testing, deployment and this document.
- Inspect existing manifest, scripts, workflow paths and published asset naming before
  writing a marker; never point to a workflow that does not exist.
- Preserve stable ID; synchronize marker ID and artifact prefix when generating or
  renaming a project. Keep a single source manifest and preserve API 1 compatibility.
- Run build, tests, validation and packaging. Inspect actual tar members: only built
  extension assets; no source marker, .github, sandbox, secrets or private Core files.
- Confirm checksum, source commit, tag/version, release filename and attestation all
  refer to the same bytes. A plain provenance.json is metadata, not a signed attestation.
- Distinguish implemented files, committed source, pushed default branch, compatible
  portal selection, approved connection, published release, passed scans, installation
  and activation. Report the actual achieved state and remaining human/platform steps.
- Never request App private keys, personal tokens, login cookies or production access.
  The maintainer configures App credentials. Request only required repository access.
- Obtain publication authorization and data-owner approval for your project. Do not
  publish a tag/release, change repository visibility or request production installation
  merely because build or sandbox tests pass. Never use platform-owned runners.
