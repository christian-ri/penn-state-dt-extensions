import fs from 'node:fs/promises';
import path from 'node:path';
import { validateExtensionManifest } from './manifest.mjs';
export { validateExtensionManifest, validateRegistry, validateRegistryEntry } from './manifest.mjs';
export async function validateArtifact(directory) {
  const artifactDir = await fs.realpath(directory);
  if (!(await fs.stat(artifactDir)).isDirectory()) throw Error('Artifact must be a directory.');
  async function walk(dir) {
    for (const name of await fs.readdir(dir)) {
      const file = path.join(dir,name), stat = await fs.lstat(file);
      if (stat.isSymbolicLink() || (!stat.isFile() && !stat.isDirectory())) throw Error(`Unsupported artifact file: ${path.relative(artifactDir,file)}`);
      if (/^\.env(?:\.|$)|^\.git$|^node_modules$/.test(name)) throw Error(`Private or unexpected artifact file: ${name}`);
      if (stat.isDirectory()) await walk(file);
    }
  }
  await walk(artifactDir);
  const result = validateExtensionManifest(JSON.parse(await fs.readFile(path.join(artifactDir,'extension.manifest.json'),'utf8')));
  if (!result.ok) throw Error(result.errors.join(' '));
  const manifest = result.value;
  for (const field of ['entry','stylesheet','icon']) if (manifest[field]) {
    const file = path.resolve(artifactDir,manifest[field]);
    const relative = path.relative(artifactDir,file);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || !(await fs.stat(file)).isFile()) throw Error(`Missing or invalid ${field}: ${manifest[field]}`);
  }
  if (!/\.m?js$/.test(manifest.entry)) throw Error('entry must be a built JavaScript module.');
  return {artifactDir,manifest};
}
export function extensionManifestPlugin(manifest) {
  const result = validateExtensionManifest(manifest);
  if (!result.ok) throw Error(result.errors.join(' '));
  return {name:'extension-manifest',generateBundle() { this.emitFile({type:'asset',fileName:'extension.manifest.json',source:JSON.stringify(result.value,null,2)+'\n'}); }};
}
