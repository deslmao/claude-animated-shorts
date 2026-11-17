"""Shift Consistency OS sample dates so they are relative to today again.

Run this the day you send the duplicate link to a new batch of testers.
It only touches the three dated databases (Tasks, Routine log, Reflections)
inside the page shared with the connection.

Usage: python3 refresh_dates.py            # shift so sample data matches today
       python3 refresh_dates.py --today 2026-11-20   # pretend today is that date
"""
import datetime as dt
import sys

from notion import call

AS_OF_MARKER = "Sample dates as of "


def find_sources():
    found = {}
    res = call("POST", "/search", {"filter": {"property": "object", "value": "data_source"}})["results"]
    for ds in res:
        name = "".join(t["plain_text"] for t in ds.get("title", []))
        found[name] = ds["id"]
    return found


def all_pages(ds):
    out, cursor = [], None
    while True:
        body = {"start_cursor": cursor} if cursor else {}
        r = call("POST", f"/data_sources/{ds}/query", body)
        out += r["results"]
        if not r["has_more"]:
            return out
        cursor = r["next_cursor"]


def shift(iso, days):
    return (dt.date.fromisoformat(iso[:10]) + dt.timedelta(days=days)).isoformat()


def main():
    today = dt.date.today()
    if "--today" in sys.argv:
        today = dt.date.fromisoformat(sys.argv[sys.argv.index("--today") + 1])
    src = find_sources()
    # The routine log's newest row is "today" in the sample data, so it tells us the current offset.
    routines = all_pages(src["Routine log"])
    newest = max(p["properties"]["Date"]["date"]["start"] for p in routines if p["properties"]["Date"]["date"])
    delta = (today - dt.date.fromisoformat(newest)).days
    if delta == 0:
        print("Sample dates already match", today); return
    print(f"Shifting sample dates by {delta} days")
    for p in all_pages(src["Tasks"]):
        d = p["properties"]["Due"]["date"]
        if d:
            call("PATCH", f"/pages/{p['id']}", {"properties": {"Due": {"date": {"start": shift(d['start'], delta)}}}})
    for p in routines:
        d = p["properties"]["Date"]["date"]
        if d:
            new = dt.date.fromisoformat(shift(d["start"], delta))
            call("PATCH", f"/pages/{p['id']}", {"properties": {
                "Date": {"date": {"start": new.isoformat()}},
                "Day": {"title": [{"type": "text", "text": {"content": new.strftime("%a %-d %b")}}]}}})
    # Reflections: newest row becomes last week, the next one the week before, and so on.
    refl = [p for p in all_pages(src["Reflections"]) if p["properties"]["Week starting"]["date"]]
    refl.sort(key=lambda p: p["properties"]["Week starting"]["date"]["start"], reverse=True)
    monday = today - dt.timedelta(days=today.weekday())
    for i, p in enumerate(refl):
        new = monday - dt.timedelta(weeks=i + 1)
        call("PATCH", f"/pages/{p['id']}", {"properties": {
            "Week starting": {"date": {"start": new.isoformat()}},
            "Week": {"title": [{"type": "text", "text": {"content": "Week of " + new.strftime("%-d %b")}}]}}})
    print("Done")


if __name__ == "__main__":
    main()
