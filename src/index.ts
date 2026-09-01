import { buildSchema, graphql } from "graphql";
import { Hono } from "hono";

interface D1Result<T> {
  results: T[];
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

export interface Bindings {
  DB: D1Database;
  ASSETS: AssetFetcher;
}

interface AccountRow {
  id: number;
  display_name: string;
  plan: string;
}

interface OrderRow {
  id: number;
  item: string;
  status: string;
}

const app = new Hono<{ Bindings: Bindings }>();

const WEAK_PROOF_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzeW50aGV0aWMtdXNlciIsInNjb3BlIjoicHJvb2Ytb25seSIsImlzcyI6Imxkdy1kYXN0LXByb29mIiwiZXhwIjoxODkzNDU2MDAwfQ.yiLvb6Gf9HG_BQ3QvuPlhxUFsC414UU35xM4EJjVIwE";
const PROOF_SESSION = "proof-access-2026";
const TRUSTED_ORIGIN = "https://trusted.example";

const graphqlSchema = buildSchema(`
  type Account {
    id: ID!
    displayName: String!
    plan: String!
  }

  type Query {
    health: String!
    account(id: ID!): Account
  }

  type Mutation {
    resetAccount(id: ID!): Boolean!
    exportAccount(id: ID!): String!
  }
`);

const safeGraphqlSchema = buildSchema(`
  type Query {
    health: String!
  }
`);

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlPage(title: string, body: string, script = ""): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>
  <main>${body}</main>
  ${script}
</body>
</html>`;
}

function hasProofSession(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .includes(`proof_session=${PROOF_SESSION}`);
}

function containsDestructiveSql(value: string): boolean {
  return (
    value.includes(";") ||
    /\b(?:insert|update|delete|drop|alter|create|replace|truncate|attach|detach|vacuum|pragma)\b/i.test(
      value,
    )
  );
}

async function parseGraphqlRequest(request: Request): Promise<string> {
  if (request.method === "GET") {
    return new URL(request.url).searchParams.get("query") ?? "";
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as { query?: unknown };
    return typeof payload.query === "string" ? payload.query : "";
  }
  return request.text();
}

app.use("*", async (c, next) => {
  await next();
  c.header("X-Robots-Tag", "noindex, nofollow, noarchive");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  c.header("Cache-Control", "no-store");
  c.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
});

app.get("/search", (c) => {
  const q = c.req.query("q") ?? "";
  return c.html(
    htmlPage(
      "Search",
      `<h1>Search</h1><p>Results for <span data-query>${q}</span></p>`,
    ),
  );
});

app.get("/catalog", (c) => {
  const q = c.req.query("q") ?? "";
  return c.html(
    htmlPage(
      "Catalog",
      `<h1>Catalog</h1><p>Results for <span data-query>${escapeHtml(q)}</span></p>`,
    ),
  );
});

app.get("/embed", (c) =>
  c.html(
    htmlPage(
      "Embed",
      '<h1>Embed Console</h1><div id="message-output">Waiting</div>',
      `<script>
window.addEventListener("message", (event) => {
  document.getElementById("message-output").innerHTML = String(event.data);
});
</script>`,
    ),
  ),
);

app.get("/widget", (c) =>
  c.html(
    htmlPage(
      "Widget",
      '<h1>Widget Console</h1><div id="message-output">Waiting</div>',
      `<script>
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  document.getElementById("message-output").textContent = String(event.data);
});
</script>`,
    ),
  ),
);

app.get("/admin", (c) =>
  c.html(
    htmlPage(
      "Operations",
      "<h1>Operations Console</h1><p>Synthetic administrative surface.</p>",
    ),
  ),
);

app.get("/.git/HEAD", (c) =>
  c.text("ref: refs/heads/synthetic-proof\n", 200, {
    "Content-Type": "text/plain; charset=utf-8",
  }),
);

app.get("/openapi.json", (c) =>
  c.json({
    openapi: "3.1.0",
    info: { title: "Harbor Service API", version: "1.0.0" },
    paths: {
      "/api/accounts": {
        get: {
          parameters: [
            {
              name: "id",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Synthetic account rows" } },
        },
      },
      "/api/profile": {
        get: { responses: { "200": { description: "Synthetic profile" } } },
      },
      "/api/config": {
        get: { responses: { "200": { description: "Synthetic config" } } },
        put: { responses: { "200": { description: "No-op update" } } },
        delete: { responses: { "200": { description: "No-op delete" } } },
      },
      "/api/export": {
        get: { responses: { "200": { description: "Synthetic export" } } },
      },
      "/api/orders": {
        get: {
          parameters: [
            {
              name: "id",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Synthetic order rows" } },
        },
      },
      "/api/status": {
        get: { responses: { "200": { description: "Synthetic status" } } },
      },
      "/api/preferences": {
        get: { responses: { "200": { description: "Synthetic preferences" } } },
      },
      "/api/account": {
        get: {
          responses: {
            "200": { description: "Session protected synthetic account" },
            "401": { description: "Not authorized" },
          },
        },
      },
      "/graphql": {
        post: { responses: { "200": { description: "GraphQL response" } } },
      },
      "/graphql-internal": {
        post: {
          responses: {
            "200": { description: "Restricted GraphQL response" },
            "403": { description: "Introspection unavailable" },
          },
        },
      },
    },
  }),
);

app.get("/service.wsdl", (c) =>
  c.body(
    `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:tns="urn:harbor-proof" targetNamespace="urn:harbor-proof">
  <message name="LookupRequest" />
  <message name="LookupResponse" />
  <portType name="HarborPortType"><operation name="LookupAccount"><input message="tns:LookupRequest"/><output message="tns:LookupResponse"/></operation></portType>
  <binding name="HarborBinding" type="tns:HarborPortType"><soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/></binding>
  <service name="HarborService"><port name="HarborPort" binding="tns:HarborBinding"><soap:address location="${new URL(c.req.url).origin}/soap"/></port></service>
</definitions>`,
    200,
    { "Content-Type": "text/xml; charset=utf-8" },
  ),
);

app.post("/soap", async (c) => {
  await c.req.text();
  return c.body(
    '<?xml version="1.0"?><Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body><LookupAccountResponse><status>synthetic</status></LookupAccountResponse></Body></Envelope>',
    200,
    { "Content-Type": "text/xml; charset=utf-8" },
  );
});

app.get("/api/accounts", async (c) => {
  const id = c.req.query("id") ?? "1";
  if (containsDestructiveSql(id)) {
    return c.json({ error: "unsupported input" }, 400);
  }

  const query = `SELECT id, display_name, plan FROM accounts WHERE id = ${id}`;
  const result = await c.env.DB.prepare(query).all<AccountRow>();
  return c.json({ rows: result.results });
});

app.get("/api/orders", async (c) => {
  const id = c.req.query("id") ?? "1";
  const result = await c.env.DB.prepare(
    "SELECT id, item, status FROM orders WHERE id = ?",
  )
    .bind(id)
    .all<OrderRow>();
  return c.json({ rows: result.results });
});

app.options("/api/profile", (c) => {
  const origin = c.req.header("origin") ?? "*";
  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return c.body(null, 204);
});

app.get("/api/profile", (c) => {
  const origin = c.req.header("origin") ?? "*";
  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Credentials", "true");
  return c.json({ id: "SYNTHETIC-001", displayName: "Synthetic Harbor User" });
});

app.options("/api/status", (c) => {
  const origin = c.req.header("origin");
  if (origin === TRUSTED_ORIGIN) {
    c.header("Access-Control-Allow-Origin", TRUSTED_ORIGIN);
  }
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  return c.body(null, 204);
});

app.get("/api/status", (c) => {
  const origin = c.req.header("origin");
  if (origin === TRUSTED_ORIGIN) {
    c.header("Access-Control-Allow-Origin", TRUSTED_ORIGIN);
  }
  return c.json({ status: "ok" });
});

app.all("/api/config", (c) =>
  c.json({ method: c.req.method, accepted: true, changed: false }),
);

app.get("/api/preferences", (c) => c.json({ theme: "system" }));
app.put("/api/preferences", (c) => {
  c.header("Allow", "GET");
  return c.json({ error: "method not allowed" }, 405);
});
app.delete("/api/preferences", (c) => {
  c.header("Allow", "GET");
  return c.json({ error: "method not allowed" }, 405);
});

app.get("/api/runtime", (c) => {
  const debug = c.req.query("debug");
  if (debug !== undefined) {
    return c.json({
      status: "ok",
      debug: true,
      internalMode: "synthetic-proof",
      buildChannel: "runtime-canary",
    });
  }
  return c.json({ status: "ok", mode: c.req.query("mode") ?? "default" });
});

app.get("/api/session-info", (c) =>
  c.json({ token: WEAK_PROOF_JWT, purpose: "synthetic proof only" }),
);

app.get("/api/export", (c) =>
  c.json({
    accountId: "SYNTHETIC-001",
    displayName: "Synthetic Harbor User",
    accountNumber: "TEST-0001",
    plan: "proof-only",
    balance: "$0.00",
  }),
);

app.post("/form", async (c) => {
  const body = await c.req.formData();
  const noteValue = body.get("note");
  const note = typeof noteValue === "string" ? noteValue : "";
  return c.html(htmlPage("Form Result", `<h1>Submitted</h1><p>${note}</p>`));
});

app.get("/form", (c) =>
  c.html(
    htmlPage(
      "Contact",
      '<h1>Contact</h1><form method="post" action="/form"><label>Note <input name="note"></label><button type="submit">Send</button></form>',
    ),
  ),
);

app.on(["GET", "POST"], "/graphql", async (c) => {
  const query = await parseGraphqlRequest(c.req.raw);
  const result = await graphql({
    schema: graphqlSchema,
    source: query || "{ health }",
    rootValue: {
      health: () => "ok",
      account: ({ id }: { id: string }) => ({
        id,
        displayName: "Synthetic Harbor User",
        plan: "proof-only",
      }),
      resetAccount: () => false,
      exportAccount: () => "SYNTHETIC_EXPORT_ONLY",
    },
  });
  return c.json(result);
});

app.on(["GET", "POST"], "/graphql-internal", async (c) => {
  const query = await parseGraphqlRequest(c.req.raw);
  if (query.includes("__schema") || query.includes("__type")) {
    return c.json({ errors: [{ message: "introspection unavailable" }] }, 403);
  }
  const result = await graphql({
    schema: safeGraphqlSchema,
    source: query || "{ health }",
    rootValue: { health: () => "ok" },
  });
  return c.json(result);
});

app.get("/session/start", (c) => {
  c.header(
    "Set-Cookie",
    `proof_session=${PROOF_SESSION}; Path=/; Max-Age=1800; HttpOnly; SameSite=Lax; Secure`,
  );
  return c.redirect("/private", 302);
});

app.get("/private", (c) => {
  if (!hasProofSession(c.req.raw)) return c.text("not authorized", 401);
  return c.html(
    htmlPage(
      "Private",
      '<h1>Private Proof Area</h1><p>Synthetic session-only content.</p><a href="/private/reports">Reports</a>',
    ),
  );
});

app.get("/private/reports", (c) => {
  if (!hasProofSession(c.req.raw)) return c.text("not authorized", 401);
  return c.json({ report: "synthetic-only", rows: 2 });
});

app.get("/api/account", (c) => {
  if (!hasProofSession(c.req.raw))
    return c.json({ error: "not authorized" }, 401);
  return c.json({ id: "SYNTHETIC-001", plan: "proof-only" });
});

app.notFound(async (c) => {
  const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
  if (assetResponse.status !== 404) {
    const headers = new Headers(assetResponse.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "no-store");
    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  }
  return c.text("not found", 404);
});

export { app };
export default app;
