import fs from 'node:fs/promises';
import path from 'node:path';
const dest=path.resolve(process.argv[2]||'dist');
await fs.mkdir(dest,{recursive:true});
const html=(await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8'))
 .replace('href="/style.css"','href="./style.css"').replace('src="/app.js"','src="./app.js"')
 .replace('href="/"','href="./"')
 .replace('SYNTHETIC DEMO · LOCAL','SYNTHETIC BROWSER DEMO')
 .replace('Local prototype with synthetic data. Snowflake and AI are not connected yet. Explanations below come from the verified planner.','Browser demo with synthetic data. The submission video demonstrates the native Snowflake integration separately. These explanations come from the deterministic planner.');
let app=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
const old="const response=await fetch('/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({delay:Number($('delay').value),alternateCapacity:Number($('alternate').value),transferCapacity:Number($('transfer').value),alternateApproved:$('approved').checked,expediteEnabled:$('expedite').checked})});\n    const p=await response.json();if(!response.ok)throw new Error(p.error);";
if(!app.includes(old))throw new Error('Planner request anchor changed. Review the static build before publishing.');
app=app.replace(old,"const p=plan({delay:Number($('delay').value),alternateCapacity:Number($('alternate').value),transferCapacity:Number($('transfer').value),alternateApproved:$('approved').checked,expediteEnabled:$('expedite').checked});");
const load="try{const r=await fetch('/api/data');if(!r.ok)throw new Error('Could not load synthetic data');fixture=await r.json();await run();}catch(e){$('status').textContent=e.message;$('status').classList.add('error');}";
if(!app.includes(load))throw new Error('Fixture request anchor changed.');
app="import {data} from './data.mjs';\nimport {plan} from './planner.mjs';\n"+app.replace(load,"fixture=data; await run();");
for(const [name,content] of [['index.html',html],['app.js',app],['.nojekyll','']])await fs.writeFile(path.join(dest,name),content);
for(const [src,name] of [['../public/style.css','style.css'],['../planner.mjs','planner.mjs'],['../data.mjs','data.mjs']])await fs.copyFile(new URL(src,import.meta.url),path.join(dest,name));
console.log(`Static synthetic preview built in ${dest}. No Snowflake credentials or remote API calls.`);
