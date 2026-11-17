"""Tiny helpers for Notion block JSON."""


def rt(text, bold=False, italic=False, color="default", link=None):
    t = {"type": "text", "text": {"content": text}}
    if link:
        t["text"]["link"] = {"url": link}
    t["annotations"] = {"bold": bold, "italic": italic, "color": color}
    return t


def _rich(parts):
    if isinstance(parts, str):
        return [rt(parts)]
    return [rt(p) if isinstance(p, str) else p for p in parts]


def para(parts="", color="default"):
    return {"type": "paragraph", "paragraph": {"rich_text": _rich(parts) if parts else [], "color": color}}


def h2(text):
    return {"type": "heading_2", "heading_2": {"rich_text": _rich(text)}}


def h3(text):
    return {"type": "heading_3", "heading_3": {"rich_text": _rich(text)}}


def callout(parts, emoji="💡", color="gray_background", icon=None):
    ic = {"type": "icon", "icon": {"name": icon, "color": "gray"}} if icon else {"type": "emoji", "emoji": emoji}
    return {"type": "callout", "callout": {"rich_text": _rich(parts), "icon": ic, "color": color}}


def quote(parts):
    return {"type": "quote", "quote": {"rich_text": _rich(parts)}}


def todo(text, checked=False):
    return {"type": "to_do", "to_do": {"rich_text": _rich(text), "checked": checked}}


def bullet(parts):
    return {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": _rich(parts)}}


def num(parts):
    return {"type": "numbered_list_item", "numbered_list_item": {"rich_text": _rich(parts)}}


def divider():
    return {"type": "divider", "divider": {}}


def toggle(parts, children):
    return {"type": "toggle", "toggle": {"rich_text": _rich(parts), "children": children}}


def gray(text):
    return para([rt(text, color="gray")])
