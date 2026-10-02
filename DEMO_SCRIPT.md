# ChainShield: 4-minute recording plan

This is a recording script, not evidence that CoCo has executed these tasks. Authenticate CoCo first, perform a rehearsal and record actual results. The portal requires 3-5 minutes, a full CoCo CLI workflow and 2-3 modular skills/capabilities. Reserve up to one extra minute for processing. Do not fake terminal output or hide a material failure.

## Before recording

Open the ChainShield project, CoCo terminal and native Snowflake Streamlit app. Ensure no passwords, tokens or login dialogs appear. `connect-snowflake.cmd` in the development project starts the installed CLI with the supplied account settings. Its first run may need user onboarding. The distributable source ZIP does not contain that personal launcher.

Use the Snowflake model that was verified: `claude-sonnet-4-5`. Set the app to Seven-day delay. Keep the default capacities. A new AI request consumes account credits. The CLI session starts with SQL read-only enabled, so this recording plan requests read-only SQL and local command execution.

## 0:00-0:20 - Problem and scenario

Say: "A supplier shipment is seven days late. Which customer commitments can we still meet, and what is the least additional cost? ChainShield links the source records and calculates a feasible recovery plan. This demonstration uses synthetic automotive data."

Show the app's scenario inputs, three orders and dependency path. Keep the deterministic values visible.

## 0:20-1:05 - Capability 1: source validation through CoCo

Paste this into authenticated CoCo:

> Work in the ChainShield project. Read snowflake/04_validate.sql, snowflake/03_semantic_views.sql and data.mjs. Using read-only queries in CHAINSHIELD_DEMO.CORE, validate the order and inbound metrics from ORDER_COMMITMENTS and INBOUND_SUPPLY. Confirm 150 order units, INR 598000 order value and 150 inbound units. Distinguish order value from disruption exposure. Show source object names and query IDs if the tool supplies them. Do not modify objects or print credentials. If SQL access is unavailable, report that failure plainly.

Show the actual query execution and returned metrics. This is the input and source-validation stage. If the account cannot run these queries through CoCo, fix access before recording a submission-ready video.

## 1:05-2:10 - Capability 2: recovery planning through CoCo

Paste:

> Read scripts/demo-scenarios.mjs and planner.mjs. Execute node scripts/demo-scenarios.mjs and npm test. Explain the seven-day delay recommendation from the actual output: stock, transfer and expedite quantities, total covered units and incremental cost. Then compare the twelve-day delay with zero alternate capacity. State the uncovered units. Do not invent output or call the tests Snowflake query tests. Preserve reserved stock and shared shipment capacity.

Show actual processing and output. Expected first case: stock 30, transfer 20, expedite 100, total 150, cost INR 8400. Expected last case: total 90, uncovered 60, cost INR 7200, exposure INR 236000. In the native app, switch to No alternate capacity and show the corresponding shortage. Restore Seven-day delay afterwards.

## 2:10-3:15 - Capability 3: evidence and explanation

Paste:

> Inspect the actual allocation output, data.mjs documents and snowflake/streamlit_app.py audit/explanation code. Cite the source document IDs and order IDs supporting the seven-day recovery plan. Explain why the expedite-only strategy covers 130 units including inventory, while the combined strategy covers 150. Verify arithmetic rather than calculating new quantities in prose. List any unsupported conclusion. Do not claim Cortex Search or Cortex Agent exists.

Show the actual answer and source references. In the app, open Evidence and audit, then Ask about this plan. Show a successful AI_COMPLETE explanation and compare its numbers with the deterministic table. Explain that this is a grounded completion over computed results and evidence records.

## 3:15-4:00 - Audit, impact and scope

Show a saved scenario and source snapshot in the app. If saving a new scenario, that is a real Snowflake audit write. Read its result through the prepared validation SQL or use the previously verified saved record without claiming a fresh save.

Say: "In this modeled scenario, on-time coverage rises from 20 percent to 100 percent for INR 8400 additional cost. If recovery capacity is unavailable, ChainShield exposes the shortage. It does not invent a feasible plan. Current scope is one part, one destination and three orders. Larger datasets and broader AI evaluations are next."

Finish with the judge-accessible source repository URL. Keep the final video within 3-5 minutes. Test the uploaded video link signed out, then add it to the form.

## Evidence retained after the run

Keep the non-secret CoCo prompts and observed outputs, query IDs when available, test output, app evidence and final recording. Update the deck's pending CoCo disclosures only after these tasks actually complete. If a capability fails, fix it and record a new valid run or disclose the limitation.
