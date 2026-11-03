import test from 'node:test';
import assert from 'node:assert/strict';
import {validateArtifact} from '@penn-state-dt/extension-tools';
test('built artifact is API v1 and installable', async()=>{const {manifest}=await validateArtifact('dist');assert.equal(manifest.apiVersion,'1');});
