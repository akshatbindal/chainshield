-- Prepared from current Snowflake DDL docs. Live compilation is still required.
USE DATABASE CHAINSHIELD_DEMO;
USE SCHEMA CORE;

CREATE SEMANTIC VIEW IF NOT EXISTS ORDER_COMMITMENTS
  TABLES (
    orders AS CHAINSHIELD_DEMO.CORE.ORDERS PRIMARY KEY (ORDER_ID),
    customers AS CHAINSHIELD_DEMO.CORE.CUSTOMERS PRIMARY KEY (CUSTOMER_ID),
    parts AS CHAINSHIELD_DEMO.CORE.PARTS PRIMARY KEY (PART_ID),
    plants AS CHAINSHIELD_DEMO.CORE.PLANTS PRIMARY KEY (PLANT_ID)
  )
  RELATIONSHIPS (
    order_customer AS orders (CUSTOMER_ID) REFERENCES customers,
    order_part AS orders (PART_ID) REFERENCES parts,
    order_plant AS orders (PLANT_ID) REFERENCES plants
  )
  FACTS (
    orders.unit_quantity AS QUANTITY,
    orders.order_value AS QUANTITY * UNIT_VALUE
  )
  DIMENSIONS (
    orders.order_id AS ORDER_ID,
    orders.due_date AS DUE_DATE,
    customers.customer_name AS NAME,
    parts.part_id AS PART_ID,
    parts.part_name AS NAME,
    plants.plant_id AS PLANT_ID,
    plants.plant_name AS NAME
  )
  METRICS (
    orders.total_units AS SUM(orders.unit_quantity),
    orders.total_order_value AS SUM(orders.order_value),
    orders.order_count AS COUNT(orders.ORDER_ID)
  )
  COMMENT = 'Synthetic automotive order commitments. One component per finished unit; partial fulfilment allowed. Values are INR. Total order value is not realized revenue or scenario risk.';

CREATE SEMANTIC VIEW IF NOT EXISTS INBOUND_SUPPLY
  TABLES (
    shipments AS CHAINSHIELD_DEMO.CORE.SHIPMENTS PRIMARY KEY (SHIPMENT_ID),
    suppliers AS CHAINSHIELD_DEMO.CORE.SUPPLIERS PRIMARY KEY (SUPPLIER_ID),
    parts AS CHAINSHIELD_DEMO.CORE.PARTS PRIMARY KEY (PART_ID),
    plants AS CHAINSHIELD_DEMO.CORE.PLANTS PRIMARY KEY (PLANT_ID)
  )
  RELATIONSHIPS (
    shipment_supplier AS shipments (SUPPLIER_ID) REFERENCES suppliers,
    shipment_part AS shipments (PART_ID) REFERENCES parts,
    shipment_plant AS shipments (PLANT_ID) REFERENCES plants
  )
  FACTS (shipments.unit_quantity AS QUANTITY)
  DIMENSIONS (
    shipments.shipment_id AS SHIPMENT_ID,
    shipments.expected_arrival AS EXPECTED_ARRIVAL,
    suppliers.supplier_id AS SUPPLIER_ID,
    suppliers.supplier_name AS NAME,
    suppliers.qualified AS QUALIFIED,
    parts.part_id AS PART_ID,
    parts.part_name AS NAME,
    plants.plant_id AS PLANT_ID,
    plants.plant_name AS NAME
  )
  METRICS (shipments.inbound_units AS SUM(shipments.unit_quantity))
  COMMENT = 'Baseline inbound supply. Expediting is a route for the same shipment, never additional supply. Scenario delays do not mutate this baseline. Aggregate shipments and orders separately before matching part and plant; avoid fact-table fanout.';
