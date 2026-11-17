import json
from notion import call
s = json.load(open("state.json"))
_cache = {}
def title_of(page):
    if page["id"] not in _cache:
        _cache[page["id"]] = call("GET", f"/pages/{page['id']}")
    page = _cache[page["id"]]
    for p in page["properties"].values():
        if p["type"] == "title":
            return "".join(t["plain_text"] for t in p["title"])
def show_page(name, pid):
    print(f"\n=== {name}")
    for b in call("GET", f"/blocks/{pid}/children?page_size=100")["results"]:
        t = b["type"]
        if t == "child_database":
            for v in call("GET", f"/views?database_id={b['id']}")["results"]:
                v = call("GET", f"/views/{v['id']}")
                q = call("POST", f"/views/{v['id']}/queries", {})
                rows = [title_of(r) for r in q["results"]] if v["type"] != "calendar" else f"{q['total_count']} items"
                print(f"  [DB view] {v['name']} ({v['type']}): {rows}")
        elif t == "child_page":
            print("  [page]", b["child_page"]["title"])
        else:
            rtxt = b[t].get("rich_text") if isinstance(b[t], dict) else None
            print(f"  {t}:", ("".join(x['plain_text'] for x in rtxt)[:70] if rtxt else ""))
for k in ["today", "week", "tasks", "routines", "reset"]:
    show_page(k, s["pages"][k])
