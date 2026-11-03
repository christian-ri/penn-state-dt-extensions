import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
test('documentation source links point to existing files',async()=>{
 for(const name of await fs.readdir('docs')){
  const file=path.join('docs',name), text=await fs.readFile(file,'utf8');
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
   const target=match[1];if(/^[a-z]+:|^#/.test(target))continue;
   await assert.doesNotReject(fs.access(path.resolve('docs',target.split('#')[0])),`${file}: ${target}`);
  }
 }
});
