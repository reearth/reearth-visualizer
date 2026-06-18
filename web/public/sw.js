const C = (t, e) => e.some((n) => t instanceof n);
let v, B;
function q() {
  return v || (v = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function G() {
  return B || (B = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const S = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap(), I = /* @__PURE__ */ new WeakMap();
function V(t) {
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("success", o), t.removeEventListener("error", c);
    }, o = () => {
      n(g(t.result)), s();
    }, c = () => {
      r(t.error), s();
    };
    t.addEventListener("success", o), t.addEventListener("error", c);
  });
  return I.set(e, t), e;
}
function z(t) {
  if (S.has(t))
    return;
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("complete", o), t.removeEventListener("error", c), t.removeEventListener("abort", c);
    }, o = () => {
      n(), s();
    }, c = () => {
      r(t.error || new DOMException("AbortError", "AbortError")), s();
    };
    t.addEventListener("complete", o), t.addEventListener("error", c), t.addEventListener("abort", c);
  });
  S.set(t, e);
}
let A = {
  get(t, e, n) {
    if (t instanceof IDBTransaction) {
      if (e === "done")
        return S.get(t);
      if (e === "store")
        return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
    }
    return g(t[e]);
  },
  set(t, e, n) {
    return t[e] = n, !0;
  },
  has(t, e) {
    return t instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in t;
  }
};
function O(t) {
  A = t(A);
}
function H(t) {
  return G().includes(t) ? function(...e) {
    return t.apply(x(this), e), g(this.request);
  } : function(...e) {
    return g(t.apply(x(this), e));
  };
}
function Q(t) {
  return typeof t == "function" ? H(t) : (t instanceof IDBTransaction && z(t), C(t, q()) ? new Proxy(t, A) : t);
}
function g(t) {
  if (t instanceof IDBRequest)
    return V(t);
  if (R.has(t))
    return R.get(t);
  const e = Q(t);
  return e !== t && (R.set(t, e), I.set(e, t)), e;
}
const x = (t) => I.get(t);
function J(t, e, { blocked: n, upgrade: r, blocking: s, terminated: o } = {}) {
  const c = indexedDB.open(t, e), u = g(c);
  return r && c.addEventListener("upgradeneeded", (h) => {
    r(g(c.result), h.oldVersion, h.newVersion, g(c.transaction), h);
  }), n && c.addEventListener("blocked", (h) => n(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    h.oldVersion,
    h.newVersion,
    h
  )), u.then((h) => {
    o && h.addEventListener("close", () => o()), s && h.addEventListener("versionchange", (l) => s(l.oldVersion, l.newVersion, l));
  }).catch(() => {
  }), u;
}
const X = ["get", "getKey", "getAll", "getAllKeys", "count"], Y = ["put", "add", "delete", "clear"], D = /* @__PURE__ */ new Map();
function L(t, e) {
  if (!(t instanceof IDBDatabase && !(e in t) && typeof e == "string"))
    return;
  if (D.get(e))
    return D.get(e);
  const n = e.replace(/FromIndex$/, ""), r = e !== n, s = Y.includes(n);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(s || X.includes(n))
  )
    return;
  const o = async function(c, ...u) {
    const h = this.transaction(c, s ? "readwrite" : "readonly");
    let l = h.store;
    return r && (l = l.index(u.shift())), (await Promise.all([
      l[n](...u),
      s && h.done
    ]))[0];
  };
  return D.set(e, o), o;
}
O((t) => ({
  ...t,
  get: (e, n, r) => L(e, n) || t.get(e, n, r),
  has: (e, n) => !!L(e, n) || t.has(e, n)
}));
const Z = ["continue", "continuePrimaryKey", "advance"], W = {}, M = /* @__PURE__ */ new WeakMap(), F = /* @__PURE__ */ new WeakMap(), ee = {
  get(t, e) {
    if (!Z.includes(e))
      return t[e];
    let n = W[e];
    return n || (n = W[e] = function(...r) {
      M.set(this, F.get(this)[e](...r));
    }), n;
  }
};
async function* te(...t) {
  let e = this;
  if (e instanceof IDBCursor || (e = await e.openCursor(...t)), !e)
    return;
  e = e;
  const n = new Proxy(e, ee);
  for (F.set(n, e), I.set(n, x(e)); e; )
    yield n, e = await (M.get(n) || e.continue()), M.delete(n);
}
function U(t, e) {
  return e === Symbol.asyncIterator && C(t, [IDBIndex, IDBObjectStore, IDBCursor]) || e === "iterate" && C(t, [IDBIndex, IDBObjectStore]);
}
O((t) => ({
  ...t,
  get(e, n, r) {
    return U(e, n) ? te : t.get(e, n, r);
  },
  has(e, n) {
    return U(e, n) || t.has(e, n);
  }
}));
let m = "asset-security";
const f = {
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
  },
  // Debug logging is disabled by default for production consumers
  debug: !1
};
let i = { ...f };
function P(t) {
  var e;
  t.namespace && (m = t.namespace), i = {
    ...f,
    ...t,
    token: {
      ...f.token,
      ...t.token,
      indexedDBName: `${m}-auth`
    },
    cache: {
      ...f.cache,
      ...t.cache,
      name: `${m}-v1`,
      strategies: {
        ...f.cache.strategies,
        ...(e = t.cache) == null ? void 0 : e.strategies
      }
    },
    protectedDomains: t.protectedDomains || f.protectedDomains,
    assetPatterns: {
      ...f.assetPatterns,
      ...t.assetPatterns
    },
    extractAssetId: t.extractAssetId
  }, i.protectedDomains.length === 0 && b("[ServiceWorker] Warning: No protected domains configured. Authentication will not be applied."), i.api.proxyEndpoint || b("[ServiceWorker] Warning: No proxy endpoint configured. Signed URL functionality will not work."), a(`[ServiceWorker] Configuration updated with namespace: ${m}`, i);
}
function y() {
  return !!i.debug;
}
function a(...t) {
  y() && console.log(...t);
}
function j(...t) {
  y() && console.debug(...t);
}
function b(...t) {
  y() && console.warn(...t);
}
function d(...t) {
  y() && console.error(...t);
}
function k() {
  return i.cache.name || `${m}-v1`;
}
function _() {
  return i.token.indexedDBName || `${m}-auth`;
}
P({});
function $(t) {
  const e = typeof t == "string" ? new URL(t) : t;
  return i.protectedDomains.some((n) => n.includes(":") ? e.host === n : e.hostname === n || e.hostname.includes(n));
}
function E(t) {
  var r;
  const n = (typeof t == "string" ? new URL(t) : t).pathname;
  if (i.assetPatterns.mvtTiles.test(n) || i.assetPatterns.rasterTiles.test(n))
    return "tile";
  if (i.assetPatterns.customAssets.test(n))
    return "asset";
  if (i.assetPatterns.generalAssets.test(n)) {
    const s = (r = n.split(".").pop()) == null ? void 0 : r.toLowerCase();
    return s && ["jpg", "jpeg", "png", "gif", "svg"].includes(s) ? "image" : "document";
  }
  return "unknown";
}
function N(t) {
  const e = typeof t == "string" ? new URL(t) : t;
  if (i.extractAssetId)
    return i.extractAssetId(e);
  const n = e.pathname, r = n.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
  if (r)
    return r[1];
  const s = n.match(/\/([0-9a-fA-F-]{20,})\//);
  return s ? s[1] : null;
}
function K(t) {
  switch (t) {
    case "image":
      return i.cache.strategies.images;
    case "tile":
      return i.cache.strategies.tiles;
    case "document":
      return i.cache.strategies.documents;
    default:
      return "network-first";
  }
}
function w(t) {
  const e = new URL(t.url), n = e.origin + e.pathname;
  return new Request(n, {
    method: t.method,
    headers: {
      Accept: t.headers.get("Accept") || "*/*",
      "Content-Type": t.headers.get("Content-Type") || ""
    }
  });
}
const ne = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CONFIG() {
    return i;
  },
  debugDebug: j,
  debugError: d,
  debugLog: a,
  debugWarn: b,
  extractAssetUUID: N,
  getAssetType: E,
  getCacheKey: w,
  getCacheName: k,
  getCacheStrategy: K,
  getIndexedDBName: _,
  isDebugEnabled: y,
  isProtectedDomain: $,
  updateConfig: P
}, Symbol.toStringTag, { value: "Module" }));
class re {
  constructor() {
    this.memoryCache = null, this.db = null, this.dbPromise = null;
  }
  /**
   * Initialize IndexedDB connection
   */
  async initDB() {
    this.dbPromise || (this.dbPromise = J(_(), 1, {
      upgrade(e) {
        e.objectStoreNames.contains("tokens") || e.createObjectStore("tokens");
      }
    }), this.db = await this.dbPromise);
  }
  /**
   * Get token following the hierarchy: Memory -> IndexedDB -> Fresh request
   */
  async getToken() {
    if (a("[TokenManager] Getting token..."), this.memoryCache && !this.isTokenExpired(this.memoryCache))
      return a("[TokenManager] Token found in memory cache"), this.memoryCache.token;
    try {
      await this.initDB();
      const e = await this.db.get("tokens", "current");
      if (e && !this.isTokenExpired(e))
        return a("[TokenManager] Token found in IndexedDB"), this.memoryCache = e, e.token;
      if (e && this.shouldRefresh(e))
        return a("[TokenManager] Token needs refresh"), await this.refreshToken();
    } catch (e) {
      d("[TokenManager] Error accessing IndexedDB:", e);
    }
    return a("[TokenManager] Requesting fresh token from main thread"), await this.requestFreshToken();
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
      await this.initDB(), await this.db.put("tokens", n, "current"), a("[TokenManager] Token stored successfully");
    } catch (r) {
      d("[TokenManager] Error storing token:", r);
    }
  }
  /**
   * Refresh token using refresh token
   */
  async refreshToken() {
    var e;
    a("[TokenManager] Refreshing token...");
    try {
      const n = this.memoryCache || await ((e = this.db) == null ? void 0 : e.get("tokens", "current"));
      if (!(n != null && n.refreshToken))
        return a("[TokenManager] No refresh token available"), await this.requestFreshToken();
      const r = await self.clients.matchAll();
      return r.length === 0 ? (a("[TokenManager] No clients available for token refresh"), null) : new Promise((s) => {
        const o = new MessageChannel();
        o.port1.onmessage = async (c) => {
          c.data.type === "TOKEN_REFRESHED" && c.data.token ? (await this.setToken(c.data.token), s(c.data.token.access_token)) : s(null);
        }, r[0].postMessage(
          {
            type: "REFRESH_TOKEN",
            refreshToken: n.refreshToken
          },
          [o.port2]
        ), setTimeout(() => s(null), 5e3);
      });
    } catch (n) {
      return d("[TokenManager] Error refreshing token:", n), null;
    }
  }
  /**
   * Clear all stored tokens
   */
  async clearToken() {
    this.memoryCache = null;
    try {
      await this.initDB(), await this.db.delete("tokens", "current"), a("[TokenManager] Tokens cleared");
    } catch (e) {
      d("[TokenManager] Error clearing tokens:", e);
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
    return e.expiry - n <= i.token.refreshThreshold;
  }
  /**
   * Request fresh token from main thread
   */
  async requestFreshToken() {
    try {
      const e = await self.clients.matchAll();
      return e.length === 0 ? (a("[TokenManager] No clients available"), null) : new Promise((n) => {
        const r = new MessageChannel();
        r.port1.onmessage = async (s) => {
          s.data.type === "TOKEN_PROVIDED" && s.data.token ? (await this.setToken(s.data.token), n(s.data.token.access_token)) : n(null);
        }, e[0].postMessage(
          { type: "REQUEST_TOKEN" },
          [r.port2]
        ), setTimeout(() => {
          a("[TokenManager] Token request timeout"), n(null);
        }, 5e3);
      });
    } catch (e) {
      return d("[TokenManager] Error requesting fresh token:", e), null;
    }
  }
}
const p = new re();
class se {
  /**
   * Determine if a request should be intercepted
   */
  shouldIntercept(e) {
    const n = new URL(e.url);
    return !$(n) || e.method !== "GET" ? !1 : E(n) !== "unknown";
  }
  /**
   * Add authentication header to request
   */
  addAuthentication(e, n) {
    const r = new Headers(e.headers);
    return r.set("Authorization", `Bearer ${n}`), a("[RequestInterceptor] Adding Authorization header:", `Bearer ${n.substring(0, 20)}...`), new Request(e.url, {
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
    a("[RequestInterceptor] Handling auth error, attempting token refresh...");
    const n = await p.refreshToken();
    if (!n)
      return a("[RequestInterceptor] Token refresh failed"), new Response("Authentication failed", {
        status: 401,
        statusText: "Unauthorized",
        headers: {
          "Content-Type": "text/plain"
        }
      });
    a("[RequestInterceptor] Retrying request with refreshed token");
    const r = this.addAuthentication(e, n);
    try {
      const s = await fetch(r);
      return s.status === 401 || s.status === 403 ? (await p.clearToken(), new Response("Authentication failed after refresh", {
        status: 401,
        statusText: "Unauthorized"
      })) : s;
    } catch (s) {
      return d("[RequestInterceptor] Error retrying request:", s), new Response("Network error", {
        status: 503,
        statusText: "Service Unavailable"
      });
    }
  }
  /**
   * Process intercepted request
   */
  async processRequest(e) {
    const n = new URL(e.url), r = E(n), s = N(n);
    a(`[RequestInterceptor] Processing ${r} request:`, {
      url: n.pathname,
      assetId: s,
      assetType: r
    });
    const o = await p.getToken();
    if (!o)
      return a("[RequestInterceptor] No token available"), fetch(e);
    const c = this.addAuthentication(e, o);
    try {
      const u = await fetch(c);
      return u.status === 401 || u.status === 403 ? await this.handleAuthError(e) : (u.ok, u);
    } catch (u) {
      d("[RequestInterceptor] Network error:", u);
      const l = await (await caches.open(k())).match(e);
      if (l)
        return a("[RequestInterceptor] Returning cached response"), l;
      throw u;
    }
  }
  /**
   * Handle tile requests with special prefix-based authentication
   */
  async processTileRequest(e) {
    const n = new URL(e.url), r = N(n);
    if (!r)
      return fetch(e);
    a("[RequestInterceptor] Processing tile request:", {
      url: n.pathname,
      assetId: r
    });
    const s = await p.getToken();
    if (!s)
      return a("[RequestInterceptor] No token for tile request"), fetch(e);
    const o = await this.getSignedUrl(r, s);
    if (o != null && o.url) {
      const c = new Request(o.url, {
        method: e.method,
        headers: e.headers,
        mode: "cors",
        credentials: "omit"
        // Don't send credentials with signed URL
      });
      return fetch(c);
    }
    return this.processRequest(e);
  }
  /**
   * Get signed URL from proxy service
   * Note: This requires CONFIG.api.proxyEndpoint to be set
   */
  async getSignedUrl(e, n) {
    try {
      const { CONFIG: r } = await Promise.resolve().then(() => ne), s = r.api.proxyEndpoint;
      if (!s)
        return d("[RequestInterceptor] Proxy endpoint not configured"), null;
      const o = await fetch(`${s}/api/signed-url`, {
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
      return o.ok ? await o.json() : (d("[RequestInterceptor] Failed to get signed URL"), null);
    } catch (r) {
      return d("[RequestInterceptor] Error getting signed URL:", r), null;
    }
  }
}
const T = new se();
self.addEventListener("install", (t) => {
  a("[ServiceWorker] Installing..."), self.skipWaiting();
});
self.addEventListener("activate", (t) => {
  a("[ServiceWorker] Activating..."), t.waitUntil(
    (async () => {
      const e = k(), n = await caches.keys();
      await Promise.all(
        n.filter((r) => r !== e).map((r) => caches.delete(r))
      ), await self.clients.claim(), a("[ServiceWorker] Active and controlling all clients");
    })()
  );
});
self.addEventListener("fetch", (t) => {
  const e = t.request;
  if (e.method !== "GET") {
    t.respondWith(fetch(e));
    return;
  }
  if (!T.shouldIntercept(e)) {
    t.respondWith(fetch(e));
    return;
  }
  t.respondWith(ae(e));
});
async function ae(t) {
  const e = new URL(t.url), n = E(e), r = K(n);
  switch (a(`[ServiceWorker] Handling ${n} with ${r} strategy:`, e.pathname), r) {
    case "cache-first":
      return oe(t);
    case "network-first":
      return ce(t);
    case "cache-only":
      return ie(t);
    case "network-only":
    default:
      return ue(t);
  }
}
async function oe(t) {
  const e = await caches.open(k()), n = w(t), r = await e.match(n);
  if (r)
    return a("[ServiceWorker] Cache hit:", t.url), he(t, e), r;
  a("[ServiceWorker] Cache miss, fetching:", t.url);
  try {
    const s = await T.processRequest(t);
    if (s.ok) {
      const o = s.clone();
      e.put(n, o);
    }
    return s;
  } catch (s) {
    return d("[ServiceWorker] Network error:", s), new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}
async function ce(t) {
  const e = await caches.open(k()), n = w(t);
  try {
    const r = await T.processRequest(t);
    if (r.ok) {
      const s = r.clone();
      e.put(n, s);
    }
    return r;
  } catch (r) {
    d("[ServiceWorker] Network error, trying cache:", r);
    const s = await e.match(n);
    return s ? (a("[ServiceWorker] Returning cached response"), s) : new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}
async function ie(t) {
  const e = await caches.open(k()), n = w(t), r = await e.match(n);
  return r || new Response("Not in cache", {
    status: 404,
    statusText: "Not Found"
  });
}
async function ue(t) {
  try {
    return await T.processRequest(t);
  } catch (e) {
    return d("[ServiceWorker] Network error:", e), new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}
async function he(t, e) {
  try {
    const n = await T.processRequest(t);
    if (n.ok) {
      const r = w(t);
      await e.put(r, n), a("[ServiceWorker] Cache refreshed:", t.url);
    }
  } catch (n) {
    j("[ServiceWorker] Background refresh failed:", n);
  }
}
self.addEventListener("message", async (t) => {
  var n, r, s, o, c, u;
  const e = t.data;
  switch (a("[ServiceWorker] Received message:", e.type), e.type) {
    case "CONFIG":
      e.payload && (P(e.payload), (n = t.ports[0]) == null || n.postMessage({ success: !0 }));
      break;
    case "UPDATE_TOKEN":
      (r = e.payload) != null && r.token && (await p.setToken(e.payload.token), (s = t.ports[0]) == null || s.postMessage({ success: !0 }));
      break;
    case "REQUEST_TOKEN":
      break;
    case "CLEAR_CACHE":
      await de(), (o = t.ports[0]) == null || o.postMessage({ success: !0 });
      break;
    case "GET_STATUS":
      const h = await le();
      (c = t.ports[0]) == null || c.postMessage(h);
      break;
    case "CLAIM_CLIENTS":
      await self.clients.claim(), (u = t.ports[0]) == null || u.postMessage({ success: !0 }), console.log("[ServiceWorker] Claimed clients via explicit message");
      break;
    default:
      b("[ServiceWorker] Unknown message type:", e.type);
  }
});
async function de() {
  const t = await caches.keys();
  await Promise.all(t.map((e) => caches.delete(e))), await p.clearToken(), a("[ServiceWorker] All caches cleared");
}
async function le() {
  const t = await caches.keys(), n = await (await caches.open(k())).keys();
  return {
    version: "1.0.0",
    caches: t,
    cachedRequests: n.length,
    hasToken: !!await p.getToken()
  };
}
a("[ServiceWorker] Script loaded, waiting for events...");
//# sourceMappingURL=sw.js.map
