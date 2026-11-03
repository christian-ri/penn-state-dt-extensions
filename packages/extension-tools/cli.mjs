#!/usr/bin/env node
import { validateArtifact } from './index.mjs';
try {
  const [command,directory] = process.argv.slice(2);
  if (command !== 'validate' || !directory) throw Error('Usage: dt-extension validate <artifact-directory>');
  const {manifest} = await validateArtifact(directory);
  console.log(`Valid: ${manifest.id}@${manifest.version} (API ${manifest.apiVersion}); source/security review still required.`);
} catch (error) { console.error(error.message); process.exitCode=1; }
