import { defineConfig } from 'vite';
import { extensionManifestPlugin } from '@penn-state-dt/extension-tools';
import manifest from './extension.manifest.json';
export default defineConfig({base:'./',plugins:[extensionManifestPlugin(manifest)],build:{lib:{entry:'src/index.ts',formats:['es'],fileName:()=> 'index.js',cssFileName:'style'},rollupOptions:{output:{assetFileNames:'[name][extname]'}}}});
