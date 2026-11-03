import type { ExtensionManifest } from '@penn-state-dt/extension-sdk';
export * from './manifest.mjs';
export function validateArtifact(directory:string):Promise<{artifactDir:string;manifest:ExtensionManifest}>;
export function extensionManifestPlugin(manifest:unknown):{name:string;generateBundle(this:{emitFile:(asset:{type:'asset';fileName:string;source:string})=>unknown}):void};
