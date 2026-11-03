import extension from './src/index';
import { mountSandbox } from '@penn-state-dt/extension-sandbox';
import manifest from './extension.manifest.json';
void mountSandbox(extension, manifest, document.body);
