import json
from blocks import *
from notion import call
s = json.load(open("state.json")); P = s["pages"]
# fix placeholder text on Today
for b in call("GET", f"/blocks/{P['today']}/children?page_size=100")["results"]:
    if b["type"] == "callout" and b["callout"]["rich_text"][0]["plain_text"].startswith("SETUP"):
        call("PATCH", f"/blocks/{b['id']}", {"callout": {"rich_text": [rt(
            "SETUP (for the template owner): put the \"Start today's routines\" button here, "
            "then delete this box.")]}})
if not s.get("guide_done"):
    call("PATCH", f"/blocks/{P['start']}/children", {"children": [
        callout("Consistency OS has one habit: open Today each morning. Once a week, do a Weekly Reset. "
                "That's it.", icon="book-open"),
        h2("Your first 5 minutes"),
        num(["Open ", rt("My Week", bold=True), " and swap the sample timetable for your real classes, "
             "shifts and plans. Change the Day, Time and Where."]),
        num(["Open ", rt("Task Manager", bold=True), " and add 3–5 real tasks. Give each a due date "
             "and a priority."]),
        num(["Tick ", rt("⭐ Top 3", bold=True), " on the three that matter most today."]),
        num(["Open ", rt("Today", bold=True), ". Your plan for the day is already there."]),
        num(["On your phone: open Today, tap ••• and choose ", rt("Add to Favourites", bold=True),
             " so it's one tap away."]),
        h2("How it fits together"),
        bullet([rt("Today", bold=True), ": your schedule, Top 3, must-dos and optional tasks, plus routines."]),
        bullet([rt("My Week", bold=True), ": weekly timetable, this week's goals, upcoming deadlines."]),
        bullet([rt("Task Manager", bold=True), ": every task in one place."]),
        bullet([rt("Routines", bold=True), ": morning and evening check-ins. No streaks, no guilt."]),
        bullet([rt("Weekly Reset", bold=True), ": a 15-minute review and plan, once a week."]),
        h2("Choosing a priority"),
        bullet([rt("Urgent", bold=True), ": has to happen soon, or something goes wrong."]),
        bullet([rt("Important", bold=True), ": matters, but there's some flexibility."]),
        bullet([rt("Optional", bold=True), ": nice to do if there's time."]),
        gray("Tip: give urgent and important tasks a due date. That's how they reach Today."),
        h2("Make it yours"),
        bullet(["Routines: open Routines and rename any column to your own habit. "
                "The toggle on that page shows how."]),
        bullet("Categories: in Task Manager, click a Category tag to rename it or add your own."),
        toggle("Remove the sample data", [
            num("Task Manager: open the Open tasks view, select all rows (click the first checkbox, "
                "shift-click the last) and delete. Do the same in the Done view."),
            num("My Week: delete the sample timetable rows and rewrite the goals."),
            num("Routines and Weekly Reset: delete the sample rows."),
        ]),
        h2("Good to know"),
        bullet("Missed a day or a week? Nothing breaks. Just open Today and carry on."),
        bullet("Tasks disappear from Today once they're ticked. You'll find them in Task Manager → Done."),
        bullet("Routines need a row for each day. Tap the Start today's routines button on Today "
               "to add one."),
    ]})
    s["guide_done"] = True
    json.dump(s, open("state.json", "w"), indent=2)
print("guide ok")
