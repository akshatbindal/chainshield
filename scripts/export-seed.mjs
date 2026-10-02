import {writeFile} from 'node:fs/promises';
import {data as d} from '../data.mjs';
const date=day=>new Date(Date.parse(d.asOf+'T00:00:00Z')+day*86400000).toISOString().slice(0,10);
const v=x=>x===null?'NULL':typeof x==='boolean'?(x?'TRUE':'FALSE'):typeof x==='number'?String(x):"'"+x.replaceAll("'","''")+"'";
const tables=[
  ['SUPPLIERS',['SUPPLIER_ID','NAME','QUALIFIED'],d.suppliers.map(s=>[s.id,s.name,s.qualified])],
  ['PARTS',['PART_ID','NAME','BASE_UNIT_COST'],d.parts.map(s=>[s.id,s.name,s.unitCost])],
  ['PLANTS',['PLANT_ID','NAME'],d.plants.map(s=>[s.id,s.name])],
  ['CUSTOMERS',['CUSTOMER_ID','NAME'],d.customers.map(s=>[s.id,s.name])],
  ['ORDERS',['ORDER_ID','CUSTOMER_ID','PART_ID','PLANT_ID','QUANTITY','DUE_DATE','UNIT_VALUE'],d.orders.map(s=>[s.id,s.customerId,s.partId,s.plantId,s.quantity,date(s.dueDay),s.unitValue])],
  ['INVENTORY',['INVENTORY_ID','PLANT_ID','PART_ID','QUANTITY','RESERVED_QUANTITY'],d.inventory.map(s=>[s.id,s.plantId,s.partId,s.quantity,s.reserved])],
  ['SHIPMENTS',['SHIPMENT_ID','SUPPLIER_ID','PART_ID','PLANT_ID','QUANTITY','EXPECTED_ARRIVAL'],d.shipments.map(s=>[s.id,s.supplierId,s.partId,s.plantId,s.quantity,date(s.arrivalDay)])],
  ['RECOVERY_ROUTES',['ROUTE_ID','KIND','SUPPLIER_ID','FROM_PLANT_ID','TO_PLANT_ID','PART_ID','CAPACITY','ARRIVAL_DATE','INCREMENTAL_UNIT_COST','EVIDENCE_ID'],d.routes.map(s=>[s.id,s.kind,s.supplierId,s.fromPlantId,s.toPlantId,s.partId,s.capacity,date(s.arrivalDay),s.incrementalUnitCost,s.evidenceId])],
  ['DOCUMENTS',['DOCUMENT_ID','TITLE','BODY'],d.documents.map(s=>[s.id,s.title,s.text])]
];
let sql=`-- Generated from data.mjs. Synthetic fixture; as-of ${d.asOf}.\n-- Inserts missing IDs only; existing rows are preserved.\nUSE DATABASE CHAINSHIELD_DEMO;\nUSE SCHEMA CORE;\nUSE WAREHOUSE CHAINSHIELD_WH;\n\n`;
for(const [table,columns,rows]of tables)for(const row of rows)sql+=`INSERT INTO ${table} (${columns.join(', ')})\nSELECT ${row.map(v).join(', ')}\nWHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE ${columns[0]} = ${v(row[0])});\n\n`;
await writeFile(new URL('../snowflake/02_seed.sql',import.meta.url),sql);
console.log('Prepared snowflake/02_seed.sql from the same synthetic fixture as the local planner.');
