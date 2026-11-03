export const ID_PATTERN = /^[a-z][a-z0-9-]{1,62}$/;
const numeric = '(?:0|[1-9][0-9]*)';
const pre = '(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)';
const semver = new RegExp(`^${numeric}\\.${numeric}\\.${numeric}(?:-${pre}(?:\\.${pre})*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`);
export function validateExtensionManifest(input, options = {}) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {ok:false,errors:['manifest must be an object.']};
  const value = {};
  for (const field of ['id','name','version','description','apiVersion','entry','author','projectUrl','stylesheet','icon']) {
    if (input[field] === undefined && ['author','projectUrl','stylesheet','icon'].includes(field)) continue;
    if (typeof input[field] !== 'string' || !input[field].trim()) errors.push(`${field} must be a non-empty string.`);
    else value[field] = input[field].trim();
  }
  if (value.id && !ID_PATTERN.test(value.id)) errors.push('id must be lowercase kebab-case (2–63 characters).');
  if (value.version && !semver.test(value.version)) errors.push('version must be semantic versioning.');
  if (value.apiVersion && !/^[1-9][0-9]*$/.test(value.apiVersion)) errors.push('apiVersion must be a positive integer string.');
  if (value.projectUrl) {
    try { if (!['https:','http:'].includes(new URL(value.projectUrl).protocol)) throw Error(); }
    catch { errors.push('projectUrl must be an absolute HTTP(S) URL.'); }
  }
  for (const field of ['entry','stylesheet','icon']) {
    const asset = value[field]; if (!asset) continue;
    let remote = false;
    if (options.allowRemoteEntries) {
      try { const u = new URL(asset); remote = ['http:','https:'].includes(u.protocol) && ['localhost','127.0.0.1','[::1]'].includes(u.hostname) && !u.username && !u.password; } catch {}
    }
    if (!remote && (asset.startsWith('/') || /[\\:%?#\x00-\x1f]/.test(asset) || asset.split('/').some(p => !p || p === '.' || p === '..'))) errors.push(`${field} must be a relative artifact path without traversal or URL syntax.`);
  }
  if (input.capabilities !== undefined) {
    const allowed = ['entities','buildings','spaces','ui','events','network'];
    if (!Array.isArray(input.capabilities) || input.capabilities.some(c => typeof c !== 'string' || !allowed.includes(c))) errors.push('capabilities contains an unsupported capability.');
    else value.capabilities = [...new Set(input.capabilities)];
  }
  return errors.length ? {ok:false,errors} : {ok:true,value};
}
export function validateRegistryEntry(input, options = {}) {
  const result = validateExtensionManifest(input, options);
  const errors = result.ok ? [] : [...result.errors];
  if (typeof input?.enabled !== 'boolean') errors.push('enabled must be a boolean.');
  return errors.length ? {ok:false,errors} : {ok:true,value:{...result.value,enabled:input.enabled}};
}
export function validateRegistry(input, options = {}) {
  const entries = Array.isArray(input) ? input : input?.extensions;
  if (!Array.isArray(entries)) return {ok:false,errors:['registry must contain an extensions array.']};
  const errors = [], value = [], ids = new Set();
  entries.forEach((entry,index) => {
    const result = validateRegistryEntry(entry, options);
    if (!result.ok) { errors.push(`extensions[${index}]: ${result.errors.join(' ')}`); return; }
    if (ids.has(result.value.id)) errors.push(`extensions[${index}]: duplicate extension id '${result.value.id}'.`);
    ids.add(result.value.id); value.push(result.value);
  });
  return errors.length ? {ok:false,errors} : {ok:true,value};
}
