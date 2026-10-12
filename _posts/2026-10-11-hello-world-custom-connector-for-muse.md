---
title: Building a Hello-World Custom Connector for Muse
date: 2026-10-11
categories:
  - llm
  - ai
tags:
  - ai, llm, mcp, agent, ai-agent, agentic-ai, agentic, custom-connector, muse, ngrok
---

Recently I wanted to discover how to build a custom connector that Muse — Meta's personal AI agent — could use to reach a remote service of mine. The idea was simple: start with a temporary hello-world API as a proof of concept, prove the full round trip, and only then think about real functionality.

This post is the exact recipe I followed, written so that another builder — or another AI agent — can repeat it end to end. All the code is below.

> ⚠️ One thing I learned first: Meta has published no official developer documentation, SDK, or protocol spec for building custom Muse connectors. The only official word is a short Help Center article that says "you can ask Muse to create a Custom Connector," with a warning that Meta does not review custom connectors. So everything below is reverse-engineered from practice, not from docs.

## The plan

Five steps, in order:

1. Write a tiny HTTP server with a public `/health` endpoint and a Bearer-protected `/hello` endpoint.
2. Expose it to the internet so Muse can reach it.
3. Register a custom connector in Muse, scoped to that URL, with the API key sent as a Bearer header.
4. Scaffold a workspace skill with a small CLI (`hello`, `health`, `status`) for repeatable calls.
5. Verify the end-to-end round trip.

## Step 1: The server

I wanted zero dependencies — pure Python standard library, so anyone can run it without installing anything. The server has two endpoints:

- `GET /health` — no auth, just a liveness check.
- `GET /hello` — requires `Authorization: Bearer <API_KEY>`, returns `{"message": "hello world"}`.

The API key comes from the `HACKATHON_API_KEY` environment variable, and the port defaults to 8765.

```python
#!/usr/bin/env python3
"""PoC hello-world API for the Muse custom-connector.

Endpoints:
  GET /health  - no auth, liveness check
  GET /hello   - requires Authorization: Bearer <API_KEY>

The API key is read from the HACKATHON_API_KEY env var.
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

API_KEY = os.environ.get("HACKATHON_API_KEY", "")
PORT = int(os.environ.get("PORT", "8765"))


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            self._send(200, {"status": "ok"})
            return
        if self.path == "/hello":
            auth = self.headers.get("Authorization", "")
            if not API_KEY or auth != f"Bearer {API_KEY}":
                self._send(401, {"error": "unauthorized"})
                return
            self._send(200, {"message": "hello world", "service": "hackathon-hello-poc"})
            return
        self._send(404, {"error": "not found"})

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    if not API_KEY:
        raise SystemExit("HACKATHON_API_KEY env var is required")
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
```

Run it locally:

```bash
export HACKATHON_API_KEY="your-secret-key-here"
python3 server.py
```

Then verify the three cases — health works, `/hello` without a key is rejected, `/hello` with the key succeeds:

```bash
curl localhost:8765/health
# {"status": "ok"}

curl localhost:8765/hello
# {"error": "unauthorized"}

curl -H "Authorization: Bearer $HACKATHON_API_KEY" localhost:8765/hello
# {"message": "hello world", "service": "hackathon-hello-poc"}
```

## Step 2: Expose it with ngrok

Muse runs in the cloud, so `localhost` is not enough — the server needs a public HTTPS URL.

My first attempt was a Cloudflare quick tunnel from the VM where Muse runs. That failed because of the VM's runtime proxy, so I switched plans: I ran both the server and ngrok on my own Mac, which already had ngrok installed.

On the Mac, in one terminal:

```bash
export HACKATHON_API_KEY="your-secret-key-here"
python3 server.py
```

In another:

```bash
ngrok http 8765
```

ngrok prints a forwarding line like:

```
Forwarding https://<random-subdomain>.ngrok-free.dev -> http://localhost:8765
```

Copy that public URL. That is the URL you hand to Muse for connector registration.

> ⚠️ ngrok's free URLs are ephemeral. Every time you restart ngrok, the subdomain changes, and the connector must be re-registered against the new URL. Plan accordingly — or pay for a reserved domain if you want stability.

## Step 3: Register the custom connector in Muse

I asked Muse to create a custom connector. It registered one named `custom.hackathon-hello`, scoped to the ngrok hostname, configured so the API key is sent as a Bearer header on each request.

The API key itself was never typed into chat. Muse presented a secure credential form; the key went straight into its credential store, and Muse never saw the raw value. If you are doing this yourself, never paste secrets into chat — use the secure entry flow.

## Step 4: Scaffold a skill with a CLI

To make the connector reusable (and to give future AI agents a documented interface), we scaffolded a workspace skill — a small folder with a `SKILL.md` describing the provider and a CLI script exposing three subcommands:

- `hello` — `GET /hello` (authenticated), prints the JSON response.
- `health` — `GET /health` (no auth), liveness check.
- `status` — reports whether the connector credential works.

From then on, testing the connector was a one-liner instead of a curl incantation.

## Step 5: Verify the round trip

The moment of truth: Muse called `/hello` through the connector, from its cloud environment, against my Mac-hosted server, through ngrok. The response:

```json
{"message": "hello world"}
```

The full round trip worked — the request left Muse's cloud, traveled through ngrok to my Mac, the server checked the Bearer key, and the JSON came back.

## 💡 Best practices for building Muse connectors

A few things worth knowing before you design your own connector:

**Pick your entry point.** Muse connects three ways: an **MCP server URL** (streamable HTTP), a **REST API** (OpenAPI spec or docs page), or a **CLI package**. You hand Muse the entry point in chat and it builds the integration itself. For a first proof of concept, REST with a Bearer token is the fastest thing that works — we just proved it above. MCP over streamable HTTP is the better answer if you want the connector to also work with other agents and look "standard": it's the USB-C of agent tools.

**Remote, stable, HTTPS.** Whatever you build, the endpoint has to be reachable from Muse's cloud. A laptop-only server is not — which is exactly why we used ngrok.

**Design for an agent, not a human:**
- Tool and endpoint names are your UI — that's how Muse decides when to call you. Name things like `get_order_status`, not `endpoint_2`.
- Keep responses fast. Agents feel broken above a few seconds per step.
- Return explicit errors, not ambiguous partial success — agents handle those badly.
- Separate read and write scopes; require confirmation for anything destructive.
- Validate all inputs. Prompt injection trickling into your backend is the classic attack here (a malicious email body shouldn't become a SQL query).
- Ship an OpenAPI spec and/or an `llms.txt` so the agent can self-serve your docs.
- Auth via Bearer token or OAuth 2.0 authorization-code flow. Keys go through Muse's secure credential prompt, never chat.

**Know the OAuth wrinkle.** One builder documented that Muse's OAuth flow can ask for a Client ID via dynamic client registration rather than registering itself — worth knowing if you go the MCP + OAuth route (see cortex-mcp's docs below).

## 🔧 Open-source examples worth studying

- [cortex-mcp](https://github.com/JoseJimenez-M/cortex-mcp) — a self-hosted MCP server written in Go, with explicit [Meta Muse connection docs](https://github.com/josejimenez-m/cortex-mcp/blob/HEAD/docs/connecting-clients.md) that walk through the OAuth client-registration dance. The best single repo to study if you want to learn the MCP path.
- [KaiCalls submission notes](https://github.com/KaiCalls/kaicalls-mcp/pull/5) — a pull request documenting what Meta's `muse.ai/platform` directory submission form actually asks for, field by field. If you plan to submit your own connector to Meta's directory, this shows exactly what information they collect before you start.
- [tickadoo's Muse connector](https://github.com/tickadoo/tickadoo-mcp/tree/main/connectors/muse) — a real MCP server that ships a Muse-specific connector folder. A good reference for how to structure the Muse side of an MCP project.
- [agent-layer](https://github.com/lopushok9/agent-layer) — an x402 payments MCP with a dedicated Muse onboarding page. A good example of the "Connect via Muse" UX pattern if your service needs users to authorize it.

## 📚 Further reading

- [Meta's official Help Center article on connectors](https://www.meta.com/help/artificial-intelligence/1687253048996149/) — the only official word from Meta on custom connectors. It's short, but it's the ground truth: you ask Muse to create a custom connector and it guides you through the setup.
- [Parallel: Meta Muse Custom Integrations](https://parallel.ai/articles/meta-muse-custom-integrations) — the clearest end-to-end playbook out there: entry points, the prompt template, credential handling, approval policies.
- [Stackademic: Building Muse Connectors, a developer's guide](https://stackademic.com/blog/building-muse-connectors-a-developer-s-guide-to-plugging-services-into-meta-s-agent) — goes deeper on security: audit trails, input validation, rate limits, latency.
- [Ship with Muse: connectors guide](https://shipwithmuse.live/blog/muse-connectors-guide) — how builders actually ship: OpenAPI + `llms.txt` + Bearer auth, plus starter templates.
- [make-it-muse skill](https://github.com/aris10223/make-it-muse/blob/HEAD/skills/make-it-muse/SKILL.md) — documents both the directory-submission path and the custom-connector prompt approach in one place.
- [Meta Muse Connectors Explained (video)](https://www.youtube.com/watch?v=nzM7rOHCOaQ) — walks through MCP, going live, and the submission requirements with a real app.

## Repeating this yourself: the checklist

1. Save the server code above as `server.py`.
2. `export HACKATHON_API_KEY=<a-long-random-secret>` and run `python3 server.py`.
3. `ngrok http 8765`, copy the forwarding URL.
4. Ask Muse to create a custom connector scoped to that hostname, with the key as a Bearer header — enter the key through the secure credential form, not chat.
5. Scaffold a skill/CLI with `hello`, `health`, and `status` for repeatability.
6. Call `/hello` through the connector and confirm you get `{"message": "hello world"}`.
7. Remember: restart ngrok → new URL → re-register the connector.

That is the whole PoC. From here, the path is clear: replace the hello-world endpoints with real ones, keep the auth pattern, and the connector keeps working.
