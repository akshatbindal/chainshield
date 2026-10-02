import { data } from './data.mjs';

export function scenario(input = {}) {
  const defaults = {delay:7,alternateCapacity:80,transferCapacity:60,alternateApproved:true,expediteEnabled:true};
  const s = {...defaults, ...input};
  for (const [key,max] of [['delay',14],['alternateCapacity',80],['transferCapacity',60]]) {
    if (!Number.isInteger(s[key]) || s[key]<0 || s[key]>max) throw new Error(`${key} must be an integer between 0 and ${max}`);
  }
  for (const key of ['alternateApproved','expediteEnabled']) if(typeof s[key] !== 'boolean') throw new Error(`${key} must be boolean`);
  return Object.fromEntries(Object.keys(defaults).map(k=>[k,s[k]]));
}

export function makeRoutes(s, fixture = data) {
  const inv = fixture.inventory.find(x=>x.plantId===fixture.plant && x.partId===fixture.part);
  const donor = fixture.inventory.find(x=>x.plantId==='PL-CHENNAI' && x.partId===fixture.part);
  const ship = fixture.shipments[0];
  const alt = fixture.routes.find(x=>x.kind==='alternate');
  const transfer = fixture.routes.find(x=>x.kind==='transfer');
  const express = fixture.routes.find(x=>x.kind==='expedite');
  return [
    {id:'STOCK',label:'Pune inventory',kind:'baseline',pool:inv.id,poolCapacity:inv.quantity-inv.reserved,capacity:inv.quantity-inv.reserved,arrivalDay:0,cost:0,evidence:[inv.id,'DOC-METRICS'],approved:true},
    {id:'REGULAR',label:'Regular shipment',kind:'baseline',pool:ship.id,poolCapacity:ship.quantity,capacity:ship.quantity,arrivalDay:ship.arrivalDay+s.delay,cost:0,evidence:[ship.id,'DOC-PRIMARY'],approved:true},
    {id:express.id,label:'Expedited shipment',kind:'expedite',pool:ship.id,poolCapacity:ship.quantity,capacity:s.expediteEnabled?express.capacity:0,arrivalDay:Math.max(ship.arrivalDay,ship.arrivalDay+s.delay-4),cost:express.incrementalUnitCost,evidence:[ship.id,express.evidenceId],approved:true},
    {id:transfer.id,label:'Chennai transfer',kind:'transfer',pool:donor.id,poolCapacity:donor.quantity-donor.reserved,capacity:s.transferCapacity,arrivalDay:transfer.arrivalDay,cost:transfer.incrementalUnitCost,evidence:[donor.id,transfer.evidenceId],approved:true},
    {id:alt.id,label:'Alternate supplier',kind:'alternate',pool:alt.id,poolCapacity:s.alternateCapacity,capacity:s.alternateCapacity,arrivalDay:alt.arrivalDay,cost:alt.incrementalUnitCost,evidence:[alt.id,alt.evidenceId],approved:s.alternateApproved && fixture.suppliers.find(x=>x.id===alt.supplierId).qualified}
  ];
}

// Integral minimum-cost maximum flow. Reverse edges allow reallocation when an
// initially cheap allocation would otherwise prevent a later deadline being met.
export function allocate(routes, orders) {
  const graph=[];
  const node=()=>{graph.push([]);return graph.length-1;};
  const source=node(),sink=node();
  const add=(u,v,cap,cost,meta)=>{
    const f={to:v,rev:graph[v].length,cap,cost,initial:cap,meta};
    const b={to:u,rev:graph[u].length,cap:0,cost:-cost,initial:0};
    graph[u].push(f);graph[v].push(b);return f;
  };
  const pools=new Map(),orderNodes=new Map(),allocationEdges=[];
  for(const order of orders){const n=node();orderNodes.set(order.id,n);add(n,sink,order.quantity,0);}
  for(const route of routes){
    if(!route.approved || route.capacity<=0) continue;
    if(!pools.has(route.pool)){const n=node();pools.set(route.pool,n);add(source,n,route.poolCapacity,0);}
    const rn=node();add(pools.get(route.pool),rn,route.capacity,route.cost);
    for(const order of orders){
      if(route.arrivalDay>order.dueDay)continue;
      const edge=add(rn,orderNodes.get(order.id),order.quantity,0,{route,order});
      allocationEdges.push(edge);
    }
  }
  let flow=0,cost=0;
  while(true){
    const dist=Array(graph.length).fill(Infinity),prev=Array(graph.length).fill(null);
    dist[source]=0;
    for(let pass=0;pass<graph.length-1;pass++){
      let changed=false;
      for(let u=0;u<graph.length;u++){
        if(!Number.isFinite(dist[u]))continue;
        for(let i=0;i<graph[u].length;i++){
          const e=graph[u][i];
          if(e.cap>0 && dist[u]+e.cost<dist[e.to]){dist[e.to]=dist[u]+e.cost;prev[e.to]=[u,i];changed=true;}
        }
      }
      if(!changed)break;
    }
    if(!prev[sink])break;
    let units=Infinity;
    for(let v=sink;v!==source;){const [u,i]=prev[v];units=Math.min(units,graph[u][i].cap);v=u;}
    for(let v=sink;v!==source;){const [u,i]=prev[v];const e=graph[u][i];e.cap-=units;graph[v][e.rev].cap+=units;v=u;}
    flow+=units;cost+=units*dist[sink];
  }
  const allocations=allocationEdges.filter(e=>e.initial>e.cap).map(e=>({orderId:e.meta.order.id,routeId:e.meta.route.id,route:e.meta.route.label,units:e.initial-e.cap,arrivalDay:e.meta.route.arrivalDay,incrementalCost:(e.initial-e.cap)*e.meta.route.cost,evidence:e.meta.route.evidence}));
  const orderResults=orders.map(o=>{
    const filled=allocations.filter(a=>a.orderId===o.id).reduce((sum,a)=>sum+a.units,0);
    return {...o,filled,uncovered:o.quantity-filled,atRiskValue:(o.quantity-filled)*o.unitValue};
  });
  return {filled:flow,cost,allocations,orders:orderResults,uncovered:orderResults.reduce((s,o)=>s+o.uncovered,0),atRiskValue:orderResults.reduce((s,o)=>s+o.atRiskValue,0),fullyFeasible:orderResults.every(o=>o.uncovered===0)};
}

export function plan(input = {}) {
  const s=scenario(input),routes=makeRoutes(s);
  const sets=[['Baseline',[]],['Expedite',['expedite']],['Transfer',['transfer']],['Alternate',['alternate']],['Combined',['expedite','transfer','alternate']]];
  const candidates=sets.map(([name,kinds])=>({name,...allocate(routes.filter(r=>r.kind==='baseline'||kinds.includes(r.kind)),data.orders)}));
  const best=candidates.reduce((a,b)=>b.filled>a.filled||(b.filled===a.filled&&b.cost<a.cost)?b:a);
  const rejected=data.orders.flatMap(o=>routes.flatMap(r=>{
    const reasons=[];
    if(!r.approved)reasons.push('Supplier qualification revoked');
    if(r.capacity===0)reasons.push('Route disabled or available capacity is zero');
    if(r.arrivalDay>o.dueDay)reasons.push(`Arrives day ${r.arrivalDay}; deadline is day ${o.dueDay}`);
    return reasons.length?[{orderId:o.id,routeId:r.id,route:r.label,reasons,evidence:r.evidence}]:[];
  }));
  const baseline=candidates[0];
  return {mode:'local-synthetic',asOf:data.asOf,currency:data.currency,scenario:s,demand:data.orders.reduce((n,o)=>n+o.quantity,0),routes,candidates,best,baseline,rejected,delta:{additionalUnits:best.filled-baseline.filled,reducedExposure:baseline.atRiskValue-best.atRiskValue},explanation:explain(best,baseline)};
}

function explain(best,baseline){
  const money=n=>`INR ${n.toLocaleString('en-IN')}`;
  const clauses=[`${best.name} covers ${best.filled} of ${data.orders.reduce((n,o)=>n+o.quantity,0)} units by their deadlines for ${money(best.cost)} in incremental recovery spend.`];
  for(const a of best.allocations)clauses.push(`${a.orderId}: ${a.units} units via ${a.route}, arriving day ${a.arrivalDay}; ${money(a.incrementalCost)}. Evidence: ${a.evidence.join(', ')}.`);
  if(best.uncovered)clauses.push(`${best.uncovered} units remain uncovered. No combination of enabled, qualified routes can deliver more units within the modeled deadlines and shared capacity limits.`);
  clauses.push(`Compared with baseline, ${best.filled-baseline.filled} additional units are covered. Remaining at-risk order value is ${money(best.atRiskValue)}; this is exposure, not realized loss.`);
  return clauses.join('\n');
}
