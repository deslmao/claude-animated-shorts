"""Build Consistency OS inside the dedicated Notion page.

Usage: python3 build.py <stage> [...]
Stages run in order: pages, databases, data, views. IDs are kept in state.json.
"""
import datetime as dt
import json
import os
import sys

from blocks import (bullet, callout, divider, gray, h2, h3, num, para, quote, rt,
                    todo, toggle)
from notion import call

ROOT = "41bd0353-84a8-804b-a10b-cee9b9b035ba"
STATE_FILE = os.path.join(os.path.dirname(__file__), "state.json")
TODAY = dt.date.fromisoformat(os.environ.get("BUILD_DATE", dt.date.today().isoformat()))

state = json.load(open(STATE_FILE)) if os.path.exists(STATE_FILE) else {}


def save():
    json.dump(state, open(STATE_FILE, "w"), indent=2)


def icon(name):
    return {"type": "icon", "icon": {"name": name, "color": "gray"}}


def append(page, children):
    out = []
    for i in range(0, len(children), 100):
        out += call("PATCH", f"/blocks/{page}/children", {"children": children[i:i + 100]})["results"]
    return out


def day(offset):
    return (TODAY + dt.timedelta(days=offset)).isoformat()


# Routine items (editable by the user: they are just checkbox columns).
MORNING = ["☀️ Get ready for the day", "☀️ Check today's schedule",
           "☀️ Choose my Top 3", "☀️ Start my first priority"]
EVENING = ["🌙 Reset my space", "🌙 Prepare for tomorrow",
           "🌙 Choose tomorrow's first task", "🌙 Review today's progress"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


# ---------------------------------------------------------------- pages
def stage_pages():
    if "pages" in state:
        print("pages exist, skipping"); return
    call("PATCH", f"/pages/{ROOT}", {"icon": icon("home")})
    append(ROOT, [
        quote([rt("Your day, organised. Without the overwhelm.", bold=True)]),
        para(["Open ", rt("Today", bold=True), " every morning. Do a ",
              rt("Weekly Reset", bold=True), " once a week. Everything else is here when you need it."]),
        gray("New here? Open Start Here first. It takes five minutes."),
        divider(),
    ])
    pages = {}
    for key, title, ic in [("today", "Today", "sun"), ("week", "My Week", "calendar"),
                           ("tasks", "Task Manager", "checklist"), ("routines", "Routines", "leaf"),
                           ("reset", "Weekly Reset", "refresh"), ("start", "Start Here", "book-open")]:
        p = call("POST", "/pages", {"parent": {"type": "page_id", "page_id": ROOT}, "icon": icon(ic),
                                    "properties": {"title": {"title": [rt(title)]}}})
        pages[key] = p["id"]
    state["pages"] = pages
    save()
    print("pages:", pages)


# ---------------------------------------------------------------- databases
def create_db(page, title, ic, props):
    db = call("POST", "/databases", {
        "parent": {"type": "page_id", "page_id": page}, "is_inline": True,
        "title": [rt(title)], "icon": icon(ic),
        "initial_data_source": {"properties": props}})
    return {"db": db["id"], "ds": db["data_sources"][0]["id"]}


def sel(*opts):
    return {"select": {"options": [{"name": n, "color": c} for n, c in opts]}}


def stage_databases():
    P = state["pages"]
    dbs = state.setdefault("dbs", {})

    # Task Manager -------------------------------------------------------
    if "tasks" not in dbs:
        append(P["tasks"], [
            callout(["Every task lives here. Add one with ", rt("+ New", bold=True),
                     ", give it a due date and a priority, and it appears on Today when it's due."],
                    icon="checklist"),
            para([rt("Urgent", bold=True), " = has to happen soon.  ", rt("Important", bold=True),
                  " = matters, some flexibility.  ", rt("Optional", bold=True), " = only if there's time."],
                 color="gray"),
        ])
        dbs["tasks"] = create_db(P["tasks"], "Tasks", "checklist", {
            "Task": {"title": {}},
            "Status": {"status": {"options": [
                {"name": "To do", "color": "gray", "group": "To-do"},
                {"name": "Doing", "color": "blue", "group": "In progress"},
                {"name": "Done", "color": "green", "group": "Complete"}]}},
            "Due": {"date": {}},
            "Priority": sel(("Urgent", "red"), ("Important", "yellow"), ("Optional", "gray")),
            "Category": sel(("School", "blue"), ("Work", "brown"), ("Personal", "purple"), ("Health", "green")),
            "Top 3": {"checkbox": {}},
            "Updated": {"last_edited_time": {}},
        })
        save()

    # My Week: timetable ---------------------------------------------------
    if "commitments" not in dbs:
        append(P["week"], [
            callout("Your week at a glance. The timetable repeats every week, so set it up once and only change "
                    "what changes.", icon="calendar"),
            h2("Weekly timetable"),
            gray("Classes, shifts and regular plans. Today's items show up on the Today page automatically."),
        ])
        progress_today = 'prop("Day") == formatDate(now(), "dddd")'
        dbs["commitments"] = create_db(P["week"], "Timetable", "calendar", {
            "Commitment": {"title": {}},
            "Day": sel(*[(d, "default") for d in DAYS]),
            "Time": {"rich_text": {}},
            "Type": sel(("Class", "blue"), ("Work", "brown"), ("Personal", "purple")),
            "Where": {"rich_text": {}},
            "Is today": {"formula": {"expression": progress_today}},
        })
        save()
        append(P["week"], [
            h2("This week's goals"),
            gray("Two or three things you'd like to move forward this week. Rewrite them in your Weekly Reset."),
            todo("Finish the history essay draft"),
            todo("Go to the gym twice"),
            todo("Apply for the library job"),
            h2("Upcoming deadlines"),
            gray("Urgent and important tasks due in the next month. Add or change them in Task Manager."),
        ])

    # Routines -----------------------------------------------------------
    if "routines" not in dbs:
        append(P["routines"], [
            callout(["Tick what you did. Missed a day? That's fine. There are no streaks here, "
                     "just start again whenever you're ready."], icon="leaf"),
            toggle("How to change your routine", [
                num("In the table below, click a column name, for example \"☀️ Choose my Top 3\"."),
                num("Rename it to your own habit. Keep ☀️ for morning and 🌙 for evening if you like."),
                num("To add one: click + at the end of the table and choose Checkbox. "
                    "To remove one: click its name, then Delete property."),
                para("The Progress column counts the original eight. Edit its formula if you add new ones, "
                     "or simply ignore it.", color="gray"),
            ]),
            h2("This week"),
        ])
        mx = " + ".join(f'if(prop("{m}"), 1, 0)' for m in MORNING)
        ex = " + ".join(f'if(prop("{e}"), 1, 0)' for e in EVENING)
        props = {"Day": {"title": {}}, "Date": {"date": {}}}
        for item in MORNING + EVENING:
            props[item] = {"checkbox": {}}
        props["Progress"] = {"formula": {"expression":
                             f'"☀️ " + format({mx}) + "/4   🌙 " + format({ex}) + "/4"'}}
        dbs["routines"] = create_db(P["routines"], "Routine log", "leaf", props)
        save()

    # Weekly Reset -------------------------------------------------------
    if "resets" not in dbs:
        append(P["reset"], [
            callout("Once a week, about 15 minutes. Sunday evening works well. Go through the four steps "
                    "from top to bottom.", icon="refresh"),
            h2("1 · Look at what you finished"),
            gray("Everything you completed in the last 7 days."),
        ])
        state["reset_anchor_1"] = True
        save()
        # remaining reset content is added in stage_views so the linked views sit in the right order
        dbs["resets"] = None
        save()


# ---------------------------------------------------------------- sample data
def page_in(ds, props):
    return call("POST", "/pages", {"parent": {"type": "data_source_id", "data_source_id": ds},
                                   "properties": props})["id"]


def title(t):
    return {"title": [rt(t)]}


def text(t):
    return {"rich_text": [rt(t)]}


def stage_data():
    if state.get("data_done"):
        print("data exists, skipping"); return
    ds = state["dbs"]["tasks"]["ds"]
    tasks = [
        # name, due offset, priority, category, status, top3
        ("Finish history essay introduction", 0, "Urgent", "School", "Doing", True),
        ("Revise chapter 4 for biology quiz", 1, "Important", "School", "To do", True),
        ("Email manager about Saturday shift", 0, "Urgent", "Work", "To do", True),
        ("Submit maths problem set 6", -1, "Urgent", "School", "To do", False),
        ("Book dentist appointment", 0, "Important", "Personal", "To do", False),
        ("30-minute walk", 0, "Optional", "Health", "To do", False),
        ("Tidy desk and clear downloads folder", None, "Optional", "Personal", "To do", False),
        ("Read 20 pages of my book", None, "Optional", "Personal", "To do", False),
        ("Group project: share slides draft", 3, "Important", "School", "To do", False),
        ("Gym: lower body session", 2, "Optional", "Health", "To do", False),
        ("Pay phone bill", 4, "Important", "Personal", "To do", False),
        ("History essay final draft", 8, "Urgent", "School", "To do", False),
        ("Apply for part-time library job", 10, "Important", "Work", "To do", False),
        ("Biology lab write-up", -1, "Urgent", "School", "Done", False),
        ("Print lab report", -2, "Important", "School", "Done", False),
        ("Buy groceries for the week", -2, "Optional", "Personal", "Done", False),
        ("Update CV", -4, "Important", "Work", "Done", False),
    ]
    for name, off, pri, cat, status, top in tasks:
        props = {"Task": title(name), "Priority": {"select": {"name": pri}},
                 "Category": {"select": {"name": cat}}, "Status": {"status": {"name": status}},
                 "Top 3": {"checkbox": top}}
        if off is not None:
            props["Due"] = {"date": {"start": day(off)}}
        page_in(ds, props)

    ds = state["dbs"]["commitments"]["ds"]
    commitments = [
        ("Maths lecture", "Monday", "09:00–10:30", "Class", "Room B12"),
        ("History seminar", "Monday", "11:00–12:00", "Class", "Humanities 2.04"),
        ("Football training", "Monday", "18:00–19:30", "Personal", "Sports centre"),
        ("Biology lab", "Tuesday", "10:00–12:00", "Class", "Science Lab 3"),
        ("Study group", "Tuesday", "14:00–15:00", "Personal", "Library, floor 2"),
        ("Maths lecture", "Wednesday", "09:00–10:30", "Class", "Room B12"),
        ("Café shift", "Wednesday", "13:00–17:00", "Work", "Bean & Leaf"),
        ("History lecture", "Thursday", "10:00–11:00", "Class", "Main hall"),
        ("Tutor meeting", "Thursday", "15:00–15:30", "Class", "Office 1.12"),
        ("Biology lecture", "Friday", "09:00–11:00", "Class", "Science Lab 1"),
        ("Café shift", "Friday", "16:00–20:00", "Work", "Bean & Leaf"),
        ("Café shift", "Saturday", "10:00–15:00", "Work", "Bean & Leaf"),
        ("Weekly Reset", "Sunday", "18:00–18:15", "Personal", "Home"),
    ]
    for name, d, t, typ, where in commitments:
        page_in(ds, {"Commitment": title(name), "Day": {"select": {"name": d}}, "Time": text(t),
                     "Type": {"select": {"name": typ}}, "Where": text(where)})

    ds = state["dbs"]["routines"]["ds"]
    # offset -> which items were done (indexes into MORNING+EVENING); a skipped day is left out on purpose
    log = {-6: [0, 1, 2, 3, 4, 5, 6, 7], -5: [0, 1, 2, 4, 5], -4: [0, 2, 3, 5, 6, 7],
           -2: [0, 1, 4], -1: [0, 1, 2, 3, 4, 5, 6], 0: [0, 1]}
    items = MORNING + EVENING
    for off, done in log.items():
        d = TODAY + dt.timedelta(days=off)
        props = {"Day": title(d.strftime("%a %-d %b")), "Date": {"date": {"start": d.isoformat()}}}
        for i, it in enumerate(items):
            props[it] = {"checkbox": i in done}
        page_in(ds, props)
    state["data_done"] = True
    save()
    print("sample data created")


# ---------------------------------------------------------------- views
TASK_PROPS = ["Status", "Task", "Due", "Priority", "Category", "Top 3", "Updated"]
COMMIT_PROPS = ["Commitment", "Day", "Time", "Type", "Where", "Is today"]
ROUTINE_PROPS = ["Day", "Date"] + MORNING + EVENING + ["Progress"]
NOT_DONE = {"property": "Status", "status": {"does_not_equal": "Done"}}


def pcfg(all_props, visible, widths=None, rel_date=False):
    widths = widths or {}
    out = []
    for p in visible:
        e = {"property_id": p, "visible": True}
        if p == "Status":
            e["status_show_as"] = "checkbox"
        if p in widths:
            e["width"] = widths[p]
        if rel_date and p in ("Due", "Date"):
            e["date_format"] = "relative"
        out.append(e)
    out += [{"property_id": p, "visible": False} for p in all_props if p not in visible]
    return out


def table(all_props, visible, widths=None, group=None, rel_date=True):
    c = {"type": "table", "properties": pcfg(all_props, visible, widths, rel_date), "wrap_cells": True}
    if group:
        c["group_by"] = group
    return c


def first_view(db):
    return call("GET", f"/views?database_id={db}")["results"][0]["id"]


def linked(page, key, name, vtype, filt=None, sorts=None, conf=None):
    body = {"create_database": {"parent": {"type": "page_id", "page_id": page}, "show_data_source_title": False},
            "data_source_id": state["dbs"][key]["ds"], "name": name, "type": vtype}
    if filt: body["filter"] = filt
    if sorts: body["sorts"] = sorts
    if conf: body["configuration"] = conf
    v = call("POST", "/views", body)
    return v


_PID = {}


def pid(key, name):
    if key not in _PID:
        props = call("GET", f"/data_sources/{state['dbs'][key]['ds']}")["properties"]
        _PID[key] = {n: p["id"] for n, p in props.items()}
    return _PID[key][name]


def group_select(prop, hide_empty=False, key=None):
    key = key or ("tasks" if prop == "Category" else "commitments")
    return {"type": "select", "property_id": pid(key, prop), "sort": {"type": "manual"}, "hide_empty_groups": hide_empty}


def stage_views():
    P, D = state["pages"], state["dbs"]
    done = state.setdefault("views_done", [])
    due_sort = [{"property": "Due", "direction": "ascending"}, {"property": "Priority", "direction": "ascending"}]

    if "tasks" not in done:
        t = D["tasks"]
        call("PATCH", f"/views/{first_view(t['db'])}", {
            "name": "Open tasks", "filter": NOT_DONE, "sorts": due_sort,
            "configuration": table(TASK_PROPS, ["Status", "Task", "Due", "Priority", "Category", "Top 3"],
                                   {"Status": 40, "Task": 280})})
        call("POST", "/views", {"database_id": t["db"], "data_source_id": t["ds"], "name": "By category",
                                "type": "board", "filter": NOT_DONE, "sorts": due_sort,
                                "configuration": {"type": "board", "group_by": group_select("Category"),
                                                  "card_layout": "list",
                                                  "properties": pcfg(TASK_PROPS, ["Task", "Due", "Priority"], rel_date=True)}})
        call("POST", "/views", {"database_id": t["db"], "data_source_id": t["ds"], "name": "Done",
                                "type": "table", "filter": {"property": "Status", "status": {"equals": "Done"}},
                                "sorts": [{"timestamp": "last_edited_time", "direction": "descending"}],
                                "configuration": table(TASK_PROPS, ["Status", "Task", "Due", "Category", "Updated"],
                                                       {"Status": 40, "Task": 280})})
        done.append("tasks"); save()

    if "commitments" not in done:
        c = D["commitments"]
        time_sort = [{"property": "Time", "direction": "ascending"}]
        default_view = first_view(c["db"])
        call("POST", "/views", {
            "database_id": c["db"], "data_source_id": c["ds"], "position": {"type": "start"},
            "name": "Timetable", "type": "board", "sorts": time_sort,
            "configuration": {"type": "board", "group_by": group_select("Day"), "card_layout": "list",
                              "properties": pcfg(COMMIT_PROPS, ["Commitment", "Time", "Where"])}})
        call("DELETE", f"/views/{default_view}")
        call("POST", "/views", {"database_id": c["db"], "data_source_id": c["ds"], "name": "By day (phone)",
                                "type": "table", "sorts": time_sort,
                                "configuration": table(COMMIT_PROPS, ["Commitment", "Time", "Where", "Type"],
                                                       {"Commitment": 200}, group=group_select("Day", True))})
        done.append("commitments"); save()

    if "week_deadlines" not in done:
        v = linked(P["week"], "tasks", "Next 30 days", "table",
                   {"and": [NOT_DONE, {"property": "Priority", "select": {"does_not_equal": "Optional"}},
                            {"property": "Due", "date": {"on_or_after": "today"}},
                            {"property": "Due", "date": {"on_or_before": "one_month_from_now"}}]},
                   due_sort, table(TASK_PROPS, ["Status", "Task", "Due", "Priority", "Category"],
                                   {"Status": 40, "Task": 260}))
        call("POST", "/views", {"database_id": v["parent"]["database_id"], "data_source_id": D["tasks"]["ds"],
                                "name": "Calendar", "type": "calendar", "filter": NOT_DONE,
                                "configuration": {"type": "calendar", "date_property_id": pid("tasks", "Due"),
                                                  "properties": pcfg(TASK_PROPS, ["Task"])}})
        done.append("week_deadlines"); save()

    if "routines" not in done:
        r = D["routines"]
        dsort = [{"property": "Date", "direction": "descending"}]
        call("PATCH", f"/views/{first_view(r['db'])}", {
            "name": "This week", "filter": {"property": "Date", "date": {"this_week": {}}}, "sorts": dsort,
            "configuration": table(ROUTINE_PROPS, ["Day"] + MORNING + EVENING + ["Progress"],
                                   {"Day": 110, **{m: 90 for m in MORNING + EVENING}}, rel_date=False)})
        call("POST", "/views", {"database_id": r["db"], "data_source_id": r["ds"], "name": "History",
                                "type": "table", "sorts": dsort,
                                "configuration": table(ROUTINE_PROPS, ["Day", "Progress"], {"Day": 140, "Progress": 180},
                                                       rel_date=False)})
        done.append("routines"); save()

    if "reset" not in done:
        pg = P["reset"]
        linked(pg, "tasks", "Finished this week", "table",
               {"and": [{"property": "Status", "status": {"equals": "Done"}},
                        {"timestamp": "last_edited_time", "last_edited_time": {"on_or_after": "one_week_ago"}}]},
               [{"property": "Category", "direction": "ascending"}],
               table(TASK_PROPS, ["Status", "Task", "Category"], {"Status": 40, "Task": 300}))
        append(pg, [h2("2 · Catch unfinished priorities"),
                    gray("Overdue, or still marked Top 3. For each one, give it a new date or delete it. "
                         "Both are fine.")])
        linked(pg, "tasks", "Unfinished", "table",
               {"and": [NOT_DONE, {"or": [{"property": "Due", "date": {"before": "today"}},
                                          {"property": "Top 3", "checkbox": {"equals": True}}]}]},
               due_sort, table(TASK_PROPS, ["Status", "Task", "Due", "Priority", "Top 3"],
                               {"Status": 40, "Task": 260}))
        append(pg, [h2("3 · Plan the week ahead"),
                    num("Check your timetable on My Week. Change anything that's different this week."),
                    num("Add new tasks and deadlines in Task Manager."),
                    num("Rewrite your two or three goals on My Week."),
                    num("Tick ⭐ Top 3 on the three tasks that matter most for tomorrow."),
                    gray("Coming up in the next 7 days:")])
        linked(pg, "tasks", "Next 7 days", "table",
               {"and": [NOT_DONE, {"property": "Due", "date": {"on_or_after": "tomorrow"}},
                        {"property": "Due", "date": {"on_or_before": "one_week_from_now"}}]},
               due_sort, table(TASK_PROPS, ["Status", "Task", "Due", "Priority", "Top 3"],
                               {"Status": 40, "Task": 260}))
        append(pg, [h2("4 · Reflect (2 minutes)"),
                    gray("Add a row for this week and answer three short questions. One line each is plenty.")])
        D["resets"] = create_db(pg, "Reflections", "refresh", {
            "Week": {"title": {}}, "Week starting": {"date": {}},
            "What went well?": {"rich_text": {}}, "What got in the way?": {"rich_text": {}},
            "One thing to change": {"rich_text": {}}})
        save()
        rs = D["resets"]
        RP = ["Week", "Week starting", "What went well?", "What got in the way?", "One thing to change"]
        call("PATCH", f"/views/{first_view(rs['db'])}", {
            "name": "All weeks", "sorts": [{"property": "Week starting", "direction": "descending"}],
            "configuration": table(RP, ["Week", "What went well?", "What got in the way?", "One thing to change"],
                                   {"Week": 140, "What went well?": 220, "What got in the way?": 220,
                                    "One thing to change": 220}, rel_date=False)})
        monday = TODAY - dt.timedelta(days=TODAY.weekday())
        for weeks_ago, good, bad, change in [
            (2, "Handed in the chemistry report on time.", "Phone in bed. Late nights midweek.",
             "Phone charges outside the bedroom."),
            (1, "Did my morning routine 5 days out of 7.", "Two extra café shifts, so less revision.",
             "Start revision on Sunday, not Wednesday.")]:
            ws = monday - dt.timedelta(weeks=weeks_ago)
            page_in(rs["ds"], {"Week": title("Week of " + ws.strftime("%-d %b")),
                               "Week starting": {"date": {"start": ws.isoformat()}},
                               "What went well?": text(good), "What got in the way?": text(bad),
                               "One thing to change": text(change)})
        done.append("reset"); save()

    if "today" not in done:
        pg = P["today"]
        append(pg, [callout(["Each morning: check your schedule, choose your Top 3, then start the first one. "
                             "Tick a task's box when it's done."], icon="sun"),
                    h2("Today's schedule")])
        linked(pg, "commitments", "Today's schedule", "list",
               {"property": "Is today", "formula": {"checkbox": {"equals": True}}},
               [{"property": "Time", "direction": "ascending"}],
               {"type": "list", "properties": pcfg(COMMIT_PROPS, ["Commitment", "Time", "Where"])})
        append(pg, [h2("⭐ Today's Top 3"),
                    gray("Your three priorities. Tick ⭐ Top 3 on any task to put it here.")])
        linked(pg, "tasks", "Top 3", "table",
               {"and": [NOT_DONE, {"property": "Top 3", "checkbox": {"equals": True}}]},
               [{"property": "Priority", "direction": "ascending"}, {"property": "Due", "direction": "ascending"}],
               table(TASK_PROPS, ["Status", "Task", "Due", "Category"], {"Status": 40, "Task": 260}))
        append(pg, [h2("Must do today"), gray("Urgent and important tasks due today or overdue.")])
        linked(pg, "tasks", "Must do", "table",
               {"and": [NOT_DONE, {"property": "Top 3", "checkbox": {"equals": False}},
                        {"property": "Due", "date": {"on_or_before": "today"}},
                        {"property": "Priority", "select": {"does_not_equal": "Optional"}}]},
               due_sort, table(TASK_PROPS, ["Status", "Task", "Due", "Priority"], {"Status": 40, "Task": 260}))
        append(pg, [h2("If there's time"), gray("Optional tasks. No pressure.")])
        linked(pg, "tasks", "If there's time", "table",
               {"and": [NOT_DONE, {"property": "Top 3", "checkbox": {"equals": False}},
                        {"property": "Priority", "select": {"equals": "Optional"}},
                        {"or": [{"property": "Due", "date": {"is_empty": True}},
                                {"property": "Due", "date": {"on_or_before": "today"}}]}]},
               due_sort, table(TASK_PROPS, ["Status", "Task", "Category"], {"Status": 40, "Task": 260}))
        append(pg, [h2("Routines"),
                    callout("SETUP: add the \"Start today's routines\" button here (see Start Here, step 0). "
                            "Delete this box afterwards.", emoji="🔧")])
        rtoday = {"property": "Date", "date": {"equals": "today"}}
        linked(pg, "routines", "☀️ Morning", "table", rtoday, None,
               table(ROUTINE_PROPS, ["Day"] + MORNING, {"Day": 100, **{m: 110 for m in MORNING}}, rel_date=False))
        linked(pg, "routines", "🌙 Evening", "table", rtoday, None,
               table(ROUTINE_PROPS, ["Day"] + EVENING + ["Progress"],
                     {"Day": 100, **{e: 110 for e in EVENING}}, rel_date=False))
        done.append("today"); save()
    print("views done:", done)


if __name__ == "__main__":
    for s in sys.argv[1:]:
        globals()[f"stage_{s}"]()
