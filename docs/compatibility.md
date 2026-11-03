# Compatibility

| Toolkit / SDK | Manifest API | Core requirement | Distribution |
| --- | --- | --- | --- |
| 1.0.0 | "1" | Runtime implementing documented stable v1 contract | GitHub release npm tarballs |

The initial public release preserves the existing v1 SDK signatures and actual browser behavior. Core version numbers are not invented; a maintainer must record the tested Core commit in each integration report. Existing compiled v1 extensions do not need rebuilding solely because the SDK is distributed publicly.

SDK/tool versions follow SemVer separately from manifest apiVersion. Breaking runtime capabilities require a new explicit API version. Typing corrections must be reviewed for source compatibility. Runtime values are available only where an implementation is exported.

The shared validator rejects unsafe paths, invalid optional metadata and malformed SemVer more strictly than earlier copies. Review installed manifests before upgrading. A structurally valid future API version is not runtime compatibility.

Use the committed lockfiles and vendor tarballs. Do not install an arbitrary latest SDK or independently modify vendored declarations. Retain previous artifacts and registry snapshots for rollback.
