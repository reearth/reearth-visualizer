//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = (e, t) => t.some((t) => e instanceof t), r, i;
function a() {
	return r ||= [
		IDBDatabase,
		IDBObjectStore,
		IDBIndex,
		IDBCursor,
		IDBTransaction
	];
}
function o() {
	return i ||= [
		IDBCursor.prototype.advance,
		IDBCursor.prototype.continue,
		IDBCursor.prototype.continuePrimaryKey
	];
}
var s = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap();
function u(e) {
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("success", i), e.removeEventListener("error", a);
		}, i = () => {
			t(m(e.result)), r();
		}, a = () => {
			n(e.error), r();
		};
		e.addEventListener("success", i), e.addEventListener("error", a);
	});
	return l.set(t, e), t;
}
function ee(e) {
	if (s.has(e)) return;
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("complete", i), e.removeEventListener("error", a), e.removeEventListener("abort", a);
		}, i = () => {
			t(), r();
		}, a = () => {
			n(e.error || new DOMException("AbortError", "AbortError")), r();
		};
		e.addEventListener("complete", i), e.addEventListener("error", a), e.addEventListener("abort", a);
	});
	s.set(e, t);
}
var d = {
	get(e, t, n) {
		if (e instanceof IDBTransaction) {
			if (t === "done") return s.get(e);
			if (t === "store") return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
		}
		return m(e[t]);
	},
	set(e, t, n) {
		return e[t] = n, !0;
	},
	has(e, t) {
		return e instanceof IDBTransaction && (t === "done" || t === "store") || t in e;
	}
};
function f(e) {
	d = e(d);
}
function p(e) {
	return o().includes(e) ? function(...t) {
		return e.apply(h(this), t), m(this.request);
	} : function(...t) {
		return m(e.apply(h(this), t));
	};
}
function te(e) {
	return typeof e == "function" ? p(e) : (e instanceof IDBTransaction && ee(e), n(e, a()) ? new Proxy(e, d) : e);
}
function m(e) {
	if (e instanceof IDBRequest) return u(e);
	if (c.has(e)) return c.get(e);
	let t = te(e);
	return t !== e && (c.set(e, t), l.set(t, e)), t;
}
var h = (e) => l.get(e);
function g(e, t, { blocked: n, upgrade: r, blocking: i, terminated: a } = {}) {
	let o = indexedDB.open(e, t), s = m(o);
	return r && o.addEventListener("upgradeneeded", (e) => {
		r(m(o.result), e.oldVersion, e.newVersion, m(o.transaction), e);
	}), n && o.addEventListener("blocked", (e) => n(e.oldVersion, e.newVersion, e)), s.then((e) => {
		a && e.addEventListener("close", () => a()), i && e.addEventListener("versionchange", (e) => i(e.oldVersion, e.newVersion, e));
	}).catch(() => {}), s;
}
var ne = [
	"get",
	"getKey",
	"getAll",
	"getAllKeys",
	"count"
], re = [
	"put",
	"add",
	"delete",
	"clear"
], _ = /* @__PURE__ */ new Map();
function v(e, t) {
	if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string")) return;
	if (_.get(t)) return _.get(t);
	let n = t.replace(/FromIndex$/, ""), r = t !== n, i = re.includes(n);
	if (!(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(i || ne.includes(n))) return;
	let a = async function(e, ...t) {
		let a = this.transaction(e, i ? "readwrite" : "readonly"), o = a.store;
		return r && (o = o.index(t.shift())), (await Promise.all([o[n](...t), i && a.done]))[0];
	};
	return _.set(t, a), a;
}
f((e) => ({
	...e,
	get: (t, n, r) => v(t, n) || e.get(t, n, r),
	has: (t, n) => !!v(t, n) || e.has(t, n)
}));
var y = [
	"continue",
	"continuePrimaryKey",
	"advance"
], b = {}, x = /* @__PURE__ */ new WeakMap(), S = /* @__PURE__ */ new WeakMap(), C = { get(e, t) {
	if (!y.includes(t)) return e[t];
	let n = b[t];
	return n ||= b[t] = function(...e) {
		x.set(this, S.get(this)[t](...e));
	}, n;
} };
async function* ie(...e) {
	let t = this;
	if (t instanceof IDBCursor || (t = await t.openCursor(...e)), !t) return;
	t = t;
	let n = new Proxy(t, C);
	for (S.set(n, t), l.set(n, h(t)); t;) yield n, t = await (x.get(n) || t.continue()), x.delete(n);
}
function w(e, t) {
	return t === Symbol.asyncIterator && n(e, [
		IDBIndex,
		IDBObjectStore,
		IDBCursor
	]) || t === "iterate" && n(e, [IDBIndex, IDBObjectStore]);
}
f((e) => ({
	...e,
	get(t, n, r) {
		return w(t, n) ? ie : e.get(t, n, r);
	},
	has(t, n) {
		return w(t, n) || e.has(t, n);
	}
}));
//#endregion
//#region src/config.ts
var ae = /* @__PURE__ */ t({
	CONFIG: () => E,
	configure: () => D,
	debugError: () => j,
	debugLog: () => k,
	debugWarn: () => A,
	extractAssetUUID: () => L,
	getAssetType: () => I,
	getCacheKey: () => z,
	getCacheName: () => M,
	getCacheStrategy: () => R,
	getIndexedDBName: () => P,
	isDebugEnabled: () => O,
	isProtectedDomain: () => F,
	isStaleCacheName: () => N
}), T = {
	namespace: "asset-security",
	protectedDomains: [],
	assetPatterns: {
		customAssets: /\.(?:jpg|jpeg|png|gif|svg|pdf|geojson|gltf|glb|kml|czml)$/i,
		mvtTiles: /\.mvt$/i,
		rasterTiles: /\/tiles\/[^/]+\/\d+\/\d+\/\d+/,
		generalAssets: /\.(jpg|jpeg|png|gif|svg|pdf|geojson|gltf|glb|kml|czml)$/i
	},
	token: {
		indexedDBStore: "tokens",
		refreshThreshold: 60 * 1e3
	},
	api: {
		tokenEndpoint: "/api/auth/token",
		refreshEndpoint: "/api/auth/refresh",
		proxyEndpoint: ""
	},
	cache: {
		maxAge: 3600,
		strategies: {
			images: "cache-first",
			tiles: "network-first",
			documents: "network-only"
		}
	},
	debug: !1
}, E = T;
function D(e) {
	E = e ? {
		...T,
		namespace: e.namespace,
		protectedDomains: [...e.protectedDomains],
		assetPatterns: {
			...T.assetPatterns,
			...e.assetPatterns
		},
		token: {
			...T.token,
			...e.token
		},
		api: {
			...T.api,
			proxyEndpoint: e.proxyEndpoint
		},
		cache: {
			...T.cache,
			strategies: {
				...T.cache.strategies,
				...e.cacheStrategies
			}
		},
		debug: e.debug
	} : T, E.protectedDomains.length === 0 && A("[ServiceWorker] Warning: No protected domains configured. Authentication will not be applied."), E.api.proxyEndpoint || A("[ServiceWorker] Warning: No proxy endpoint configured. Signed URL functionality will not work."), k(`[ServiceWorker] Configured with namespace: ${E.namespace}`, E);
}
function O() {
	return !!E.debug;
}
function k(...e) {
	O() && console.log(...e);
}
function A(...e) {
	O() && console.warn(...e);
}
function j(...e) {
	O() && console.error(...e);
}
function M() {
	return `${E.namespace}-v1`;
}
function N(e) {
	let t = `${E.namespace}-v`;
	return e !== M() && e.startsWith(t) && /^\d+$/.test(e.slice(t.length));
}
function P() {
	return `${E.namespace}-auth`;
}
function F(e) {
	let t = typeof e == "string" ? new URL(e) : e;
	return E.protectedDomains.some((e) => e.includes(":") ? t.host === e : t.hostname === e || t.hostname.endsWith(`.${e}`));
}
function I(e) {
	let t = (typeof e == "string" ? new URL(e) : e).pathname;
	if (E.assetPatterns.mvtTiles.test(t) || E.assetPatterns.rasterTiles.test(t)) return "tile";
	if (E.assetPatterns.customAssets.test(t)) return "asset";
	if (E.assetPatterns.generalAssets.test(t)) {
		let e = t.split(".").pop()?.toLowerCase();
		return e && [
			"jpg",
			"jpeg",
			"png",
			"gif",
			"svg"
		].includes(e) ? "image" : "document";
	}
	return "unknown";
}
function L(e) {
	let t = (typeof e == "string" ? new URL(e) : e).pathname, n = t.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
	if (n) return n[1];
	let r = t.match(/\/([0-9a-fA-F-]{20,})\//);
	return r ? r[1] : null;
}
function R(e) {
	switch (e) {
		case "image": return E.cache.strategies.images;
		case "tile": return E.cache.strategies.tiles;
		case "document": return E.cache.strategies.documents;
		default: return "network-first";
	}
}
function z(e) {
	let t = new URL(e.url), n = t.origin + t.pathname;
	return new Request(n, {
		method: e.method,
		headers: {
			Accept: e.headers.get("Accept") || "*/*",
			"Content-Type": e.headers.get("Content-Type") || ""
		}
	});
}
//#endregion
//#region src/token-provider.ts
var B = 5e3;
B - 2e3;
var V = new class {
	constructor() {
		this.memoryCache = null, this.dbPromise = null, this.dbName = "", this.inFlightAcquisition = null, this.inFlightRefresh = null, this.lastAcquisitionFailureAt = 0;
	}
	db() {
		let e = P();
		if (this.dbPromise && this.dbName === e) return this.dbPromise;
		this.dbPromise?.then((e) => e.close(), () => {}), this.dbName = e;
		let t = () => {
			this.dbPromise === n && (this.dbPromise = null);
		}, n = g(e, 1, {
			upgrade(e) {
				e.objectStoreNames.contains("tokens") || e.createObjectStore("tokens");
			},
			blocking: (e, n, r) => {
				t(), r.target.close();
			},
			terminated: t
		}).catch((e) => {
			throw t(), e;
		});
		return this.dbPromise = n, n;
	}
	async getToken() {
		if (k("[TokenManager] Getting token..."), this.memoryCache && !this.isTokenExpired(this.memoryCache)) return k("[TokenManager] Token found in memory cache"), this.memoryCache.token;
		try {
			let e = await (await this.db()).get("tokens", "current");
			if (e && !this.isTokenExpired(e)) return k("[TokenManager] Token found in IndexedDB"), this.memoryCache = e, e.token;
		} catch (e) {
			j("[TokenManager] Error accessing IndexedDB:", e);
		}
		return k("[TokenManager] Requesting fresh token from main thread"), await this.requestFreshToken();
	}
	async setToken(e) {
		let t = {
			token: e.access_token,
			expiry: e.expires_at,
			refreshToken: e.refresh_token
		};
		this.memoryCache = t, this.lastAcquisitionFailureAt = 0;
		try {
			await (await this.db()).put("tokens", t, "current"), k("[TokenManager] Token stored successfully");
		} catch (e) {
			j("[TokenManager] Error storing token:", e);
		}
	}
	refreshToken() {
		return this.inFlightRefresh ??= this.askForRefresh().finally(() => {
			this.inFlightRefresh = null;
		}), this.inFlightRefresh;
	}
	async askForRefresh() {
		k("[TokenManager] Refreshing token...");
		let e;
		try {
			e = (this.memoryCache ?? await (await this.db()).get("tokens", "current"))?.refreshToken;
		} catch (e) {
			j("[TokenManager] Error reading the refresh token:", e);
		}
		return this.askClients({
			type: "REFRESH_TOKEN",
			refreshToken: e
		}, "TOKEN_REFRESHED");
	}
	async clearToken() {
		this.memoryCache = null;
		try {
			await (await this.db()).delete("tokens", "current"), k("[TokenManager] Tokens cleared");
		} catch (e) {
			j("[TokenManager] Error clearing tokens:", e);
		}
	}
	isTokenExpired(e) {
		return !e || Date.now() >= e.expiry;
	}
	async requestFreshToken() {
		return Date.now() - this.lastAcquisitionFailureAt < 15e3 ? (k("[TokenManager] Skipping token request during backoff window"), null) : (this.inFlightAcquisition ??= this.askClients({ type: "REQUEST_TOKEN" }, "TOKEN_PROVIDED").then((e) => (e || (this.lastAcquisitionFailureAt = Date.now()), e)).finally(() => {
			this.inFlightAcquisition = null;
		}), this.inFlightAcquisition);
	}
	async askClients(e, t) {
		try {
			let n = await self.clients.matchAll({ type: "window" });
			if (n.length === 0) return k("[TokenManager] No clients available"), null;
			let r = await new Promise((r) => {
				let i = n.length, a = [], o = (e) => {
					clearTimeout(s), a.forEach((e) => e.port1.close()), r(e);
				}, s = setTimeout(() => {
					k("[TokenManager] Token request timeout"), o(null);
				}, B);
				for (let r of n) {
					let n = new MessageChannel();
					a.push(n), n.port1.onmessage = (e) => {
						e.data?.type === t && e.data.token ? o(e.data.token) : --i === 0 && o(null);
					}, r.postMessage(e, [n.port2]);
				}
			});
			return r ? (await this.setToken(r), r.access_token) : null;
		} catch (e) {
			return j("[TokenManager] Error requesting token from clients:", e), null;
		}
	}
}(), H = new class {
	shouldIntercept(e) {
		let t = new URL(e.url);
		return !F(t) || e.method !== "GET" ? !1 : I(t) !== "unknown";
	}
	addAuthentication(e, t) {
		let n = new Headers(e.headers);
		return n.set("Authorization", `Bearer ${t}`), k("[RequestInterceptor] Adding Authorization header:", `Bearer ${t.substring(0, 20)}...`), new Request(e.url, {
			method: e.method,
			headers: n,
			body: e.body,
			mode: "cors",
			credentials: "include",
			cache: e.cache,
			redirect: e.redirect,
			referrer: e.referrer,
			referrerPolicy: e.referrerPolicy,
			integrity: e.integrity
		});
	}
	async handleAuthError(e) {
		k("[RequestInterceptor] Handling auth error, attempting token refresh...");
		let t = await V.refreshToken();
		if (!t) return k("[RequestInterceptor] Token refresh failed"), new Response("Authentication failed", {
			status: 401,
			statusText: "Unauthorized",
			headers: { "Content-Type": "text/plain" }
		});
		k("[RequestInterceptor] Retrying request with refreshed token");
		let n = this.addAuthentication(e, t);
		try {
			let e = await fetch(n);
			return e.status === 401 || e.status === 403 ? (await V.clearToken(), new Response("Authentication failed after refresh", {
				status: 401,
				statusText: "Unauthorized"
			})) : e;
		} catch (e) {
			return j("[RequestInterceptor] Error retrying request:", e), new Response("Network error", {
				status: 503,
				statusText: "Service Unavailable"
			});
		}
	}
	async processRequest(e) {
		let t = new URL(e.url), n = I(t), r = L(t);
		k(`[RequestInterceptor] Processing ${n} request:`, {
			url: t.pathname,
			assetId: r,
			assetType: n
		});
		let i = await V.getToken();
		if (!i) return k("[RequestInterceptor] No token available"), fetch(e);
		let a = this.addAuthentication(e, i);
		try {
			let t = await fetch(a);
			return t.status === 401 || t.status === 403 ? await this.handleAuthError(e) : (t.ok, t);
		} catch (t) {
			j("[RequestInterceptor] Network error:", t);
			let n = await (await caches.open(M())).match(e);
			if (n) return k("[RequestInterceptor] Returning cached response"), n;
			throw t;
		}
	}
	async processTileRequest(e) {
		let t = new URL(e.url), n = L(t);
		if (!n) return fetch(e);
		k("[RequestInterceptor] Processing tile request:", {
			url: t.pathname,
			assetId: n
		});
		let r = await V.getToken();
		if (!r) return k("[RequestInterceptor] No token for tile request"), fetch(e);
		let i = await this.getSignedUrl(n, r);
		if (i?.url) {
			let t = new Request(i.url, {
				method: e.method,
				headers: e.headers,
				mode: "cors",
				credentials: "omit"
			});
			return fetch(t);
		}
		return this.processRequest(e);
	}
	async getSignedUrl(e, t) {
		try {
			let { CONFIG: n } = await Promise.resolve().then(() => ae), r = n.api.proxyEndpoint;
			if (!r) return j("[RequestInterceptor] Proxy endpoint not configured"), null;
			let i = await fetch(`${r}/api/signed-url`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${t}`
				},
				body: JSON.stringify({
					assetId: e,
					prefix: !0,
					expiry: 900
				})
			});
			return i.ok ? await i.json() : (j("[RequestInterceptor] Failed to get signed URL"), null);
		} catch (e) {
			return j("[RequestInterceptor] Error getting signed URL:", e), null;
		}
	}
}(), U = "x-sentinel-cached-at";
function W(e) {
	if (!e.ok) return !1;
	let t = e.headers.get("cache-control") ?? "";
	return !/(?:^|,)\s*no-store\b/i.test(t);
}
function G(e, t = Date.now()) {
	let n = new Headers(e.headers);
	return n.set(U, String(t)), new Response(e.body, {
		status: e.status,
		statusText: e.statusText,
		headers: n
	});
}
function K(e, t, n = Date.now()) {
	let r = Number(e.headers.get(U));
	if (!Number.isFinite(r) || r <= 0) return !1;
	let i = q(e) ?? t;
	return n - r < i * 1e3;
}
function q(e) {
	let t = e.headers.get("cache-control") ?? "", n = /(?:^|,)\s*max-age=(\d+)/i.exec(t);
	return n ? Number(n[1]) : null;
}
//#endregion
//#region src/strategies.ts
async function oe(e) {
	let t = new URL(e.url), n = I(t), r = R(n);
	switch (k(`[ServiceWorker] Handling ${n} with ${r} strategy:`, t.pathname), r) {
		case "cache-first": return se(e);
		case "network-first": return ce(e);
		case "cache-only": return le(e);
		default: return ue(e);
	}
}
async function se(e) {
	let t = await caches.open(M()), n = z(e), r = await t.match(n);
	if (r && K(r, E.cache.maxAge)) return k("[ServiceWorker] Cache hit (fresh):", e.url), r;
	try {
		let r = await H.processRequest(e);
		return r.ok && await J(t, n, r), r;
	} catch (t) {
		return r ? (k("[ServiceWorker] Network failed, serving stale cache:", e.url), r) : (j("[ServiceWorker] Network error:", t), new Response("Network error", {
			status: 503,
			statusText: "Service Unavailable"
		}));
	}
}
async function ce(e) {
	let t = await caches.open(M()), n = z(e);
	try {
		let r = await H.processRequest(e);
		return r.ok && await J(t, n, r), r;
	} catch (e) {
		j("[ServiceWorker] Network error, trying cache:", e);
		let r = await t.match(n);
		return r ? (k("[ServiceWorker] Returning cached response"), r) : new Response("Network error", {
			status: 503,
			statusText: "Service Unavailable"
		});
	}
}
async function le(e) {
	let t = await caches.open(M()), n = z(e);
	return await t.match(n) || new Response("Not in cache", {
		status: 404,
		statusText: "Not Found"
	});
}
async function ue(e) {
	try {
		return await H.processRequest(e);
	} catch (e) {
		return j("[ServiceWorker] Network error:", e), new Response("Network error", {
			status: 503,
			statusText: "Service Unavailable"
		});
	}
}
async function J(e, t, n) {
	W(n) && await e.put(t, G(n.clone()));
}
//#endregion
//#region src/runtime-config.ts
var Y = "sentinel", X = [
	"customAssets",
	"mvtTiles",
	"rasterTiles",
	"generalAssets"
], de = [
	"images",
	"tiles",
	"documents"
], fe = [
	"cache-first",
	"network-first",
	"network-only",
	"cache-only"
];
function pe(e) {
	try {
		let t = new URLSearchParams(e).get(Y);
		return t ? Z(JSON.parse(he(t))) : null;
	} catch {
		return null;
	}
}
function me(e) {
	if (!Q(e)) return null;
	let t = Q(e.assetPatterns) ? e.assetPatterns : {}, n = {};
	for (let e of X) {
		let r = t[e];
		r !== void 0 && (n[e] = r instanceof RegExp ? [r.source, r.flags] : r);
	}
	let r = Q(e.tokenConfig) ? e.tokenConfig : {}, i = Q(e.api) ? e.api : {};
	return Z({
		v: 1,
		ns: e.namespace,
		d: e.protectedDomains,
		p: n,
		x: i.proxyEndpoint,
		t: { rt: r.refreshThreshold },
		c: e.cacheStrategies,
		dbg: e.debug === !0 ? 1 : void 0
	});
}
function Z(e) {
	if (!Q(e) || e.v !== 1) return null;
	let { ns: t, d: n, p: r, x: i, t: a, c: o, dbg: s } = e;
	if (typeof t != "string" || t === "" || typeof i != "string" || !Array.isArray(n) || !n.every((e) => typeof e == "string") || !Q(r)) return null;
	let c = {};
	for (let e of X) {
		let t = r[e];
		if (t !== void 0) {
			if (!Array.isArray(t) || typeof t[0] != "string" || typeof t[1] != "string") return null;
			c[e] = new RegExp(t[0], t[1]);
		}
	}
	let l = {};
	Q(a) && Number.isFinite(a.rt) && (l.refreshThreshold = a.rt);
	let u = {};
	if (Q(o)) for (let e of de) {
		let t = o[e];
		fe.includes(t) && (u[e] = t);
	}
	return {
		namespace: t,
		protectedDomains: n,
		assetPatterns: c,
		proxyEndpoint: i,
		token: l,
		cacheStrategies: u,
		debug: s === 1
	};
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function he(e) {
	let t = atob(e.replace(/-/g, "+").replace(/_/g, "/"));
	return new TextDecoder("utf-8", { fatal: !0 }).decode(Uint8Array.from(t, (e) => e.charCodeAt(0)));
}
//#endregion
//#region src/sw.ts
var $ = pe(self.location.search);
!$ && new URLSearchParams(self.location.search).has("sentinel") && console.warn(`[ServiceWorker] The "${Y}" config in the script URL is unreadable; protected requests will not be authenticated`), D($), self.addEventListener("install", (e) => {
	k("[ServiceWorker] Installing..."), self.skipWaiting();
}), self.addEventListener("activate", (e) => {
	k("[ServiceWorker] Activating..."), e.waitUntil((async () => {
		let e = await caches.keys();
		await Promise.all(e.filter(N).map((e) => caches.delete(e))), await self.clients.claim(), k("[ServiceWorker] Active and controlling all clients");
	})());
}), self.addEventListener("fetch", (e) => {
	let t = e.request;
	if (t.method !== "GET") {
		e.respondWith(fetch(t));
		return;
	}
	if (!H.shouldIntercept(t)) {
		e.respondWith(fetch(t));
		return;
	}
	e.respondWith(oe(t));
}), self.addEventListener("message", (e) => {
	e.waitUntil(ge(e));
});
async function ge(e) {
	let t = e.data;
	switch (k("[ServiceWorker] Received message:", t.type), t.type) {
		case "CONFIG": {
			if ($) {
				A("[ServiceWorker] Ignoring CONFIG message: config travels in the script URL");
				break;
			}
			let n = me(t.payload);
			n ? D(n) : A("[ServiceWorker] Ignoring unreadable CONFIG message"), e.ports[0]?.postMessage({ success: !!n });
			break;
		}
		case "UPDATE_TOKEN":
			t.payload?.token && (await V.setToken(t.payload.token), e.ports[0]?.postMessage({ success: !0 }));
			break;
		case "REQUEST_TOKEN": break;
		case "CLEAR_CACHE":
			await _e(), e.ports[0]?.postMessage({ success: !0 });
			break;
		case "GET_STATUS":
			let n = await ve();
			e.ports[0]?.postMessage(n);
			break;
		case "CLAIM_CLIENTS":
			await self.clients.claim(), e.ports[0]?.postMessage({ success: !0 }), console.log("[ServiceWorker] Claimed clients via explicit message");
			break;
		default: A("[ServiceWorker] Unknown message type:", t.type);
	}
}
async function _e() {
	let e = await caches.keys();
	await Promise.all(e.map((e) => caches.delete(e))), await V.clearToken(), k("[ServiceWorker] All caches cleared");
}
async function ve() {
	return {
		version: "1.0.0",
		caches: await caches.keys(),
		cachedRequests: (await (await caches.open(M())).keys()).length,
		hasToken: !!await V.getToken()
	};
}
k("[ServiceWorker] Script loaded, waiting for events...");
//#endregion

//# sourceMappingURL=sw.js.map