import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {validateExtensionManifest,validateRegistry} from '../packages/extension-tools/manifest.mjs';
import {validateArtifact} from '../packages/extension-tools/index.mjs';
const manifest={id:'research-demo',name:'Demo',description:'Synthetic',version:'1.0.0',apiVersion:'1',entry:'index.js',stylesheet:'style.css'};
test('SemVer accepts prerelease plus build metadata and future APIs',()=>{
  for(const version of ['1.0.0','0.1.0','1.2.3-alpha.1+build.42'])assert.equal(validateExtensionManifest({...manifest,version}).ok,true,version);
  assert.equal(validateExtensionManifest({...manifest,apiVersion:'2'}).ok,true);
});
test('invalid versions and API numbers fail',()=>{
  for(const version of ['01.0.0','1.0','1.0.0-01','1.0.0+'])assert.equal(validateExtensionManifest({...manifest,version}).ok,false,version);
  for(const apiVersion of ['0','01','1.1','-1'])assert.equal(validateExtensionManifest({...manifest,apiVersion}).ok,false);
});
test('artifact paths reject traversal, absolutes, schemes and encoded forms',()=>{
  for(const entry of ['/index.js','../index.js','a/../index.js','a\\index.js','https://example.org/x.js','file:x','//localhost/a','%2e%2e/a','a?x','a#x','a//b','./a'])assert.equal(validateExtensionManifest({...manifest,entry}).ok,false,entry);
  assert.equal(validateExtensionManifest({...manifest,entry:'assets/index.js'}).ok,true);
});
test('development URLs are loopback only and never default-enabled',()=>{
  for(const entry of ['http://127.0.0.1:5175/src/index.ts','http://[::1]:5175/src/index.ts']){
    assert.equal(validateExtensionManifest({...manifest,entry},{allowRemoteEntries:true}).ok,true);
    assert.equal(validateExtensionManifest({...manifest,entry}).ok,false);
  }
  assert.equal(validateExtensionManifest({...manifest,entry:'https://evil.test/a'},{allowRemoteEntries:true}).ok,false);
});
test('optional metadata is validated and registry IDs are unique',()=>{
  assert.equal(validateExtensionManifest({...manifest,capabilities:['root']}).ok,false);
  assert.equal(validateExtensionManifest({...manifest,projectUrl:'javascript:alert(1)'}).ok,false);
  assert.equal(validateRegistry({extensions:[{...manifest,enabled:true},{...manifest,enabled:false}]}).ok,false);
});
test('artifact validation checks files, directories, private files and symlinks',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'dt-artifact-'));
  try{
    await fs.writeFile(path.join(dir,'extension.manifest.json'),JSON.stringify(manifest));
    await fs.writeFile(path.join(dir,'index.js'),'export default {activate(){}}');
    await assert.rejects(validateArtifact(dir));
    await fs.mkdir(path.join(dir,'style.css'));await assert.rejects(validateArtifact(dir));
    await fs.rmdir(path.join(dir,'style.css'));await fs.writeFile(path.join(dir,'style.css'),'');
    assert.equal((await validateArtifact(dir)).manifest.id,manifest.id);
    await fs.symlink(path.join(dir,'index.js'),path.join(dir,'linked.js'));await assert.rejects(validateArtifact(dir),/Unsupported/);
    await fs.unlink(path.join(dir,'linked.js'));await fs.writeFile(path.join(dir,'.env'),'secret');await assert.rejects(validateArtifact(dir),/Private/);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
