import fs from 'node:fs/promises';
import path from 'node:path';
const allowlist=JSON.parse(await fs.readFile('publication/allowlist.json','utf8'));
const skip=new Set(['node_modules','dist','release','.git','.DS_Store']);
async function walk(dir='.'){
  const files=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    if(skip.has(entry.name))continue;
    const file=path.join(dir,entry.name).replaceAll('\\','/');
    if(entry.isSymbolicLink())throw Error(`Source symlink: ${file}`);
    if(entry.isDirectory())files.push(...await walk(file));else files.push(file);
  }return files.sort();
}
const files=await walk();
if(JSON.stringify(files)!==JSON.stringify([...allowlist].sort()))throw Error('Publication inventory changed. Review files and update publication/allowlist.json explicitly.');
for(const file of files){
  const text=await fs.readFile(file,'utf8');
  if(/(?:gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16})/.test(text))throw Error(`Credential pattern: ${file}`);
  if(!file.startsWith('scripts/check-publication')&&/\/data\/cvr|\.env\.production|PSU_DEPLOY_PATH|PSU_ENV_PATH/.test(text))throw Error(`Internal operations detail: ${file}`);
  if(file.startsWith('.github/workflows/')&&/self-hosted|pull_request_target/.test(text))throw Error(`Unsafe public workflow: ${file}`);
}
console.log(`Reviewed publication inventory: ${files.length} source files; inspect packed artifacts before publishing.`);
