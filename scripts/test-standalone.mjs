import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'dt-external-'));
const run=(cmd,args,options={})=>execFileSync(cmd,args,{stdio:'inherit',...options});
try{
  const project=path.join(temporary,'research');
  run('node',['scripts/create-extension.mjs',project,'external-research']);
  run('git',['init','--quiet',project]);
  for(const file of await fs.readdir(path.join(project,'vendor'))){
    const result=spawnSync('git',['check-ignore','--quiet','vendor/'+file],{cwd:project});
    if(result.status!==1)throw Error(`Vendored SDK is ignored by Git: ${file}`);
  }
  const marker=JSON.parse(await fs.readFile(path.join(project,'.psu-extension.json'),'utf8'));
  if(marker.extensionId!=='external-research'||marker.artifact!=='external-research-{version}.tar.gz')throw Error('Generated repository marker was not renamed.');
  for(const file of [marker.workflow,marker.securityWorkflow])await fs.access(path.join(project,file));
  run('git',['add','.'],{cwd:project});
  run('git',['-c','user.name=Standalone Test','-c','user.email=standalone@example.org','commit','--quiet','-m','Synthetic standalone fixture'],{cwd:project});
  run('npm',['ci','--ignore-scripts'],{cwd:project});
  for(const task of ['build','test','validate'])run('npm',['run',task],{cwd:project});
  const pkg=JSON.parse(await fs.readFile(path.join(project,'package.json'),'utf8'));
  for(const dependency of Object.values(pkg.devDependencies))if(dependency.startsWith('file:')&&!dependency.startsWith('file:./vendor/'))throw Error('Nonportable dependency.');
  // Exercise the default export in a host outside the toolkit checkout.
  const smoke=`import {JSDOM} from 'jsdom';import {createSandbox} from '@penn-state-dt/extension-sandbox';import extension from './dist/index.js';import fs from 'node:fs';const dom=new JSDOM('<main></main>');globalThis.document=dom.window.document;const sandbox=createSandbox(JSON.parse(fs.readFileSync('extension.manifest.json','utf8')),document.querySelector('main'));await sandbox.activate(extension);document.querySelector('button').click();await new Promise(r=>setTimeout(r,0));await sandbox.deactivate();if(sandbox.entities.values.length)throw Error('Leaked entities');console.log('Standalone lifecycle passed');`;
  await fs.writeFile(path.join(project,'smoke.mjs'),smoke);run('node',['smoke.mjs'],{cwd:project});
  await fs.writeFile(path.join(project,'dist/.DS_Store'),'Synthetic ignored Finder metadata');
  run('node',['scripts/release.mjs'],{cwd:project});
  const archive=`release/external-research-${pkg.version}.tar.gz`;
  const listing=execFileSync('tar',['-tzf',archive],{cwd:project,encoding:'utf8'});
  if(!listing.includes('extension.manifest.json')||/\.psu-extension|\.github|\.DS_Store|\/\._|sandbox|node_modules|vendor\//.test(listing))throw Error('Distributable contains source-only or missing extension files.');

  const palmer=path.join(temporary,'palmer');
  await fs.cp('release/palmer-museum-extension',palmer,{recursive:true});
  run('npm',['ci','--ignore-scripts'],{cwd:palmer});
  for(const task of ['build','test','validate'])run('npm',['run',task],{cwd:palmer});
  await fs.writeFile(path.join(palmer,'smoke.mjs'),smoke);run('node',['smoke.mjs'],{cwd:palmer});
}finally{await fs.rm(temporary,{recursive:true,force:true});}
