const I = (t, e) => e.some((n) => t instanceof n);
let x, M;
function F() {
  return x || (x = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function j() {
  return M || (M = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const E = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap(), w = /* @__PURE__ */ new WeakMap();
function _(t) {
  const e = new Promise((n, r) => {
    const o = () => {
      t.removeEventListener("success", s), t.removeEventListener("error", a);
    }, s = () => {
      n(f(t.result)), o();
    }, a = () => {
      r(t.error), o();
    };
    t.addEventListener("success", s), t.addEventListener("error", a);
  });
  return w.set(e, t), e;
}
function $(t) {
  if (E.has(t))
    return;
  const e = new Promise((n, r) => {
    const o = () => {
      t.removeEventListener("complete", s), t.removeEventListener("error", a), t.removeEventListener("abort", a);
    }, s = () => {
      n(), o();
    }, a = () => {
      r(t.error || new DOMException("AbortError", "AbortError")), o();
    };
    t.addEventListener("complete", s), t.addEventListener("error", a), t.addEventListener("abort", a);
  });
  E.set(t, e);
}
let b = {
  get(t, e, n) {
    if (t instanceof IDBTransaction) {
      if (e === "done")
        return E.get(t);
      if (e === "store")
        return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
    }
    return f(t[e]);
  },
  set(t, e, n) {
    return t[e] = n, !0;
  },
  has(t, e) {
    return t instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in t;
  }
};
function B(t) {
  b = t(b);
}
function K(t) {
  return j().includes(t) ? function(...e) {
    return t.apply(D(this), e), f(this.request);
  } : function(...e) {
    return f(t.apply(D(this), e));
  };
}
function q(t) {
  return typeof t == "function" ? K(t) : (t instanceof IDBTransaction && $(t), I(t, F()) ? new Proxy(t, b) : t);
}
function f(t) {
  if (t instanceof IDBRequest)
    return _(t);
  if (T.has(t))
    return T.get(t);
  const e = q(t);
  return e !== t && (T.set(t, e), w.set(e, t)), e;
}
const D = (t) => w.get(t);
function G(t, e, { blocked: n, upgrade: r, blocking: o, terminated: s } = {}) {
  const a = indexedDB.open(t, e), i = f(a);
  return r && a.addEventListener("upgradeneeded", (l) => {
    r(f(a.result), l.oldVersion, l.newVersion, f(a.transaction), l);
  }), n && a.addEventListener("blocked", (l) => n(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    l.oldVersion,
    l.newVersion,
    l
  )), i.then((l) => {
    s && l.addEventListener("close", () => s()), o && l.addEventListener("versionchange", (u) => o(u.oldVersion, u.newVersion, u));
  }).catch(() => {
  }), i;
}
const V = ["get", "getKey", "getAll", "getAllKeys", "count"], z = ["put", "add", "delete", "clear"], R = /* @__PURE__ */ new Map();
function P(t, e) {
  if (!(t instanceof IDBDatabase && !(e in t) && typeof e == "string"))
    return;
  if (R.get(e))
    return R.get(e);
  const n = e.replace(/FromIndex$/, ""), r = e !== n, o = z.includes(n);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(o || V.includes(n))
  )
    return;
  const s = async function(a, ...i) {
    const l = this.transaction(a, o ? "readwrite" : "readonly");
    let u = l.store;
    return r && (u = u.index(i.shift())), (await Promise.all([
      u[n](...i),
      o && l.done
    ]))[0];
  };
  return R.set(e, s), s;
}
B((t) => ({
  ...t,
  get: (e, n, r) => P(e, n) || t.get(e, n, r),
  has: (e, n) => !!P(e, n) || t.has(e, n)
}));
const H = ["continue", "continuePrimaryKey", "advance"], N = {}, S = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakMap(), Q = {
  get(t, e) {
    if (!H.includes(e))
      return t[e];
    let n = N[e];
    return n || (n = N[e] = function(...r) {
      S.set(this, L.get(this)[e](...r));
    }), n;
  }
};
async function* J(...t) {
  let e = this;
  if (e instanceof IDBCursor || (e = await e.openCursor(...t)), !e)
    return;
  e = e;
  const n = new Proxy(e, Q);
  for (L.set(n, e), w.set(n, D(e)); e; )
    yield n, e = await (S.get(n) || e.continue()), S.delete(n);
}
function v(t, e) {
  return e === Symbol.asyncIterator && I(t, [IDBIndex, IDBObjectStore, IDBCursor]) || e === "iterate" && I(t, [IDBIndex, IDBObjectStore]);
}
B((t) => ({
  ...t,
  get(e, n, r) {
    return v(e, n) ? J : t.get(e, n, r);
  },
  has(e, n) {
    return v(e, n) || t.has(e, n);
  }
}));
let p = "asset-security";
const h = {
  // Domains that require authentication - MUST be configured by the application
  protectedDomains: [],
  // Asset patterns that need protection - MUST be configured by the application
  // These are examples and should be customized for your use case
  assetPatterns: {
    customAssets: /\.(?:jpg|jpeg|png|gif|svg|pdf|geojson|gltf|glb|kml|czml)$/i,
    mvtTiles: /\.mvt$/i,
    rasterTiles: /\/tiles\/[^/]+\/\d+\/\d+\/\d+/,
    generalAssets: /\.(jpg|jpeg|png|gif|svg|pdf|geojson|gltf|glb|kml|czml)$/i
  },
  // Token management configuration
  token: {
    memoryCacheTTL: 5 * 60 * 1e3,
    // 5 minutes
    indexedDBName: "",
    // Will be set dynamically based on namespace
    indexedDBStore: "tokens",
    refreshThreshold: 60 * 1e3
    // Refresh if less than 1 minute remaining
  },
  // API endpoints - proxyEndpoint MUST be configured by the application
  api: {
    tokenEndpoint: "/api/auth/token",
    refreshEndpoint: "/api/auth/refresh",
    proxyEndpoint: ""
    // REQUIRED: Must be set via config
  },
  // Cache settings
  cache: {
    name: "",
    // Will be set dynamically based on namespace
    maxAge: 3600,
    // 1 hour in seconds
    strategies: {
      images: "cache-first",
      tiles: "network-first",
      documents: "network-only"
    }
  }
};
let c = { ...h };
function C(t) {
  var e;
  t.namespace && (p = t.namespace), c = {
    ...h,
    ...t,
    token: {
      ...h.token,
      ...t.token,
      indexedDBName: `${p}-auth`
    },
    cache: {
      ...h.cache,
      ...t.cache,
      name: `${p}-v1`,
      strategies: {
        ...h.cache.strategies,
        ...(e = t.cache) == null ? void 0 : e.strategies
      }
    },
    protectedDomains: t.protectedDomains || h.protectedDomains,
    assetPatterns: {
      ...h.assetPatterns,
      ...t.assetPatterns
    },
    extractAssetId: t.extractAssetId
  }, c.protectedDomains.length === 0 && console.warn("[ServiceWorker] Warning: No protected domains configured. Authentication will not be applied."), c.api.proxyEndpoint || console.warn("[ServiceWorker] Warning: No proxy endpoint configured. Signed URL functionality will not work."), console.log(`[ServiceWorker] Configuration updated with namespace: ${p}`, c);
}
function g() {
  return c.cache.name || `${p}-v1`;
}
function W() {
  return c.token.indexedDBName || `${p}-auth`;
}
C({});
function U(t) {
  const e = typeof t == "string" ? new URL(t) : t;
  return c.protectedDomains.some((n) => n.includes(":") ? e.host === n : e.hostname === n || e.hostname.includes(n));
}
function y(t) {
  var r;
  const n = (typeof t == "string" ? new URL(t) : t).pathname;
  if (c.assetPatterns.mvtTiles.test(n) || c.assetPatterns.rasterTiles.test(n))
    return "tile";
  if (c.assetPatterns.customAssets.test(n))
    return "asset";
  if (c.assetPatterns.generalAssets.test(n)) {
    const o = (r = n.split(".").pop()) == null ? void 0 : r.toLowerCase();
    return o && ["jpg", "jpeg", "png", "gif", "svg"].includes(o) ? "image" : "document";
  }
  return "unknown";
}
function A(t) {
  const e = typeof t == "string" ? new URL(t) : t;
  if (c.extractAssetId)
    return c.extractAssetId(e);
  const n = e.pathname, r = n.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
  if (r)
    return r[1];
  const o = n.match(/\/([0-9a-fA-F-]{20,})\//);
  return o ? o[1] : null;
}
function O(t) {
  switch (t) {
    case "image":
      return c.cache.strategies.images;
    case "tile":
      return c.cache.strategies.tiles;
    case "document":
      return c.cache.strategies.documents;
    default:
      return "network-first";
  }
}
function k(t) {
  const e = new URL(t.url), n = e.origin + e.pathname;
  return new Request(n, {
    method: t.method,
    headers: {
      Accept: t.headers.get("Accept") || "*/*",
      "Content-Type": t.headers.get("Content-Type") || ""
    }
  });
}
const X = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CONFIG() {
    return c;
  },
  extractAssetUUID: A,
  getAssetType: y,
  getCacheKey: k,
  getCacheName: g,
  getCacheStrategy: O,
  getIndexedDBName: W,
  isProtectedDomain: U,
  updateConfig: C
}, Symbol.toStringTag, { value: "Module" }));
class Y {
  constructor() {
    this.memoryCache = null, this.db = null, this.dbPromise = null;
  }
  /**
   * Initialize IndexedDB connection
   */
  async initDB() {
    this.dbPromise || (this.dbPromise = G(W(), 1, {
      upgrade(e) {
        e.objectStoreNames.contains("tokens") || e.createObjectStore("tokens");
      }
    }), this.db = await this.dbPromise);
  }
  /**
   * Get token following the hierarchy: Memory -> IndexedDB -> Fresh request
   */
  async getToken() {
    if (console.log("[TokenManager] Getting token..."), this.memoryCache && !this.isTokenExpired(this.memoryCache))
      return console.log("[TokenManager] Token found in memory cache"), this.memoryCache.token;
    try {
      await this.initDB();
      const e = await this.db.get("tokens", "current");
      if (e && !this.isTokenExpired(e))
        return console.log("[TokenManager] Token found in IndexedDB"), this.memoryCache = e, e.token;
      if (e && this.shouldRefresh(e))
        return console.log("[TokenManager] Token needs refresh"), await this.refreshToken();
    } catch (e) {
      console.error("[TokenManager] Error accessing IndexedDB:", e);
    }
    return console.log("[TokenManager] Requesting fresh token from main thread"), await this.requestFreshToken();
  }
  /**
   * Store token in both memory and IndexedDB
   */
  async setToken(e) {
    const n = {
      token: e.access_token,
      expiry: e.expires_at,
      refreshToken: e.refresh_token
    };
    this.memoryCache = n;
    try {
      await this.initDB(), await this.db.put("tokens", n, "current"), console.log("[TokenManager] Token stored successfully");
    } catch (r) {
      console.error("[TokenManager] Error storing token:", r);
    }
  }
  /**
   * Refresh token using refresh token
   */
  async refreshToken() {
    var e;
    console.log("[TokenManager] Refreshing token...");
    try {
      const n = this.memoryCache || await ((e = this.db) == null ? void 0 : e.get("tokens", "current"));
      if (!(n != null && n.refreshToken))
        return console.log("[TokenManager] No refresh token available"), await this.requestFreshToken();
      const r = await self.clients.matchAll();
      return r.length === 0 ? (console.log("[TokenManager] No clients available for token refresh"), null) : new Promise((o) => {
        const s = new MessageChannel();
        s.port1.onmessage = async (a) => {
          a.data.type === "TOKEN_REFRESHED" && a.data.token ? (await this.setToken(a.data.token), o(a.data.token.access_token)) : o(null);
        }, r[0].postMessage(
          {
            type: "REFRESH_TOKEN",
            refreshToken: n.refreshToken
          },
          [s.port2]
        ), setTimeout(() => o(null), 5e3);
      });
    } catch (n) {
      return console.error("[TokenManager] Error refreshing token:", n), null;
    }
  }
  /**
   * Clear all stored tokens
   */
  async clearToken() {
    this.memoryCache = null;
    try {
      await this.initDB(), await this.db.delete("tokens", "current"), console.log("[TokenManager] Tokens cleared");
    } catch (e) {
      console.error("[TokenManager] Error clearing tokens:", e);
    }
  }
  /**
   * Check if token is expired
   */
  isTokenExpired(e) {
    return e ? Date.now() >= e.expiry : !0;
  }
  /**
   * Check if token should be refreshed (approaching expiry)
   */
  shouldRefresh(e) {
    const n = Date.now();
    return e.expiry - n <= c.token.refreshThreshold;
  }
  /**
   * Request fresh token from main thread
   */
  async requestFreshToken() {
    try {
      const e = await self.clients.matchAll();
      return e.length === 0 ? (console.log("[TokenManager] No clients available"), null) : new Promise((n) => {
        const r = new MessageChannel();
        r.port1.onmessage = async (o) => {
          o.data.type === "TOKEN_PROVIDED" && o.data.token ? (await this.setToken(o.data.token), n(o.data.token.access_token)) : n(null);
        }, e[0].postMessage(
          { type: "REQUEST_TOKEN" },
          [r.port2]
        ), setTimeout(() => {
          console.log("[TokenManager] Token request timeout"), n(null);
        }, 5e3);
      });
    } catch (e) {
      return console.error("[TokenManager] Error requesting fresh token:", e), null;
    }
  }
}
const d = new Y();
class Z {
  /**
   * Determine if a request should be intercepted
   */
  shouldIntercept(e) {
    const n = new URL(e.url);
    return !U(n) || e.method !== "GET" ? !1 : y(n) !== "unknown";
  }
  /**
   * Add authentication header to request
   */
  addAuthentication(e, n) {
    const r = new Headers(e.headers);
    return r.set("Authorization", `Bearer ${n}`), console.log("[RequestInterceptor] Adding Authorization header:", `Bearer ${n.substring(0, 20)}...`), new Request(e.url, {
      method: e.method,
      headers: r,
      body: e.body,
      mode: "cors",
      // Force CORS mode to allow custom headers
      credentials: "include",
      // Important for CORS
      cache: e.cache,
      redirect: e.redirect,
      referrer: e.referrer,
      referrerPolicy: e.referrerPolicy,
      integrity: e.integrity
    });
  }
  /**
   * Handle authentication errors (401/403)
   */
  async handleAuthError(e) {
    console.log("[RequestInterceptor] Handling auth error, attempting token refresh...");
    const n = await d.refreshToken();
    if (!n)
      return console.log("[RequestInterceptor] Token refresh failed"), new Response("Authentication failed", {
        status: 401,
        statusText: "Unauthorized",
        headers: {
          "Content-Type": "text/plain"
        }
      });
    console.log("[RequestInterceptor] Retrying request with refreshed token");
    const r = this.addAuthentication(e, n);
    try {
      const o = await fetch(r);
      return o.status === 401 || o.status === 403 ? (await d.clearToken(), new Response("Authentication failed after refresh", {
        status: 401,
        statusText: "Unauthorized"
      })) : o;
    } catch (o) {
      return console.error("[RequestInterceptor] Error retrying request:", o), new Response("Network error", {
        status: 503,
        statusText: "Service Unavailable"
      });
    }
  }
  /**
   * Process intercepted request
   */
  async processRequest(e) {
    const n = new URL(e.url), r = y(n), o = A(n);
    console.log(`[RequestInterceptor] Processing ${r} request:`, {
      url: n.pathname,
      assetId: o,
      assetType: r
    });
    const s = await d.getToken();
    if (!s)
      return console.log("[RequestInterceptor] No token available"), fetch(e);
    const a = this.addAuthentication(e, s);
    try {
      const i = await fetch(a);
      return i.status === 401 || i.status === 403 ? await this.handleAuthError(e) : (i.ok, i);
    } catch (i) {
      console.error("[RequestInterceptor] Network error:", i);
      const u = await (await caches.open(g())).match(e);
      if (u)
        return console.log("[RequestInterceptor] Returning cached response"), u;
      throw i;
    }
  }
  /**
   * Handle tile requests with special prefix-based authentication
   */
  async processTileRequest(e) {
    const n = new URL(e.url), r = A(n);
    if (!r)
      return fetch(e);
    console.log("[RequestInterceptor] Processing tile request:", {
      url: n.pathname,
      assetId: r
    });
    const o = await d.getToken();
    if (!o)
      return console.log("[RequestInterceptor] No token for tile request"), fetch(e);
    const s = await this.getSignedUrl(r, o);
    if (s != null && s.url) {
      const a = new Request(s.url, {
        method: e.method,
        headers: e.headers,
        mode: "cors",
        credentials: "omit"
        // Don't send credentials with signed URL
      });
      return fetch(a);
    }
    return this.processRequest(e);
  }
  /**
   * Get signed URL from proxy service
   * Note: This requires CONFIG.api.proxyEndpoint to be set
   */
  async getSignedUrl(e, n) {
    try {
      const { CONFIG: r } = await Promise.resolve().then(() => X), o = r.api.proxyEndpoint;
      if (!o)
        return console.error("[RequestInterceptor] Proxy endpoint not configured"), null;
      const s = await fetch(`${o}/api/signed-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${n}`
        },
        body: JSON.stringify({
          assetId: e,
          prefix: !0,
          // Enable prefix support for tiles
          expiry: 900
          // 15 minutes
        })
      });
      return s.ok ? await s.json() : (console.error("[RequestInterceptor] Failed to get signed URL"), null);
    } catch (r) {
      return console.error("[RequestInterceptor] Error getting signed URL:", r), null;
    }
  }
}
const m = new Z();
self.addEventListener("install", (t) => {
  console.log("[ServiceWorker] Installing..."), self.skipWaiting();
});
self.addEventListener("activate", (t) => {
  console.log("[ServiceWorker] Activating..."), t.waitUntil(
    (async () => {
      const e = g(), n = await caches.keys();
      await Promise.all(
        n.filter((r) => r !== e).map((r) => caches.delete(r))
      ), await self.clients.claim(), console.log("[ServiceWorker] Active and controlling all clients");
    })()
  );
});
self.addEventListener("fetch", (t) => {
  const e = t.request;
  if (e.method !== "GET") {
    t.respondWith(fetch(e));
    return;
  }
  if (!m.shouldIntercept(e)) {
    t.respondWith(fetch(e));
    return;
  }
  t.respondWith(ee(e));
});
async function ee(t) {
  const e = new URL(t.url), n = y(e), r = O(n);
  switch (console.log(`[ServiceWorker] Handling ${n} with ${r} strategy:`, e.pathname), r) {
    case "cache-first":
      return te(t);
    case "network-first":
      return ne(t);
    case "cache-only":
      return re(t);
    case "network-only":
    default:
      return oe(t);
  }
}
async function te(t) {
  const e = await caches.open(g()), n = k(t), r = await e.match(n);
  if (r)
    return console.log("[ServiceWorker] Cache hit:", t.url), se(t, e), r;
  console.log("[ServiceWorker] Cache miss, fetching:", t.url);
  try {
    const o = await m.processRequest(t);
    if (o.ok) {
      const s = o.clone();
      e.put(n, s);
    }
    return o;
  } catch (o) {
    return console.error("[ServiceWorker] Network error:", o), new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}
async function ne(t) {
  const e = await caches.open(g()), n = k(t);
  try {
    const r = await m.processRequest(t);
    if (r.ok) {
      const o = r.clone();
      e.put(n, o);
    }
    return r;
  } catch (r) {
    console.error("[ServiceWorker] Network error, trying cache:", r);
    const o = await e.match(n);
    return o ? (console.log("[ServiceWorker] Returning cached response"), o) : new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}
async function re(t) {
  const e = await caches.open(g()), n = k(t), r = await e.match(n);
  return r || new Response("Not in cache", {
    status: 404,
    statusText: "Not Found"
  });
}
async function oe(t) {
  try {
    return await m.processRequest(t);
  } catch (e) {
    return console.error("[ServiceWorker] Network error:", e), new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}
async function se(t, e) {
  try {
    const n = await m.processRequest(t);
    if (n.ok) {
      const r = k(t);
      await e.put(r, n), console.log("[ServiceWorker] Cache refreshed:", t.url);
    }
  } catch (n) {
    console.debug("[ServiceWorker] Background refresh failed:", n);
  }
}
self.addEventListener("message", async (t) => {
  var n, r, o, s, a;
  const e = t.data;
  switch (console.log("[ServiceWorker] Received message:", e.type), e.type) {
    case "CONFIG":
      e.payload && (C(e.payload), (n = t.ports[0]) == null || n.postMessage({ success: !0 }));
      break;
    case "UPDATE_TOKEN":
      (r = e.payload) != null && r.token && (await d.setToken(e.payload.token), (o = t.ports[0]) == null || o.postMessage({ success: !0 }));
      break;
    case "REQUEST_TOKEN":
      break;
    case "CLEAR_CACHE":
      await ae(), (s = t.ports[0]) == null || s.postMessage({ success: !0 });
      break;
    case "GET_STATUS":
      const i = await ce();
      (a = t.ports[0]) == null || a.postMessage(i);
      break;
    default:
      console.warn("[ServiceWorker] Unknown message type:", e.type);
  }
});
async function ae() {
  const t = await caches.keys();
  await Promise.all(t.map((e) => caches.delete(e))), await d.clearToken(), console.log("[ServiceWorker] All caches cleared");
}
async function ce() {
  const t = await caches.keys(), n = await (await caches.open(g())).keys();
  return {
    version: "1.0.0",
    caches: t,
    cachedRequests: n.length,
    hasToken: !!await d.getToken()
  };
}
console.log("[ServiceWorker] Script loaded, waiting for events...");
//# sourceMappingURL=sw.js.map
