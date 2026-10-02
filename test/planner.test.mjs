import test from 'node:test';
import assert from 'node:assert/strict';
import {plan,allocate,scenario,makeRoutes} from '../planner.mjs';
import {data} from '../data.mjs';

test('on schedule requires no recovery spend',()=>{const p=plan({delay:0});assert.equal(p.best.filled,150);assert.equal(p.best.cost,0);assert.equal(p.best.atRiskValue,0);});
test('seven-day delay needs only 20 transfer units and 100 expedited units',()=>{const p=plan();assert.equal(p.baseline.filled,30);assert.equal(p.best.filled,150);assert.equal(p.best.cost,8400);assert.equal(p.best.allocations.filter(a=>a.routeId==='TR-01').reduce((s,a)=>s+a.units,0),20);});
test('severe delay uses transfer and alternate supply',()=>{const p=plan({delay:12});assert.equal(p.best.filled,150);assert.equal(p.best.cost,18000);assert.ok(p.best.allocations.every(a=>a.routeId!=='EXP-01'));});
test('revoking alternate qualification leaves a real shortage',()=>{const p=plan({delay:12,alternateApproved:false});assert.equal(p.best.filled,90);assert.equal(p.best.uncovered,60);assert.ok(p.best.allocations.every(a=>a.routeId!=='ALT-01'));});
test('only on-hand stock remains when all recovery routes unavailable',()=>{const p=plan({delay:12,alternateCapacity:0,transferCapacity:0,expediteEnabled:false});assert.equal(p.best.filled,30);assert.equal(p.best.uncovered,120);assert.equal(p.best.cost,0);});
test('invalid scenario values never reach allocation',()=>{for(const input of [{delay:-1},{delay:15},{delay:'7'},{delay:2.5},{transferCapacity:61},{alternateCapacity:81},{alternateApproved:'false'},{expediteEnabled:0}])assert.throws(()=>scenario(input));});
test('shared shipment cannot be counted as both regular and express stock',()=>{const routes=[{id:'R',label:'regular',pool:'SHIP',poolCapacity:2,capacity:2,arrivalDay:1,cost:0,approved:true,evidence:[]},{id:'E',label:'express',pool:'SHIP',poolCapacity:2,capacity:2,arrivalDay:0,cost:1,approved:true,evidence:[]}];const p=allocate(routes,[{id:'A',quantity:2,dueDay:0,unitValue:10},{id:'B',quantity:2,dueDay:1,unitValue:10}]);assert.equal(p.filled,2);assert.equal(p.uncovered,2);});
test('residual paths reassign cheap stock to preserve urgent coverage',()=>{const routes=[{id:'FAST',label:'fast',pool:'F',poolCapacity:1,capacity:1,arrivalDay:0,cost:1,approved:true,evidence:[]},{id:'SLOW',label:'slow',pool:'S',poolCapacity:1,capacity:1,arrivalDay:2,cost:2,approved:true,evidence:[]}];const p=allocate(routes,[{id:'LATE',quantity:1,dueDay:2,unitValue:10},{id:'EARLY',quantity:1,dueDay:1,unitValue:10}]);assert.equal(p.filled,2);assert.equal(p.cost,3);assert.equal(p.allocations.find(a=>a.orderId==='EARLY').routeId,'FAST');});

test('constraints and accounting hold across 1200 scenario combinations',()=>{
  let count=0;
  for(let delay=0;delay<=14;delay++)for(const alternateCapacity of [0,1,20,50,80])for(const transferCapacity of [0,1,20,60])for(const alternateApproved of [true,false])for(const expediteEnabled of [true,false]){
    const p=plan({delay,alternateCapacity,transferCapacity,alternateApproved,expediteEnabled});
    for(const candidate of p.candidates){
      assert.equal(candidate.filled,candidate.allocations.reduce((s,a)=>s+a.units,0));
      assert.equal(candidate.cost,candidate.allocations.reduce((s,a)=>s+a.incrementalCost,0));
      const pools=new Map(),routeUsed=new Map();
      for(const a of candidate.allocations){const r=p.routes.find(r=>r.id===a.routeId),o=data.orders.find(o=>o.id===a.orderId);assert.ok(r.approved);assert.ok(a.arrivalDay<=o.dueDay);assert.ok(a.units>0&&Number.isInteger(a.units));pools.set(r.pool,(pools.get(r.pool)||0)+a.units);routeUsed.set(r.id,(routeUsed.get(r.id)||0)+a.units);}
      for(const r of p.routes){assert.ok((pools.get(r.pool)||0)<=r.poolCapacity);assert.ok((routeUsed.get(r.id)||0)<=r.capacity);}
      for(const o of candidate.orders){assert.ok(o.filled<=o.quantity);assert.equal(o.uncovered,o.quantity-o.filled);assert.equal(o.atRiskValue,o.uncovered*o.unitValue);}
    }
    assert.ok(p.best.filled>=p.baseline.filled);count++;
  }
  assert.equal(count,1200);
});

// Independent exhaustive oracle: every small unit is either unfilled or assigned
// to a route. This verifies optimality rather than reproducing flow code.
function brute(routes,orders){
  const units=orders.flatMap(o=>Array(o.quantity).fill(o)),used=new Map(),poolUsed=new Map();let best={filled:-1,cost:Infinity};
  function visit(i,filled,cost){
    if(i===units.length){if(filled>best.filled||(filled===best.filled&&cost<best.cost))best={filled,cost};return;}
    visit(i+1,filled,cost);
    for(const r of routes){
      if(!r.approved||r.arrivalDay>units[i].dueDay||(used.get(r.id)||0)>=r.capacity||(poolUsed.get(r.pool)||0)>=r.poolCapacity)continue;
      used.set(r.id,(used.get(r.id)||0)+1);poolUsed.set(r.pool,(poolUsed.get(r.pool)||0)+1);
      visit(i+1,filled+1,cost+r.cost);
      used.set(r.id,used.get(r.id)-1);poolUsed.set(r.pool,poolUsed.get(r.pool)-1);
    }
  }visit(0,0,0);return best;
}
test('minimum cost and maximum coverage match exhaustive oracle for 80 fixtures',()=>{
  let seed=2381;const rand=max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
  for(let i=0;i<80;i++){
    const poolCapacity=1+rand(3);
    const routes=Array.from({length:3},(_,j)=>({id:'R'+j,label:'route',pool:j<2?'SHARED':'OTHER',poolCapacity:j<2?poolCapacity:2,capacity:1+rand(2),arrivalDay:rand(4),cost:rand(6),approved:rand(4)!==0,evidence:[]}));
    const orders=Array.from({length:2},(_,j)=>({id:'O'+j,quantity:1+rand(2),dueDay:rand(4),unitValue:10}));
    const expected=brute(routes,orders),actual=allocate(routes,orders);assert.equal(actual.filled,expected.filled);assert.equal(actual.cost,expected.cost);
  }
});
