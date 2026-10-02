import {writeFile} from 'node:fs/promises';
import {data} from '../data.mjs';
import {plan} from '../planner.mjs';
const checks=[];
for(let delay=0;delay<=14;delay++)for(const alternateCapacity of [0,1,20,50,80])for(const transferCapacity of [0,1,20,60])for(const alternateApproved of [true,false])for(const expediteEnabled of [true,false]){
  const input={delay,alternateCapacity,transferCapacity,alternateApproved,expediteEnabled};
  const p=plan(input);
  checks.push({input,expected:p.candidates.map(c=>({name:c.name,filled:c.filled,cost:c.cost,uncovered:c.uncovered,atRiskValue:c.atRiskValue}))});
}
const target=process.argv[2];if(!target)throw new Error('Supply a workspace scratch JSON path');
await writeFile(target,JSON.stringify({data,checks}));
console.log(`Exported ${checks.length} Python parity checks.`);
