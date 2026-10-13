import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','data.js','app.js']) await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
console.log('Static site copied to dist. No compilation or runtime dependencies.');
