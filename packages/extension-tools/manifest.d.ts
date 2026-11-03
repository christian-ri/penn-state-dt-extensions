import type { ExtensionManifest, ExtensionRegistryEntry } from '@penn-state-dt/extension-sdk';
export type ValidationResult<T> = {ok:true;value:T} | {ok:false;errors:string[]};
export const ID_PATTERN: RegExp;
export function validateExtensionManifest(input:unknown, options?:{allowRemoteEntries?:boolean}):ValidationResult<ExtensionManifest>;
export function validateRegistryEntry(input:unknown, options?:{allowRemoteEntries?:boolean}):ValidationResult<ExtensionRegistryEntry>;
export function validateRegistry(input:unknown, options?:{allowRemoteEntries?:boolean}):ValidationResult<ExtensionRegistryEntry[]>;
