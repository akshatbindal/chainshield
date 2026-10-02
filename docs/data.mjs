// Synthetic, fixed-date fixture. Every finished unit needs one P-101 component.
export const data = {
  asOf: '2026-10-02', currency: 'INR', part: 'P-101', plant: 'PL-PUNE',
  suppliers: [
    {id:'S-PRIMARY',name:'Western Precision',qualified:true},
    {id:'S-ALT',name:'Eastern Components',qualified:true}
  ],
  parts: [{id:'P-101',name:'Precision valve assembly',unitCost:220}],
  plants: [{id:'PL-PUNE',name:'Pune assembly plant'},{id:'PL-CHENNAI',name:'Chennai reserve depot'}],
  customers: [{id:'C-1',name:'Aster Motors'},{id:'C-2',name:'Meridian Auto'},{id:'C-3',name:'Kinetic Mobility'}],
  orders: [
    {id:'O-1001',customerId:'C-1',partId:'P-101',plantId:'PL-PUNE',quantity:50,dueDay:3,unitValue:4200},
    {id:'O-1002',customerId:'C-2',partId:'P-101',plantId:'PL-PUNE',quantity:60,dueDay:5,unitValue:3800},
    {id:'O-1003',customerId:'C-3',partId:'P-101',plantId:'PL-PUNE',quantity:40,dueDay:6,unitValue:4000}
  ],
  inventory: [
    {id:'INV-PUNE',plantId:'PL-PUNE',partId:'P-101',quantity:30,reserved:0},
    {id:'INV-CHENNAI',plantId:'PL-CHENNAI',partId:'P-101',quantity:90,reserved:30}
  ],
  shipments: [{id:'SH-001',supplierId:'S-PRIMARY',partId:'P-101',plantId:'PL-PUNE',quantity:150,arrivalDay:2}],
  routes: [
    {id:'ALT-01',kind:'alternate',supplierId:'S-ALT',fromPlantId:null,toPlantId:'PL-PUNE',partId:'P-101',capacity:80,arrivalDay:4,incrementalUnitCost:180,evidenceId:'DOC-ALT'},
    {id:'TR-01',kind:'transfer',supplierId:null,fromPlantId:'PL-CHENNAI',toPlantId:'PL-PUNE',partId:'P-101',capacity:60,arrivalDay:2,incrementalUnitCost:120,evidenceId:'DOC-DEPOT'},
    {id:'EXP-01',kind:'expedite',supplierId:'S-PRIMARY',fromPlantId:null,toPlantId:'PL-PUNE',partId:'P-101',capacity:150,arrivalDay:2,incrementalUnitCost:60,evidenceId:'DOC-EXP'}
  ],
  documents: [
    {id:'DOC-PRIMARY',title:'Primary supplier dispatch notice',text:'SH-001 has 150 units of P-101 for Pune. Baseline delivery is day 2. Delay is entered by the scenario operator; it is a simulated assumption.'},
    {id:'DOC-ALT',title:'Alternate supplier qualification and offer',text:'Eastern Components is qualified for P-101. Up to 80 additional units arrive on day 4. Incremental cost is INR 180 per unit including freight. The scenario can revoke qualification or reduce available capacity.'},
    {id:'DOC-DEPOT',title:'Chennai stock reservation policy',text:'Chennai holds 90 units; 30 are reserved for local obligations and cannot be transferred. The remaining 60 can reach Pune on day 2 at INR 120 per unit.'},
    {id:'DOC-EXP',title:'Expedited transport offer',text:'Expediting can recover up to four days of transport delay, with arrival no earlier than day 2. Incremental cost is INR 60 per unit. Regular and expedited transport share the same SH-001 shipment quantity; they are not separate stock.'},
    {id:'DOC-METRICS',title:'Planning assumptions and business definitions',text:'One finished unit consumes one P-101 component. Partial fulfilment is allowed. Objective: maximize on-time units, then minimize incremental recovery cost. At-risk value equals uncovered units times order unit value; it is exposure, not booked revenue loss. Production time is assumed included in route arrival days. This fixture excludes multi-part bills of materials, uncertain transit, and full-order-only constraints.'}
  ]
};
