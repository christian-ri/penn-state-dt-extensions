import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validateArtifact} from '@penn-state-dt/extension-tools';
// Keep macOS extended attributes out of portable release archives.
process.env.COPYFILE_DISABLE='1';
const {manifest}=await validateArtifact('dist');
const pkg=JSON.parse(await fs.readFile('package.json','utf8'));
const connection=JSON.parse(await fs.readFile('.psu-extension.json','utf8'));
if(pkg.version!==manifest.version || connection.extensionId!==manifest.id || connection.artifact!==manifest.id+'-{version}.tar.gz') throw Error('Package, manifest and repository marker must agree.');
await fs.mkdir('release',{recursive:true});
const archive=`${manifest.id}-${manifest.version}.tar.gz`;
execFileSync('tar',['--exclude=.DS_Store','--exclude=._*','-czf','release/'+archive,'-C','dist','.']);
const sha256=crypto.createHash('sha256').update(await fs.readFile('release/'+archive)).digest('hex');
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
await fs.writeFile('release/SHA256SUMS',`${sha256}  ${archive}\n`);
await fs.writeFile('release/provenance.json',JSON.stringify({manifest,sourceCommit,sha256},null,2)+'\n');
console.log('Prepared '+archive+'; publishing and platform installation require separate review.');
