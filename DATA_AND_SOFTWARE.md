# Data and software attribution

## Dataset

The entire business fixture is original synthetic data authored for ChainShield with Codex assistance. It includes suppliers, parts, plants, customers, orders, inventory, shipments, recovery routes and five document records. Source: `data.mjs` and `snowflake/02_seed.sql`. No external business dataset, scraped data, real customer data or Marketplace dataset is included. Names, prices, capacities and dates are illustrative. The scenario uses 2 October 2026 as its fixed reference date.

No third-party dataset license applies to this original fixture. Author rights remain with the project author. Permissions granted to organizers follow the contest terms the participant accepts at entry. This package does not independently assign an open-source license to the author's project.

## Software and services

| Component | Use | License/terms source |
| --- | --- | --- |
| Streamlit | Native Python UI | Apache-2.0, https://github.com/streamlit/streamlit |
| Snowpark Python | Snowflake table reads and SQL | Apache-2.0, https://github.com/snowflakedb/snowpark-python |
| Snowflake platform, semantic views, AI_COMPLETE | Storage, analytics and model inference | Snowflake account/service terms, https://www.snowflake.com/legal/ |
| Claude Sonnet 4.5 via Snowflake | Checked grounded explanation | Snowflake inference/model terms applicable to the account |
| Cortex Code / CoCo CLI | Installed development CLI. Authenticated usage pending | Official Snowflake distribution and service terms |
| Node.js | Dependency-free local preview and planner tests | Node.js distribution license, https://github.com/nodejs/node/blob/main/LICENSE |
| Python standard library | Planning and validation | Python distribution license, https://docs.python.org/3/license.html |
| Codex | Development and submission preparation assistance | OpenAI product/service terms |
| Organizer presentation template | Submission deck background and branding | Organizer-provided template used for this contest submission |

The source ZIP does not vendor these third-party libraries or the CoCo executable. Review applicable vendor terms and attribution before publishing. No independent license grant for project code is implied by the dependency licenses.
