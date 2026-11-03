import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const run=(cmd,args,options={})=>execFileSync(cmd,args,{stdio:'inherit',...options});
const version=JSON.parse(await fs.readFile('package.json','utf8')).version;
if(process.env.GITHUB_REF_NAME && process.env.GITHUB_REF_NAME!==`v${version}`)throw Error('Release tag does not match package version.');
for(const name of ['extension-sdk','extension-tools','extension-sandbox'])if(JSON.parse(await fs.readFile(`packages/${name}/package.json`,'utf8')).version!==version)throw Error('Package version mismatch.');
run('npm',['run','build:sandbox']);run('npm',['run','build']);
await fs.rm('release',{recursive:true,force:true});await fs.mkdir('release/packages',{recursive:true});
for(const name of ['extension-sdk','extension-tools','extension-sandbox']){
  run('npm',['pack',`./packages/${name}`,'--pack-destination','release/packages']);
}
for(const [source,target] of [['templates/digital-twin-extension','digital-twin-extension'],['examples/palmer-museum-extension','palmer-museum-extension']]){
  const dest=path.resolve('release',target);await fs.cp(source,dest,{recursive:true});
  await fs.copyFile('LICENSE',path.join(dest,'LICENSE'));
  await fs.copyFile('.node-version',path.join(dest,'.node-version'));
  await fs.copyFile('.gitignore',path.join(dest,'.gitignore'));
  await fs.cp('release/packages',path.join(dest,'vendor'),{recursive:true});
  run('npm',['install','--package-lock-only','--ignore-scripts','--cache',process.env.npm_config_cache??path.resolve('node_modules/.cache/npm')],{cwd:dest});
  run('tar',['-czf',`release/${target==='digital-twin-extension'?'digital-twin-extension-starter':target}.tar.gz`,'-C','release',target]);
}
run('tar',['-czf','release/developer-portal.tar.gz','-C','dist/developers/extensions','.']);
const artifacts=[...(await fs.readdir('release')).filter(f=>f.endsWith('.tar.gz')).map(f=>'release/'+f),...(await fs.readdir('release/packages')).filter(f=>f.endsWith('.tgz')).map(f=>'release/packages/'+f)];
const lines=[];
for(const file of artifacts)lines.push(`${createHash('sha256').update(await fs.readFile(file)).digest('hex')}  ${path.basename(file)}`);
await fs.writeFile('release/SHA256SUMS',lines.join('\n')+'\n');
