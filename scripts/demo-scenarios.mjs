import {plan} from '../planner.mjs';
const cases = [
  {label:'Seven-day delay',input:{delay:7}},
  {label:'Transport recovery fails',input:{delay:12}},
  {label:'No alternate capacity',input:{delay:12,alternateCapacity:0}},
];
console.log(JSON.stringify(cases.map(({label,input})=>{
  const p=plan(input);
  return {label,input,baseline:{filled:p.baseline.filled,exposureINR:p.baseline.atRiskValue},recommended:{strategy:p.best.name,onTimeUnits:p.best.filled,uncoveredUnits:p.best.uncovered,incrementalCostINR:p.best.cost,exposureINR:p.best.atRiskValue,allocations:p.best.allocations}};
}),null,2));
