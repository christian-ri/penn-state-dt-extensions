import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
const version=JSON.parse(await fs.readFile('package.json','utf8')).version;
const out='dist/developers/extensions';
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out,{recursive:true});
const files=(await fs.readdir('docs')).filter(f=>f.endsWith('.md')).sort();
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const nav=files.map(file=>`<a href="${file.replace('.md','.html')}">${escape(file.replace('.md',''))}</a>`).join(' · ');
for(const file of files){
  const markdown=await fs.readFile(path.join('docs',file),'utf8');await fs.writeFile(path.join(out,file),markdown);
  const content=marked.parse(markdown.replaceAll('../packages/','packages/').replace(/\]\(([^():#]+)\.md(#[^)]*)?\)/g,']($1.html$2)'));
  await fs.writeFile(path.join(out,file.replace('.md','.html')),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Extension API v1 — ${escape(file)}</title><style>body{font:18px/1.6 system-ui;max-width:70rem;margin:2rem auto;padding:1rem;color:#142b48}nav{font-size:14px}pre{overflow:auto;background:#f1f4f8;padding:1rem}table{border-collapse:collapse}td,th{border:1px solid #aaa;padding:.5rem}a{color:#164f9a}</style><header><a href="index.html">Penn State Digital Twin Developers</a><p>SDK ${version} · stable API v1 · <a href="${file}">Raw Markdown</a> · <a href="https://github.com/christian-ri/penn-state-dt-extensions">Source and releases</a></p><nav>${nav}</nav></header><main>${content}</main></html>`);
}
await fs.copyFile(path.join(out,'getting-started.html'),path.join(out,'index.html'));
await fs.writeFile(path.join(out,'llms.txt'),(await fs.readFile('llms.txt','utf8')).replaceAll('docs/',''));
await fs.writeFile(path.join(out,'version.json'),JSON.stringify({sdkVersion:version,apiVersion:'1'},null,2));
await fs.mkdir(path.join(out,'packages/extension-sdk'),{recursive:true});
await fs.copyFile('packages/extension-sdk/index.d.ts',path.join(out,'packages/extension-sdk/index.d.ts'));
console.log(`Generated ${files.length} HTML/Markdown documents in ${out}`);
