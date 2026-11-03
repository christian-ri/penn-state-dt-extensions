# Manifest reference

Keep extension.manifest.json as the only manifest source. Use extensionManifestPlugin in vite.config.ts to emit the validated artifact manifest.

```json
{
  "id": "my-research",
  "name": "My Research",
  "version": "0.1.0",
  "description": "A reviewed research experience",
  "author": "Research group",
  "apiVersion": "1",
  "entry": "index.js",
  "stylesheet": "style.css",
  "capabilities": ["entities", "ui", "events"]
}
```

Required: id, name, version, description, apiVersion, entry. Optional: author, projectUrl, stylesheet, icon, capabilities. IDs match ^[a-z][a-z0-9-]{1,62}$ for existing v1 compatibility. Versions use SemVer; API versions are positive integer strings. Current runtime support is apiVersion "1". Future valid API versions may validate structurally but cannot run on v1.

projectUrl must be absolute HTTP(S). Artifact paths must be relative, with no traversal, backslashes, URL schemes, query strings or fragments. Entry must be a built .js or .mjs module. Referenced CSS/icon/entry must be regular files. Artifact symlinks and special files are rejected.

Capabilities may contain entities, buildings, spaces, ui, events and network. They describe review scope, not enforced permissions. Unknown manifest fields are not propagated into the validated registry record. Registry enabled is controlled by the maintainer, not the extension manifest.

The public validator deliberately does not accept development URLs in artifacts. The Core may use a separate local-only registry with loopback entry URLs outside production.
