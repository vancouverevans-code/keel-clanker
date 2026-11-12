import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, _ as createFileRoute, b as require_jsx_runtime, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-TSL-9Ruz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-Dt1MORL6.css";
var APP_NAME = "Keel";
var Route$1 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#101411"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var FACTORY_BYTECODE = "0x6080604052348015600e575f80fd5b506040516019906055565b604051809103905ff0801580156031573d5f803e3d5ffd5b505f80546001600160a01b0319166001600160a01b03929092169190911790556062565b610b43806104b183390190565b6104428061006f5f395ff3fe608060405234801561000f575f80fd5b5060043610610034575f3560e01c80635c60da1b14610038578063cee1ffe014610066575b5f80fd5b5f5461004a906001600160a01b031681565b6040516001600160a01b03909116815260200160405180910390f35b61004a610074366004610249565b5f8054610089906001600160a01b0316610161565b604051632698ca9160e01b81529091506001600160a01b03821690632698ca91906100ca908f908f908f908f908f908f908f908f908f908f90600401610364565b5f604051808303815f87803b1580156100e1575f80fd5b505af11580156100f3573d5f803e3d5ffd5b50505050866001600160a01b0316826001600160a01b0316826001600160a01b03167fc5a807b0033def274292e9d3ba676e6fcfb69d9d383ccf9b69112237bd95def98f8f8f8f60405161014a94939291906103db565b60405180910390a49b9a5050505050505050505050565b5f604051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b81528260601b60148201526e5af43d82803e903d91602b57fd5bf360881b60288201526037815ff09150506001600160a01b0381166101ea5760405162461bcd60e51b8152602060048201526005602482015264636c6f6e6560d81b604482015260640160405180910390fd5b919050565b5f8083601f8401126101ff575f80fd5b5081356001600160401b03811115610215575f80fd5b60208301915083602082850101111561022c575f80fd5b9250929050565b80356001600160a01b03811681146101ea575f80fd5b5f805f805f805f805f805f60e08c8e031215610263575f80fd5b8b356001600160401b03811115610278575f80fd5b6102848e828f016101ef565b909c509a505060208c01356001600160401b038111156102a2575f80fd5b6102ae8e828f016101ef565b909a5098505060408c013596506102c760608d01610233565b955060808c01356001600160401b038111156102e1575f80fd5b6102ed8e828f016101ef565b90965094505060a08c01356001600160401b0381111561030b575f80fd5b6103178e828f016101ef565b909450925061032a905060c08d01610233565b90509295989b509295989b9093969950565b81835281816020850137505f828201602090810191909152601f909101601f19169091010190565b60c081525f61037760c083018c8e61033c565b828103602084015261038a818b8d61033c565b604084018a90526001600160a01b0389166060850152838103608085015290506103b581878961033c565b905082810360a08401526103ca81858761033c565b9d9c50505050505050505050505050565b604081525f6103ee60408301868861033c565b828103602084015261040181858761033c565b97965050505050505056fea264697066735822122083c01f5beeb148b51d8239f352e8ccbfa191bd2fa5562423db6c2aaff52bba9f64736f6c634300081a00336080604052348015600e575f80fd5b506006805460ff19166001179055610b1a806100295f395ff3fe608060405234801561000f575f80fd5b50600436106100c3575f3560e01c806306fdde03146100c7578063095ea7b3146100e557806318160ddd1461010857806323b872dd1461011f5780632698ca9114610132578063313ce56714610147578063392f37e91461016157806342966c68146101695780636d3c473e1461017c57806370a082311461018f57806395d89b41146101ae578063a9059cbb146101b6578063dd62ed3e146101c9578063f3ccaac0146101f3578063f851a440146101fb575b5f80fd5b6100cf610226565b6040516100dc919061068c565b60405180910390f35b6100f86100f33660046106dc565b6102b1565b60405190151581526020016100dc565b61011160025481565b6040519081526020016100dc565b6100f861012d366004610704565b61031d565b610145610140366004610782565b6103c9565b005b61014f601281565b60405160ff90911681526020016100dc565b6100cf6104ae565b610145610177366004610868565b6104bb565b61014561018a36600461087f565b61052c565b61011161019d3660046108e9565b60076020525f908152604090205481565b6100cf610590565b6100f86101c43660046106dc565b61059d565b6101116101d7366004610909565b600860209081525f928352604080842090915290825290205481565b6100cf6105b2565b60035461020e906001600160a01b031681565b6040516001600160a01b0390911681526020016100dc565b5f80546102329061093a565b80601f016020809104026020016040519081016040528092919081815260200182805461025e9061093a565b80156102a95780601f10610280576101008083540402835291602001916102a9565b820191905f5260205f20905b81548152906001019060200180831161028c57829003601f168201915b505050505081565b335f8181526008602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259061030b9086815260200190565b60405180910390a35060015b92915050565b6001600160a01b0383165f9081526008602090815260408083203384529091528120548281101561037d5760405162461bcd60e51b8152602060048201526005602482015264616c6c6f7760d81b60448201526064015b60405180910390fd5b5f1981146103b35761038f8382610972565b6001600160a01b0386165f9081526008602090815260408083203384529091529020555b6103be8585856105bf565b506001949350505050565b60065460ff16156104055760405162461bcd60e51b8152600401610374906020808252600490820152631a5b9a5d60e21b604082015260600190565b6006805460ff191660011790555f61041e8a8c836109ee565b50600161042c888a836109ee565b50600380546001600160a01b0319166001600160a01b03871617905560046104558486836109ee565b5060056104638284836109ee565b5060028690556001600160a01b0385165f8181526007602090815260408083208a9055518981525f80516020610ac5833981519152910160405180910390a350505050505050505050565b600580546102329061093a565b335f908152600760205260409020548111156104e95760405162461bcd60e51b815260040161037490610aa7565b335f81815260076020908152604080832080548690039055600280548690039055518481529192915f80516020610ac5833981519152910160405180910390a350565b6003546001600160a01b0316331461056e5760405162461bcd60e51b815260206004820152600560248201526430b236b4b760d91b6044820152606401610374565b600461057b8486836109ee565b5060056105898284836109ee565b5050505050565b600180546102329061093a565b5f6105a93384846105bf565b50600192915050565b600480546102329061093a565b6001600160a01b0382166105fa5760405162461bcd60e51b8152602060048201526002602482015261746f60f01b6044820152606401610374565b6001600160a01b0383165f908152600760205260409020548111156106315760405162461bcd60e51b815260040161037490610aa7565b6001600160a01b038084165f81815260076020526040808220805486900390559285168082529083902080548501905591515f80516020610ac58339815191529061067f9085815260200190565b60405180910390a3505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b03811681146106d7575f80fd5b919050565b5f80604083850312156106ed575f80fd5b6106f6836106c1565b946020939093013593505050565b5f805f60608486031215610716575f80fd5b61071f846106c1565b925061072d602085016106c1565b929592945050506040919091013590565b5f8083601f84011261074e575f80fd5b5081356001600160401b03811115610764575f80fd5b60208301915083602082850101111561077b575f80fd5b9250929050565b5f805f805f805f805f8060c08b8d03121561079b575f80fd5b8a356001600160401b038111156107b0575f80fd5b6107bc8d828e0161073e565b909b5099505060208b01356001600160401b038111156107da575f80fd5b6107e68d828e0161073e565b90995097505060408b013595506107ff60608c016106c1565b945060808b01356001600160401b03811115610819575f80fd5b6108258d828e0161073e565b90955093505060a08b01356001600160401b03811115610843575f80fd5b61084f8d828e0161073e565b915080935050809150509295989b9194979a5092959850565b5f60208284031215610878575f80fd5b5035919050565b5f805f8060408587031215610892575f80fd5b84356001600160401b038111156108a7575f80fd5b6108b38782880161073e565b90955093505060208501356001600160401b038111156108d1575f80fd5b6108dd8782880161073e565b95989497509550505050565b5f602082840312156108f9575f80fd5b610902826106c1565b9392505050565b5f806040838503121561091a575f80fd5b610923836106c1565b9150610931602084016106c1565b90509250929050565b600181811c9082168061094e57607f821691505b60208210810361096c57634e487b7160e01b5f52602260045260245ffd5b50919050565b8181038181111561031757634e487b7160e01b5f52601160045260245ffd5b634e487b7160e01b5f52604160045260245ffd5b601f8211156109e957805f5260205f20601f840160051c810160208510156109ca5750805b601f840160051c820191505b81811015610589575f81556001016109d6565b505050565b6001600160401b03831115610a0557610a05610991565b610a1983610a13835461093a565b836109a5565b5f601f841160018114610a4a575f8515610a335750838201355b5f19600387901b1c1916600186901b178355610589565b5f83815260208120601f198716915b82811015610a795786850135825560209485019460019092019101610a59565b5086821015610a95575f1960f88860031b161c19848701351681555b505060018560011b0183555050505050565b60208082526003908201526218985b60ea1b60408201526060019056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa26469706673582212203bac1b5116dff08416ae0832b2ae5dd07b5b8a570d67ca7fdc20d94810b202a164736f6c634300081a0033";
var DEPLOY_SELECTOR = "0xcee1ffe0";
var SUPPLY_WEI = 1000000000n * 10n ** 18n;
var BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
var FACTORY = "0x572e88D3cD7f23E4241EB6ceDD96667271bF09A0";
var BOT = {
	id: 968,
	hex: "0x3c8",
	name: "BOT Chain Testnet",
	rpc: "https://rpc.bohr.life",
	explorer: "https://scan.bohr.life",
	symbol: "BOT",
	usdt: "0x75edC9335175Fc0552D51D48439F229c10420fe3"
};
/** Chains the Clanker docs list as deploy targets. 968 is not one of them. */
var CLANKER_CHAINS = [
	{
		id: 8453,
		name: "Base"
	},
	{
		id: 56,
		name: "BNB Chain"
	},
	{
		id: 143,
		name: "Monad"
	},
	{
		id: 4663,
		name: "Robinhood"
	},
	{
		id: 196,
		name: "X Layer"
	},
	{
		id: 5042,
		name: "Arc"
	},
	{
		id: 99901,
		name: "Elysium"
	}
];
var DEFAULT_DRAFT = {
	name: "",
	symbol: "",
	image: "",
	description: "",
	admin: "",
	x: "",
	requestKey: "keel-launch",
	buy: 1,
	sell: 1,
	dividends: 0,
	burn: 0,
	minHold: "10000",
	antiSnipe: false,
	chainId: 8453,
	quote: BASE_USDC,
	dryRun: true
};
var ZERO = "0x0000000000000000000000000000000000000000";
function isAddress(value) {
	return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}
function clamp(value, min, max, fallback) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, Math.round(n)));
}
function text(value, max, fallback) {
	if (typeof value !== "string") return fallback;
	return value.slice(0, max);
}
function hydrateDraft(value) {
	const v = typeof value === "object" && value ? value : {};
	return {
		name: text(v.name, 32, ""),
		symbol: text(v.symbol, 8, "").toUpperCase(),
		image: text(v.image, 180, ""),
		description: text(v.description, 240, ""),
		admin: text(v.admin, 42, ""),
		x: text(v.x, 120, ""),
		requestKey: text(v.requestKey, 64, DEFAULT_DRAFT.requestKey) || DEFAULT_DRAFT.requestKey,
		buy: clamp(v.buy, 1, 10, 1),
		sell: clamp(v.sell, 1, 10, 1),
		dividends: clamp(v.dividends, 0, 100, 0),
		burn: clamp(v.burn, 0, 100, 0),
		minHold: text(v.minHold, 18, "10000").replace(/[^\d]/g, "") || "0",
		antiSnipe: Boolean(v.antiSnipe),
		chainId: CLANKER_CHAINS.some((c) => c.id === v.chainId) ? v.chainId : 8453,
		quote: text(v.quote, 42, BASE_USDC),
		dryRun: v.dryRun !== false
	};
}
function creatorShare(draft) {
	return 100 - draft.dividends - draft.burn;
}
/** Clanker's cut of a trade, in percent. Floor 0.5, cap 1, else 10% of the tax. */
function protocolTake(taxPct) {
	return Math.min(1, Math.max(.5, taxPct * .1));
}
function splitOfTrade(taxPct, sharePct) {
	return Math.max(0, taxPct - protocolTake(taxPct)) * sharePct / 100;
}
function adminOf(draft, wallet) {
	if (isAddress(draft.admin)) return draft.admin.trim();
	if (wallet && isAddress(wallet)) return wallet;
	return "";
}
function buildPayload(draft, wallet) {
	const admin = adminOf(draft, wallet) || ZERO;
	const token = {
		name: draft.name.trim(),
		symbol: draft.symbol.trim().toUpperCase(),
		image: draft.image.trim(),
		tokenAdmin: admin,
		requestKey: draft.requestKey.trim()
	};
	if (draft.description.trim()) token.description = draft.description.trim();
	if (draft.x.trim().startsWith("https://")) token.socialMediaUrls = [{
		platform: "x",
		url: draft.x.trim()
	}];
	return {
		protocol: "v5",
		chainId: draft.chainId,
		token,
		tax: {
			buyFee: draft.buy,
			sellFee: draft.sell,
			dividends: draft.dividends,
			burn: draft.burn,
			minimumDividendHolding: draft.minHold || "10000",
			antiSnipeEnabled: draft.antiSnipe,
			metadataEditable: true
		},
		pool: { pairedToken: draft.quote.trim() },
		rewards: [{
			admin,
			recipient: admin,
			allocation: 100
		}],
		dryRun: draft.dryRun
	};
}
function embedSnippet(payload) {
	return `await fetch("https://www.clanker.world/api/tokens/deploy", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": process.env.CLANKER_API_KEY,
  },
  body: JSON.stringify(${JSON.stringify(payload, null, 2)}),
});`;
}
function word(hex) {
	return hex.replace(/^0x/, "").padStart(64, "0");
}
function encodeString(value) {
	const bytes = new TextEncoder().encode(value);
	const len = word(bytes.length.toString(16));
	let hex = "";
	for (const b of bytes) hex += b.toString(16).padStart(2, "0");
	const padded = hex.padEnd(Math.ceil(hex.length / 64) * 64, "0");
	return len + (bytes.length ? padded : "");
}
function encodeDeploy(name, symbol, supply, owner, image, metadata, bot) {
	const parts = [
		name,
		symbol,
		image,
		metadata
	].map(encodeString);
	let cursor = 224;
	const offsets = parts.map((part) => {
		const at = cursor;
		cursor += part.length / 2;
		return at;
	});
	return "0x" + [
		word(offsets[0].toString(16)),
		word(offsets[1].toString(16)),
		word(supply.toString(16)),
		word(owner.slice(2)),
		word(offsets[2].toString(16)),
		word(offsets[3].toString(16)),
		word(bot.slice(2))
	].join("") + parts.join("");
}
var FACTORY_BYTES = (FACTORY_BYTECODE.length - 2) / 2;
function deployCall(draft, owner, bot) {
	return DEPLOY_SELECTOR + encodeDeploy(draft.name.trim(), draft.symbol.trim().toUpperCase(), SUPPLY_WEI, owner, draft.image.trim(), draft.description.trim(), bot).slice(2);
}
function creationBytes(data) {
	return (data.length - 2) / 2;
}
function getEth() {
	const eth = typeof window === "undefined" ? void 0 : window.ethereum;
	if (!eth) throw new Error("No wallet in this browser.");
	return eth;
}
async function connectWallet() {
	const eth = getEth();
	const account = (await eth.request({ method: "eth_requestAccounts" }))[0];
	if (!account) throw new Error("Wallet returned no account.");
	const hex = await eth.request({ method: "eth_chainId" });
	return {
		account,
		chainId: Number(hex)
	};
}
async function ensureBotChain() {
	const eth = getEth();
	try {
		await eth.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: BOT.hex }]
		});
	} catch (error) {
		if (error.code !== 4902) throw error;
		await eth.request({
			method: "wallet_addEthereumChain",
			params: [{
				chainId: BOT.hex,
				chainName: BOT.name,
				nativeCurrency: {
					name: "BOT",
					symbol: "BOT",
					decimals: 18
				},
				rpcUrls: [BOT.rpc],
				blockExplorerUrls: [BOT.explorer]
			}]
		});
	}
}
var TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
async function sendAndWait(from, data, to) {
	const eth = getEth();
	const tx = {
		from,
		data
	};
	if (to) tx.to = to;
	const hash = await eth.request({
		method: "eth_sendTransaction",
		params: [tx]
	});
	for (let i = 0; i < 40; i++) {
		const receipt = await eth.request({
			method: "eth_getTransactionReceipt",
			params: [hash]
		});
		if (receipt) {
			if (receipt.status === "0x0") throw new Error("The transaction reverted.");
			return {
				hash,
				receipt
			};
		}
		await new Promise((resolve) => setTimeout(resolve, 1500));
	}
	throw new Error("Still waiting on a receipt. Check the explorer for " + hash);
}
async function publishFactory(from) {
	const { hash, receipt } = await sendAndWait(from, FACTORY_BYTECODE);
	if (!receipt.contractAddress) throw new Error("Factory receipt had no address.");
	return {
		hash,
		address: receipt.contractAddress
	};
}
async function deployViaFactory(draft, from, factory, bot) {
	const { hash, receipt } = await sendAndWait(from, deployCall(draft, isAddress(draft.admin) ? draft.admin.trim() : from, bot), factory);
	const token = receipt.logs?.find((log) => log.topics?.[0]?.toLowerCase() === TRANSFER_TOPIC && !!log.address && log.address.toLowerCase() !== factory.toLowerCase())?.address;
	if (!token) throw new Error("Mined, but the receipt had no token address.");
	return {
		hash,
		address: token
	};
}
function addressUrl(address) {
	return `${BOT.explorer}/address/${address}`;
}
function errorText(error) {
	if (error.code === 4001) return "Wallet request cancelled.";
	if (error instanceof Error && error.message) return error.message;
	return "Something went wrong.";
}
var $$splitComponentImporter = () => import("./routes-Ceydo3Pf.mjs");
var Route = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
`${FACTORY}${BOT.id}`;
var rootRouteChildren = { IndexRoute: Route.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$1
}) };
var routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { splitOfTrade as C, publishFactory as S, ensureBotChain as _, FACTORY as a, isAddress as b, addressUrl as c, connectWallet as d, creationBytes as f, embedSnippet as g, deployViaFactory as h, DEFAULT_DRAFT as i, adminOf as l, deployCall as m, BOT as n, FACTORY_BYTES as o, creatorShare as p, CLANKER_CHAINS as r, router_exports as t, buildPayload as u, errorText as v, protocolTake as x, hydrateDraft as y };
