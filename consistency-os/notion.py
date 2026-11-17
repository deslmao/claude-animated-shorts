import json, ssl, time, urllib.request, urllib.error
API = "https://api.notion.com/v1"
CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
HDR = {"Authorization": "Bearer proxy-injected", "Notion-Version": "2026-03-11", "Content-Type": "application/json"}
def call(method, path, body=None, ok_errors=False):
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(6):
        req = urllib.request.Request(API + path, data=data, method=method, headers=HDR)
        try:
            with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
                time.sleep(0.34)
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            payload = json.loads(e.read() or b"{}")
            if e.code in (429, 500, 502, 503, 504) and attempt < 5:
                time.sleep(2 ** attempt); continue
            if ok_errors: return payload
            raise RuntimeError(f"{method} {path} -> {e.code}: {payload.get('code')} {payload.get('message')}")
