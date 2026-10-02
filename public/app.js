const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'₹'+n.toLocaleString('en-IN');
let fixture,lastResult;
const presets={healthy:{delay:0,alternate:80,transfer:60,approved:true,expedite:true},disruption:{delay:7,alternate:80,transfer:60,approved:true,expedite:true},severe:{delay:12,alternate:80,transfer:60,approved:true,expedite:true},shortage:{delay:12,alternate:0,transfer:60,approved:true,expedite:true}};
function labels(){for(const [id,suffix]of[['delay','days'],['alternate','units'],['transfer','units']])$(id+'-value').textContent=`${$(id).value} ${suffix}`;}
for(const id of ['delay','alternate','transfer'])$(id).addEventListener('input',labels);
$('scenario-form').addEventListener('submit',e=>{e.preventDefault();run();});
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{for(const [key,value]of Object.entries(presets[b.dataset.preset])){if(typeof value==='boolean')$(key).checked=value;else $(key).value=value;}labels();run();}));
async function run(){
  $('run').disabled=true;$('status').classList.remove('error');$('status').textContent='Checking deadlines, qualifications and shared capacity…';
  try{
    const response=await fetch('/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({delay:Number($('delay').value),alternateCapacity:Number($('alternate').value),transferCapacity:Number($('transfer').value),alternateApproved:$('approved').checked,expediteEnabled:$('expedite').checked})});
    const p=await response.json();if(!response.ok)throw new Error(p.error);
    lastResult=p;render(p);$('status').textContent=p.best.fullyFeasible?'Recovery verified · all modeled units can arrive on time':`Partial recovery · ${p.best.uncovered} units cannot be covered within these constraints`;
  }catch(e){$('status').textContent=e.message;$('status').classList.add('error');}finally{$('run').disabled=false;}
}
function render(p){
  const best=p.best;
  $('metrics').innerHTML=[['On-time coverage',`${best.filled} / ${p.demand}`,`Baseline: ${p.baseline.filled} units · +${p.delta.additionalUnits} recovered`,best.uncovered>0],['Incremental recovery spend',money(best.cost),'Lowest spend for maximum on-time units',false],['Remaining value at risk',money(best.atRiskValue),'Exposure on uncovered units; not realized loss',best.uncovered>0]].map(([label,value,sub,warn])=>`<div class="metric ${warn?'warn':''}"><div class="metric-label">${label}</div><strong>${value}</strong><small>${sub}</small></div>`).join('');
  $('network').innerHTML=`<div class="chain">${[['SUPPLIER','Western Precision',`+${p.scenario.delay} days`,p.scenario.delay>0],['SHIPMENT','SH-001 · 150 units',`Regular arrival: day ${2+p.scenario.delay}`,p.scenario.delay>0],['PART','Precision valve','P-101 · one per finished unit',false],['PLANT','Pune assembly','30 on hand · 60 transferable',false],['CUSTOMERS','3 linked orders','Deadlines: days 3, 5 and 6',best.uncovered>0]].map(([type,name,sub,warn])=>`<div class="node ${warn?'disrupted':''}"><small>${type}</small><strong>${esc(name)}</strong><span>${esc(sub)}</span></div>`).join('')}</div><p class="network-caption">Normal and expedited routes draw from the same 150-unit shipment. Chennai reserves remain protected. Alternate supply must be qualified.</p>`;
  $('strategies').innerHTML=p.candidates.map(c=>`<tr class="${c.name===best.name?'selected':''}"><td>${esc(c.name)}${c.name===best.name?'<span class="star">RECOMMENDED</span>':''}</td><td>${c.filled} / ${p.demand}</td><td>${money(c.cost)}</td><td>${money(c.atRiskValue)}</td><td><span class="coverage ${c.fullyFeasible?'':'partial'}">${c.fullyFeasible?'Full':'Partial'}</span></td></tr>`).join('');
  $('plan-title').textContent=best.name+' recovery allocation';
  $('orders').innerHTML=best.orders.map(o=>`<article class="order"><small>${esc(o.id)} · DEADLINE DAY ${o.dueDay}</small><h3>${esc(fixture.customers.find(c=>c.id===o.customerId).name)}</h3><div class="fill ${o.uncovered?'uncovered':''}">${o.filled} / ${o.quantity} units</div><p>${o.uncovered?`${o.uncovered} uncovered · ${money(o.atRiskValue)} at risk`:'Entire modeled quantity covered on time'}</p>${best.allocations.filter(a=>a.orderId===o.id).map(a=>`<div class="allocation"><span>${a.units} units</span> · ${esc(a.route)}<br>Day ${a.arrivalDay} · ${money(a.incrementalCost)}<small>${a.evidence.map(esc).join(' · ')}</small></div>`).join('')}</article>`).join('');
  $('explanation').textContent=p.explanation;
  $('rejected').innerHTML=p.rejected.length?p.rejected.map(r=>`<div class="rejection"><strong>${esc(r.orderId)} / ${esc(r.route)}</strong><br>${r.reasons.map(esc).join('; ')}<br>Evidence: ${r.evidence.map(esc).join(', ')}</div>`).join(''):'<p>All routes satisfy qualification and timing checks. Shared capacity is still enforced by the allocator.</p>';
  $('documents').innerHTML=fixture.documents.map(d=>`<div class="document"><code>${esc(d.id)}</code> · <strong>${esc(d.title)}</strong><p>${esc(d.text)}</p></div>`).join('');
}
$('export').addEventListener('click',()=>{if(!lastResult)return;const blob=new Blob([JSON.stringify({...lastResult,sourceRecords:fixture},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='chainshield-scenario-evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
try{const r=await fetch('/api/data');if(!r.ok)throw new Error('Could not load synthetic data');fixture=await r.json();await run();}catch(e){$('status').textContent=e.message;$('status').classList.add('error');}
