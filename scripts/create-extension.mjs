import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ID_PATTERN } from '../packages/extension-tools/manifest.mjs';
const base=fileURLToPath(new URL('../',import.meta.url));
const [directory,id]=process.argv.slice(2);
if(!directory||!ID_PATTERN.test(id??''))throw Error('Usage: node scripts/create-extension.mjs <new-directory> <extension-id>');
const destination=path.resolve(directory);
try{await fs.lstat(destination);throw Error('Destination already exists.');}catch(error){if(error.code!=='ENOENT')throw error;}
const source=path.join(base,'release/digital-twin-extension');
await fs.access(path.join(source,'package-lock.json'));
await fs.cp(source,destination,{recursive:true,errorOnExist:true,force:false});
const manifest=JSON.parse(await fs.readFile(path.join(destination,'extension.manifest.json'),'utf8'));
manifest.id=id;manifest.name=id;await fs.writeFile(path.join(destination,'extension.manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const connection=JSON.parse(await fs.readFile(path.join(destination,'.psu-extension.json'),'utf8'));
connection.extensionId=id;connection.artifact=id+'-{version}.tar.gz';
await fs.writeFile(path.join(destination,'.psu-extension.json'),JSON.stringify(connection,null,2)+'\n');
for(const name of ['package.json','package-lock.json']){
  const file=path.join(destination,name),data=JSON.parse(await fs.readFile(file,'utf8'));data.name=id+'-extension';
  if(data.packages?.[''])data.packages[''].name=data.name;
  await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
}
console.log(destination);
