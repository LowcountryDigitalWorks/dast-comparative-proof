import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { app, type Bindings } from "../src/index.js";

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

class FakeStatement {
  private values: unknown[] = [];

  constructor(
    private readonly query: string,
    private readonly accounts: AccountRow[],
    private readonly orders: OrderRow[],
  ) {}

  bind(...values: unknown[]): FakeStatement {
    this.values = values;
    return this;
  }

  async all<T>(): Promise<{ results: T[] }> {
    const lower = this.query.toLowerCase();
    if (
      /\b(?:insert|update|delete|drop|alter|create|replace|truncate|attach|detach|vacuum|pragma)\b/i.test(
        this.query,
      )
    ) {
      throw new Error("write query reached fake D1");
    }
    if (lower.includes("from accounts")) {
      if (/\bor\s+1\s*=\s*1\b/i.test(this.query)) {
        return { results: this.accounts as T[] };
      }
      const match = /where\s+id\s*=\s*(\d+)/i.exec(this.query);
      const id = Number(match?.[1] ?? 0);
      return { results: this.accounts.filter((row) => row.id === id) as T[] };
    }
    if (lower.includes("from orders")) {
      const id = Number(this.values[0] ?? 0);
      return { results: this.orders.filter((row) => row.id === id) as T[] };
    }
    return { results: [] };
  }
}

class FakeD1 {
  readonly prepared: string[] = [];
  private readonly accounts: AccountRow[] = [
    { id: 1, display_name: "Synthetic Alder", plan: "demo" },
    { id: 2, display_name: "Synthetic Cypress", plan: "demo" },
  ];
  private readonly orders: OrderRow[] = [
    { id: 1, item: "Synthetic Widget", status: "ready" },
    { id: 2, item: "Synthetic Service", status: "queued" },
  ];

  prepare(query: string): FakeStatement {
    this.prepared.push(query);
    return new FakeStatement(query, this.accounts, this.orders);
  }
}

const assetFetcher = {
  async fetch(request: Request): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/") {
      return new Response(
        "<!doctype html><title>Harbor Service Console</title>",
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }
    return new Response("missing", { status: 404 });
  },
};

function env(db = new FakeD1()): Bindings {
  return { DB: db, ASSETS: assetFetcher };
}

describe("one-shot DAST benchmark", () => {
  it("D01 reflects query HTML while S01 encodes its sibling", async () => {
    const payload = "<img src=x onerror=alert(1)>";
    const vulnerable = await app.request(
      `/search?q=${encodeURIComponent(payload)}`,
      {},
      env(),
    );
    expect(await vulnerable.text()).toContain(payload);

    const safe = await app.request(
      `/catalog?q=${encodeURIComponent(payload)}`,
      {},
      env(),
    );
    const safeText = await safe.text();
    expect(safeText).not.toContain(payload);
    expect(safeText).toContain("&lt;img");
  });

  it("D02 allows read-only predicate injection while destructive SQL is rejected", async () => {
    const db = new FakeD1();
    const injected = await app.request(
      "/api/accounts?id=1%20OR%201=1",
      {},
      env(db),
    );
    expect(injected.status).toBe(200);
    expect(((await injected.json()) as { rows: unknown[] }).rows).toHaveLength(
      2,
    );
    expect(db.prepared.at(-1)?.toLowerCase()).toContain("select");

    const destructive = await app.request(
      "/api/accounts?id=1%3BDROP%20TABLE%20accounts",
      {},
      env(db),
    );
    expect(destructive.status).toBe(400);
    expect(db.prepared.some((query) => /drop/i.test(query))).toBe(false);
  });

  it("S02 uses a bound D1 query", async () => {
    const db = new FakeD1();
    const response = await app.request(
      "/api/orders?id=1%20OR%201=1",
      {},
      env(db),
    );
    expect(response.status).toBe(200);
    expect(((await response.json()) as { rows: unknown[] }).rows).toHaveLength(
      0,
    );
    expect(db.prepared.at(-1)).toContain("WHERE id = ?");
  });

  it("D03 reflects arbitrary CORS origins while S03 stays constrained", async () => {
    const attacker = "https://attacker.invalid";
    const vulnerable = await app.request(
      "/api/profile",
      { headers: { Origin: attacker } },
      env(),
    );
    expect(vulnerable.headers.get("access-control-allow-origin")).toBe(
      attacker,
    );
    expect(vulnerable.headers.get("access-control-allow-credentials")).toBe(
      "true",
    );

    const safe = await app.request(
      "/api/status",
      { headers: { Origin: attacker } },
      env(),
    );
    expect(safe.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("D04 accepts no-op unsafe methods while S04 rejects them", async () => {
    const vulnerable = await app.request(
      "/api/config",
      { method: "DELETE" },
      env(),
    );
    expect(vulnerable.status).toBe(200);
    expect((await vulnerable.json()) as object).toMatchObject({
      changed: false,
    });

    const safe = await app.request(
      "/api/preferences",
      { method: "DELETE" },
      env(),
    );
    expect(safe.status).toBe(405);
    expect(safe.headers.get("allow")).toBe("GET");
  });

  it("D05 and S05 expose structurally distinct postMessage handlers", async () => {
    const vulnerable = await app.request("/embed", {}, env());
    expect(await vulnerable.text()).toContain(
      ".innerHTML = String(event.data)",
    );

    const safe = await app.request("/widget", {}, env());
    const safeBody = await safe.text();
    expect(safeBody).toContain("event.origin !== window.location.origin");
    expect(safeBody).toContain(".textContent = String(event.data)");
  });

  it("D06-D13 discovery surfaces are present without write behavior", async () => {
    expect((await app.request("/admin", {}, env())).status).toBe(200);
    expect(await (await app.request("/.git/HEAD", {}, env())).text()).toContain(
      "synthetic-proof",
    );

    const openapi = (await (
      await app.request("/openapi.json", {}, env())
    ).json()) as {
      paths: Record<string, unknown>;
    };
    expect(openapi.paths["/api/accounts"]).toBeDefined();
    expect(openapi.paths["/api/runtime"]).toBeUndefined();

    const runtime = await app.request("/api/runtime?debug=1", {}, env());
    expect((await runtime.json()) as object).toMatchObject({ debug: true });

    const jwt = (await (
      await app.request("/api/session-info", {}, env())
    ).json()) as {
      token: string;
    };
    expect(jwt.token.split(".")).toHaveLength(3);

    const exported = await app.request("/api/export", {}, env());
    expect((await exported.json()) as object).toMatchObject({
      accountNumber: "TEST-0001",
    });
  });

  it("D13 allows GraphQL introspection while S07 blocks it", async () => {
    const query = "{ __schema { mutationType { name } } }";
    const vulnerable = await app.request(
      "/graphql",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      },
      env(),
    );
    expect(vulnerable.status).toBe(200);
    expect(JSON.stringify(await vulnerable.json())).toContain("Mutation");

    const safe = await app.request(
      "/graphql-internal",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      },
      env(),
    );
    expect(safe.status).toBe(403);
  });

  it("D14 synthetic session gates private routes and S06 protected API", async () => {
    const denied = await app.request("/private", {}, env());
    expect(denied.status).toBe(401);

    const start = await app.request("/session/start", {}, env());
    expect(start.status).toBe(302);
    const cookie = start.headers.get("set-cookie");
    expect(cookie).toContain("proof_session=");

    const allowed = await app.request(
      "/private",
      { headers: { Cookie: cookie?.split(";")[0] ?? "" } },
      env(),
    );
    expect(allowed.status).toBe(200);

    const protectedApi = await app.request("/api/account", {}, env());
    expect(protectedApi.status).toBe(401);
  });

  it("O01 intentionally omits CSP but keeps other baseline headers", async () => {
    const response = await app.request("/catalog?q=test", {}, env());
    expect(response.headers.get("content-security-policy")).toBeNull();
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-robots-tag")).toBe(
      "noindex, nofollow, noarchive",
    );
  });

  it("O03 build source exposes harmless source-map inputs", async () => {
    const source = await readFile("src/browser.ts", "utf8");
    expect(source).toContain("/api/runtime?mode=summary");
    const index = await readFile("public/index.html", "utf8");
    expect(index).toContain("/assets/jquery-3.4.1.min.js");
    expect(index).toContain("/assets/app.js");
  });

  it("O05 accepts FormData and reflects proof-only form input", async () => {
    const form = new FormData();
    form.set("note", "<svg onload=alert(1)>");
    const response = await app.request(
      "/form",
      { method: "POST", body: form },
      env(),
    );
    expect(await response.text()).toContain("<svg onload=alert(1)>");
  });
});
