import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Copy, r as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { C as splitOfTrade, S as publishFactory, _ as ensureBotChain, a as FACTORY, b as isAddress, c as addressUrl, d as connectWallet, f as creationBytes, g as embedSnippet, h as deployViaFactory, i as DEFAULT_DRAFT, l as adminOf, m as deployCall, n as BOT, p as creatorShare, r as CLANKER_CHAINS, u as buildPayload, v as errorText, x as protocolTake, y as hydrateDraft } from "./router-TSL-9Ruz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ceydo3Pf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LAYERS = [
	{
		id: "factory",
		n: "01",
		title: "Factory",
		body: `One permissionless call deploys everything. The documented v5 factory is ${FACTORY}. It is not on chain ${BOT.id}.`
	},
	{
		id: "token",
		n: "02",
		title: "Token",
		body: "ERC-20, 1 billion supply, 18 decimals, no further mint. tokenAdmin can still update image and metadata."
	},
	{
		id: "pool",
		n: "03",
		title: "Pool",
		body: "The full supply is placed in a Uniswap v4 pool against a registered quote token. That liquidity cannot be removed."
	},
	{
		id: "tax",
		n: "04",
		title: "Tax",
		body: "Buy and sell each run 1–10%. There is no LP fee. Clanker keeps the larger of 10% of the tax and 0.5% of the trade, and never more than 1% of the trade."
	},
	{
		id: "rewards",
		n: "05",
		title: "Rewards",
		body: "What remains after Clanker’s cut splits across creator wallets (up to 7), holder dividends, and burn. Rewards pay out in the quote token."
	}
];
var FIELD = "h-11 w-full rounded-lg border border-line bg-raised px-3 text-base text-paper outline-none placeholder:text-muted";
function Home() {
	const [tab, setTab] = (0, import_react.useState)("build");
	const [layer, setLayer] = (0, import_react.useState)("factory");
	const [draft, setDraft] = (0, import_react.useState)(DEFAULT_DRAFT);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [wallet, setWallet] = (0, import_react.useState)(null);
	const [chainId, setChainId] = (0, import_react.useState)(null);
	const [launches, setLaunches] = (0, import_react.useState)([]);
	const [factory, setFactory] = (0, import_react.useState)("");
	const [botAddr, setBotAddr] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			const saved = localStorage.getItem("keel.draft");
			if (saved) setDraft(hydrateDraft(JSON.parse(saved)));
			const prior = localStorage.getItem("keel.launches");
			if (prior) {
				const parsed = JSON.parse(prior);
				if (Array.isArray(parsed)) setLaunches(parsed.slice(0, 12));
			}
			const savedFactory = localStorage.getItem("keel.factory");
			if (savedFactory) setFactory(savedFactory);
			const savedBot = localStorage.getItem("keel.bot");
			if (savedBot) setBotAddr(savedBot);
		} catch {}
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		localStorage.setItem("keel.draft", JSON.stringify(draft));
		localStorage.setItem("keel.factory", factory);
		localStorage.setItem("keel.bot", botAddr);
	}, [
		draft,
		factory,
		botAddr,
		ready
	]);
	const payload = (0, import_react.useMemo)(() => buildPayload(draft, wallet), [draft, wallet]);
	const snippet = (0, import_react.useMemo)(() => embedSnippet(payload), [payload]);
	const share = creatorShare(draft);
	const over = share < 0;
	const admin = adminOf(draft, wallet);
	const factoryOk = isAddress(factory);
	const named = Boolean(draft.name.trim() && draft.symbol.trim());
	const ownerLive = admin || (isAddress(botAddr) ? botAddr.trim() : "");
	const botLive = isAddress(botAddr) ? botAddr.trim() : ownerLive;
	const place = "0x1111111111111111111111111111111111111111";
	const call = named && ownerLive ? deployCall(draft, ownerLive, botLive) : "";
	const sizeCall = named ? deployCall(draft, ownerLive || place, botLive || place) : "";
	const active = LAYERS.find((item) => item.id === layer) ?? LAYERS[0];
	const onBot = chainId === BOT.id;
	function patch(partial) {
		setDraft((prev) => hydrateDraft({
			...prev,
			...partial
		}));
	}
	async function copy(id, value) {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(id);
			window.setTimeout(() => setCopied(""), 1400);
		} catch {
			setNote("Clipboard blocked. Select the text and copy it.");
		}
	}
	async function onConnect() {
		setNote("");
		try {
			const next = await connectWallet();
			setWallet(next.account);
			setChainId(next.chainId);
		} catch (error) {
			setNote(errorText(error));
		}
	}
	async function onDeploy() {
		if (over) {
			setNote("Dividends and burn add up to more than 100%.");
			setTab("build");
			return;
		}
		if (!draft.name.trim() || !draft.symbol.trim()) {
			setNote("Add a name and symbol, then come back to Testnet.");
			setTab("build");
			return;
		}
		setBusy(true);
		setNote("");
		try {
			let account = wallet;
			let current = chainId;
			if (!account) {
				const next = await connectWallet();
				account = next.account;
				current = next.chainId;
				setWallet(account);
				setChainId(current);
			}
			if (current !== BOT.id) {
				await ensureBotChain();
				setChainId(BOT.id);
			}
			let fac = isAddress(factory) ? factory.trim() : "";
			if (!fac) {
				setNote("First confirm publishes the factory. Later tokens skip this.");
				fac = (await publishFactory(account)).address;
				setFactory(fac);
				localStorage.setItem("keel.factory", fac);
				setNote("Factory is on testnet. Confirm the token — that call spends less BOT.");
			}
			const launcher = isAddress(botAddr) ? botAddr.trim() : account;
			const result = await deployViaFactory(draft, account, fac, launcher);
			const next = [{
				name: draft.name.trim(),
				symbol: draft.symbol.trim().toUpperCase(),
				address: result.address,
				hash: result.hash,
				at: Date.now()
			}, ...launches].slice(0, 12);
			setLaunches(next);
			localStorage.setItem("keel.launches", JSON.stringify(next));
			setNote("Token is live on BOT Chain testnet. A bot can call this same factory.");
		} catch (error) {
			setNote(errorText(error));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-4 border-b border-brass pb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-brass uppercase",
						children: "Launch desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-4xl text-paper",
						children: "Keel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-muted",
						children: "Clanker v5 config, then a fixed-supply token on BOT Chain testnet. The factory call stays a snippet you drop into another app."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-line bg-surface px-3 py-2 text-xs text-muted",
						children: [
							BOT.id,
							" · ",
							BOT.symbol,
							" testnet"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onConnect,
						className: "h-11 rounded-full bg-brass px-4 text-sm font-medium text-ink hover:bg-brass-dim",
						children: wallet ? short(wallet) : "Connect"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex gap-2 overflow-x-auto pb-1",
				children: LAYERS.map((item) => {
					const on = item.id === layer;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setLayer(item.id),
						className: "h-16 w-32 shrink-0 rounded-xl border px-3 text-left " + (on ? "border-brass bg-raised text-paper" : "border-line bg-surface text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs",
							children: item.n
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-medium",
							children: item.title
						})]
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 min-h-12 text-sm text-muted",
				children: active.body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-2",
				role: "tablist",
				children: [
					["build", "Configure"],
					["embed", "Embed"],
					["chain", "Testnet"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": tab === id,
					onClick: () => setTab(id),
					className: "h-11 rounded-full px-4 text-sm " + (tab === id ? "bg-brass font-medium text-ink" : "border border-line bg-surface text-paper"),
					children: label
				}, id))
			}),
			tab === "build" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: FIELD,
									value: draft.name,
									maxLength: 32,
									placeholder: "Keel Note",
									onChange: (e) => patch({ name: e.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "Symbol",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: FIELD,
									value: draft.symbol,
									maxLength: 8,
									placeholder: "KEEL",
									onChange: (e) => patch({ symbol: e.target.value.toUpperCase() })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "Image URL",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: FIELD,
									value: draft.image,
									maxLength: 180,
									placeholder: "https://",
									onChange: (e) => patch({ image: e.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "Token admin",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: FIELD,
									value: draft.admin,
									spellCheck: false,
									placeholder: wallet ?? "0x… or the connected wallet",
									onChange: (e) => patch({ admin: e.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "Description",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: FIELD,
									value: draft.description,
									maxLength: 240,
									placeholder: "Optional",
									onChange: (e) => patch({ description: e.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "X profile",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: FIELD,
									value: draft.x,
									maxLength: 120,
									placeholder: "https://x.com/…",
									onChange: (e) => patch({ x: e.target.value })
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-6 text-xl text-paper",
						children: "Tax"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Defaults are the floor: 1% buy, 1% sell. On a ",
							draft.buy,
							"% buy, Clanker keeps",
							" ",
							fmt(protocolTake(draft.buy)),
							"% of the trade."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
								label: "Buy %",
								value: draft.buy,
								min: 1,
								max: 10,
								onChange: (buy) => patch({ buy })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
								label: "Sell %",
								value: draft.sell,
								min: 1,
								max: 10,
								onChange: (sell) => patch({ sell })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
								label: "Dividends",
								value: draft.dividends,
								min: 0,
								max: 100,
								onChange: (dividends) => patch({ dividends })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
								label: "Burn",
								value: draft.burn,
								min: 0,
								max: 100,
								onChange: (burn) => patch({ burn })
							})
						]
					}),
					over ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-clay",
						children: "Dividends and burn add up to more than 100%."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex h-3 overflow-hidden rounded-full bg-raised",
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-brass",
								style: { width: `${share}%` }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-paper",
								style: { width: `${draft.dividends}%` }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-clay",
								style: { width: `${draft.burn}%` }
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Of the tax left after Clanker: creator ",
							fmt(splitOfTrade(draft.buy, share)),
							"% of a buy, dividends ",
							fmt(splitOfTrade(draft.buy, draft.dividends)),
							"%, burn",
							" ",
							fmt(splitOfTrade(draft.buy, draft.burn)),
							"%. One fee slot takes the whole creator share. The factory allows seven."
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							text: "Min tokens for dividends",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: FIELD,
								inputMode: "numeric",
								value: draft.minHold,
								onChange: (e) => patch({ minHold: e.target.value.replace(/[^\d]/g, "") })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "switch",
								"aria-checked": draft.antiSnipe,
								onClick: () => patch({ antiSnipe: !draft.antiSnipe }),
								className: "h-11 w-full rounded-lg border px-3 text-left text-sm " + (draft.antiSnipe ? "border-brass bg-brass text-ink" : "border-line bg-raised text-paper"),
								children: ["Anti-snipe ", draft.antiSnipe ? "on" : "off"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [draft.antiSnipe ? "First 20 seconds start near a 99% fee and decay to your tax. That extra fee goes to Clanker, not you." : "Off keeps the first trades on your normal tax. Clanker’s own floor is already 1%.", draft.dividends > 0 && Number(draft.minHold) < 1e4 ? " Dividend holding must be at least 10,000 on Clanker." : ""]
					})
				]
			}),
			tab === "embed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Other apps do not assemble the pool themselves. They POST this body. v5 is the only launch protocol. ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-paper",
								children: "dryRun: true"
							}),
							" checks it without deploying. Chain ",
							BOT.id,
							" is rejected by that API."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "Clanker chain",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: FIELD,
									value: draft.chainId,
									onChange: (e) => patch({ chainId: Number(e.target.value) }),
									children: CLANKER_CHAINS.map((chain) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: chain.id,
										children: [
											chain.name,
											" · ",
											chain.id
										]
									}, chain.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "Quote token",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: FIELD,
									spellCheck: false,
									value: draft.quote,
									onChange: (e) => patch({ quote: e.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								text: "Request key",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: FIELD,
									value: draft.requestKey,
									maxLength: 64,
									onChange: (e) => patch({ requestKey: e.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "switch",
									"aria-checked": draft.dryRun,
									onClick: () => patch({ dryRun: !draft.dryRun }),
									className: "h-11 w-full rounded-lg border px-3 text-left text-sm " + (draft.dryRun ? "border-brass bg-brass text-ink" : "border-line bg-raised text-paper"),
									children: ["Dry run ", draft.dryRun ? "on" : "off"]
								})
							})
						]
					}),
					draft.chainId !== 8453 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							"The quote field is still Base USDC until you paste the quote registered on",
							" ",
							CLANKER_CHAINS.find((c) => c.id === draft.chainId)?.name,
							"."
						]
					}),
					!isAddress(draft.quote) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-clay",
						children: "Quote token needs a 20-byte address."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-4 max-h-96 overflow-auto rounded-lg border border-line bg-ink p-3 text-xs leading-relaxed text-paper",
						children: snippet
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => copy("json", JSON.stringify(payload, null, 2)),
							className: "inline-flex h-11 items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm text-paper",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" }), copied === "json" ? "Copied" : "Copy JSON"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => copy("sdk", snippet),
							className: "inline-flex h-11 items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm text-paper",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" }), copied === "sdk" ? "Copied" : "Copy fetch"]
						})]
					})
				]
			}),
			tab === "chain" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Deploys on ",
							BOT.name,
							". The first click publishes a factory any bot can call. Each token after that is a clone",
							call ? ` (${creationBytes(call).toLocaleString()} bytes)` : sizeCall ? ` (${creationBytes(sizeCall).toLocaleString()} bytes)` : "",
							", not a fresh",
							" ",
							4084 .toLocaleString(),
							"-byte contract, so it spends less BOT. Supply stays",
							" ",
							1000000000n.toLocaleString(),
							". Leave image and description empty to keep the call smaller."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							text: "Factory",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: FIELD,
								spellCheck: false,
								value: factory,
								placeholder: "Filled on first deploy, or paste one",
								onChange: (e) => setFactory(e.target.value.trim())
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							text: "Bot",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: FIELD,
								spellCheck: false,
								value: botAddr,
								placeholder: wallet ?? "Blank uses the connected wallet",
								onChange: (e) => setBotAddr(e.target.value.trim())
							})
						})]
					}),
					factory.length > 0 && !factoryOk && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-clay",
						children: "Factory needs a 20-byte address, or leave it empty."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid gap-3 text-sm sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								k: "RPC",
								v: BOT.rpc
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								k: "Chain",
								v: String(BOT.id)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								k: "Wallet",
								v: wallet ? onBot ? "On testnet" : "Other network" : "Not connected"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: onDeploy,
							className: "h-11 rounded-full bg-brass px-5 text-sm font-medium text-ink hover:bg-brass-dim disabled:opacity-40",
							children: busy ? "Confirm in wallet…" : factoryOk ? "Deploy token" : "Deploy on testnet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => copy("data", call || "Add a name, a symbol, and a bot or admin address first."),
							className: "inline-flex h-11 items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm text-paper",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" }), copied === "data" ? "Copied" : "Copy bot call"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							"Bots send ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-paper",
								children: "deploy(name, symbol, supply, admin, image, metadata, bot)"
							}),
							" ",
							"to the factory. Testnet USDT, if you add a pool later: ",
							BOT.usdt
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-6 text-xl text-paper",
						children: "Launches"
					}),
					launches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "No testnet tokens from this browser yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-line",
						children: launches.map((launch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium text-paper",
									children: [
										launch.name,
										" · ",
										launch.symbol
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted",
									children: launch.address
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								className: "inline-flex h-11 shrink-0 items-center gap-1 text-sm text-brass",
								href: addressUrl(launch.address),
								target: "_blank",
								rel: "noreferrer",
								children: ["Token", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4" })]
							})]
						}, launch.hash))
					})
				]
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-paper",
				children: note
			})
		]
	});
}
function Label({ text, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-xs tracking-wide text-muted uppercase",
			children: text
		}), children]
	});
}
function Num({ label, value, min, max, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		text: label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: FIELD,
			type: "number",
			min,
			max,
			value,
			onChange: (e) => onChange(Number(e.target.value))
		})
	});
}
function Fact({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-line bg-raised px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs tracking-wide text-muted uppercase",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "truncate text-paper",
			children: v
		})]
	});
}
function short(address) {
	return address.slice(0, 6) + "…" + address.slice(-4);
}
function fmt(n) {
	return n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}
//#endregion
export { Home as component };
