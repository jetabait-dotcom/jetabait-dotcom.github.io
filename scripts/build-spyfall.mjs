import fs from 'node:fs';
import {build} from 'esbuild';
import {CATALOG} from '../server/spyfall-data.mjs';
fs.writeFileSync('dist/spyfall-catalog.mjs','export const CATALOG='+JSON.stringify(CATALOG)+';\n');
await build({entryPoints:['scripts/spyfall-client.mjs'],bundle:true,minify:true,format:'esm',target:'es2022',charset:'utf8',outfile:'dist/spyfall.js'});
fs.unlinkSync('dist/spyfall-catalog.mjs');
