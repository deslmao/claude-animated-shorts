# Consistency OS (Notion prototype)

These scripts built the Consistency OS customer-validation prototype inside a single Notion page.
They call the Notion REST API (`Notion-Version: 2026-03-11`) through an internal connection that
can only see that page. The token is never stored here: in the cloud session it is added by the
network proxy, and the scripts send the placeholder `Bearer proxy-injected`.

| File | What it does |
| --- | --- |
| `build.py` | Builds the pages, the 4 databases, the sample data and all views (`python3 build.py pages databases data views`) |
| `guide.py` | Writes the Start Here guide |
| `verify.py` | Queries every view and prints its rows, to check filters against the sample data |
| `refresh_dates.py` | Shifts sample dates so they're relative to today again. Run it the day you send the duplicate link to testers. |
| `notion.py`, `blocks.py` | Small HTTP and block helpers |

To run the scripts outside the cloud session, put a real token in the `Authorization` header in `notion.py`
and keep it out of git.
