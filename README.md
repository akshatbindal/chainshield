# ChainShield

Supply disruption planning prototype for Snowflake CoCo CLI Hackathon GCC Edition, Track 5.

## Run the portable preview

Requires Node.js 20 or newer. No npm dependencies or install step.

```sh
npm start
```

Open the URL printed by the server (default http://localhost:4173). This portable preview uses the bundled synthetic fixture. It does not connect to Snowflake.

```sh
npm test
node scripts/demo-scenarios.mjs
```

The tests cover deadline feasibility, reserves and shared supply pools, 1,200 scenario combinations, and 80 small cases compared with an independent exhaustive oracle.

## Native Snowflake app

`snowflake/streamlit_app.py` is the actual Python UI and planner. It uses a Snowpark session from `st.connection("snowflake").session()` in Streamlit in Snowflake. Create the isolated demo objects with `01_setup.sql` through `04_validate.sql`, then the audit table with `06_audit.sql`. Review the setup SQL before running because it provisions isolated objects and a compute warehouse.

Deploy the Python app using Streamlit in Snowflake with a suitable runtime and packages `streamlit` and `snowflake-snowpark-python`. Supply a role with access to the demo objects. The semantic views require compatible account capabilities. AI_COMPLETE also requires an available model and inference privileges. Compute and model calls consume Snowflake account credits.

The Python app queries `CHAINSHIELD_DEMO.CORE`. The demo dataset has nine source tables and two semantic views. The original private deployment was tested on 2 October 2026. Its account login and account-specific deployment paths are deliberately excluded from this distributable.

## Cross-language validation

Requires Python 3.11 or newer. No external Python packages are needed for this solver parity check.

```sh
node scripts/verify-python.mjs parity.json
python test/verify_python.py parity.json
```

This compares five strategies across 1,200 scenario inputs. Delete the generated scratch fixture when finished.

## Static browser deployment

```sh
node scripts/build-static.mjs docs
```

This creates a static synthetic preview in `docs/`. Publish that folder on a static host, for example GitHub Pages. It executes the same deterministic Node planner in the browser. It makes no Snowflake or AI calls and contains no authentication configuration. The native Snowflake app and AI inference are separate components, demonstrated in the recording and reproducible from the included Python and SQL source.

## Demonstration cases

- Seven-day delay: 150 on-time units, INR 8,400 incremental cost, zero remaining exposure.
- Twelve-day delay: 150 units, INR 18,000 incremental cost.
- Twelve-day delay, alternate capacity zero: 90 units, INR 7,200 cost, 60 uncovered, INR 236,000 exposure.

The planner maximizes on-time units first and minimizes incremental spend second. All data is synthetic. Exposure is uncovered order value, not realized loss. Scope is one part and one destination.

## Current status

Native Snowflake data reads, semantic aggregates, audit persistence and one grounded AI_COMPLETE example have been verified. Authenticated CoCo workflow evidence is pending. The current AI explanation is a completion, not Cortex Agent or Cortex Search. A broader AI evaluation and scaled data validation remain future work.

See DATA_AND_SOFTWARE.md for data and software attribution. Project code and dataset retain author rights. No new project-wide open-source license has been assigned. Third-party libraries are not bundled.
