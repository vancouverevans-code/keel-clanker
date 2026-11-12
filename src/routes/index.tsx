import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Copy } from "lucide-react";
import {
  BOT,
  CLANKER_CHAINS,
  DEFAULT_DRAFT,
  FACTORY,
  FACTORY_BYTES,
  SUPPLY,
  addressUrl,
  adminOf,
  buildPayload,
  connectWallet,
  creationBytes,
  creatorShare,
  deployCall,
  deployViaFactory,
  embedSnippet,
  ensureBotChain,
  errorText,
  hydrateDraft,
  isAddress,
  protocolTake,
  publishFactory,
  splitOfTrade,
  type Draft,
  type Launch,
} from "@/lib/desk";

export const Route = createFileRoute("/")({ component: Home });

const LAYERS = [
  {
    id: "factory",
    n: "01",
    title: "Factory",
    body: `One permissionless call deploys everything. The documented v5 factory is ${FACTORY}. It is not on chain ${BOT.id}.`,
  },
  {
    id: "token",
    n: "02",
    title: "Token",
    body: "ERC-20, 1 billion supply, 18 decimals, no further mint. tokenAdmin can still update image and metadata.",
  },
  {
    id: "pool",
    n: "03",
    title: "Pool",
    body: "The full supply is placed in a Uniswap v4 pool against a registered quote token. That liquidity cannot be removed.",
  },
  {
    id: "tax",
    n: "04",
    title: "Tax",
    body: "Buy and sell each run 1–10%. There is no LP fee. Clanker keeps the larger of 10% of the tax and 0.5% of the trade, and never more than 1% of the trade.",
  },
  {
    id: "rewards",
    n: "05",
    title: "Rewards",
    body: "What remains after Clanker’s cut splits across creator wallets (up to 7), holder dividends, and burn. Rewards pay out in the quote token.",
  },
] as const;

type LayerId = (typeof LAYERS)[number]["id"];
type Tab = "build" | "embed" | "chain";

const FIELD =
  "h-11 w-full rounded-lg border border-line bg-raised px-3 text-base text-paper outline-none placeholder:text-muted";

function Home() {
  const [tab, setTab] = useState<Tab>("build");
  const [layer, setLayer] = useState<LayerId>("factory");
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [ready, setReady] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [factory, setFactory] = useState("");
  const [botAddr, setBotAddr] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("keel.draft");
      if (saved) setDraft(hydrateDraft(JSON.parse(saved)));
      const prior = localStorage.getItem("keel.launches");
      if (prior) {
        const parsed = JSON.parse(prior) as Launch[];
        if (Array.isArray(parsed)) setLaunches(parsed.slice(0, 12));
      }
      const savedFactory = localStorage.getItem("keel.factory");
      if (savedFactory) setFactory(savedFactory);
      const savedBot = localStorage.getItem("keel.bot");
      if (savedBot) setBotAddr(savedBot);
    } catch {
      /* keep defaults */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("keel.draft", JSON.stringify(draft));
    localStorage.setItem("keel.factory", factory);
    localStorage.setItem("keel.bot", botAddr);
  }, [draft, factory, botAddr, ready]);

  const payload = useMemo(() => buildPayload(draft, wallet), [draft, wallet]);
  const snippet = useMemo(() => embedSnippet(payload), [payload]);
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

  function patch(partial: Partial<Draft>) {
    setDraft((prev) => hydrateDraft({ ...prev, ...partial }));
  }

  async function copy(id: string, value: string) {
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
        const published = await publishFactory(account);
        fac = published.address;
        setFactory(fac);
        localStorage.setItem("keel.factory", fac);
        setNote("Factory is on testnet. Confirm the token — that call spends less BOT.");
      }
      const launcher = isAddress(botAddr) ? botAddr.trim() : account;
      const result = await deployViaFactory(draft, account, fac, launcher);
      const launch: Launch = {
        name: draft.name.trim(),
        symbol: draft.symbol.trim().toUpperCase(),
        address: result.address,
        hash: result.hash,
        at: Date.now(),
      };
      const next = [launch, ...launches].slice(0, 12);
      setLaunches(next);
      localStorage.setItem("keel.launches", JSON.stringify(next));
      setNote("Token is live on BOT Chain testnet. A bot can call this same factory.");
    } catch (error) {
      setNote(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-brass pb-5">
        <div>
          <p className="text-xs font-medium tracking-widest text-brass uppercase">Launch desk</p>
          <h1 className="mt-1 text-4xl text-paper">Keel</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Clanker v5 config, then a fixed-supply token on BOT Chain testnet. The factory call
            stays a snippet you drop into another app.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-line bg-surface px-3 py-2 text-xs text-muted">
            {BOT.id} · {BOT.symbol} testnet
          </span>
          <button
            type="button"
            onClick={onConnect}
            className="h-11 rounded-full bg-brass px-4 text-sm font-medium text-ink hover:bg-brass-dim"
          >
            {wallet ? short(wallet) : "Connect"}
          </button>
        </div>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {LAYERS.map((item) => {
          const on = item.id === layer;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLayer(item.id)}
              className={
                "h-16 w-32 shrink-0 rounded-xl border px-3 text-left " +
                (on
                  ? "border-brass bg-raised text-paper"
                  : "border-line bg-surface text-muted")
              }
            >
              <span className="block text-xs">{item.n}</span>
              <span className="block text-sm font-medium">{item.title}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 min-h-12 text-sm text-muted">{active.body}</p>

      <div className="mt-4 flex gap-2" role="tablist">
        {(
          [
            ["build", "Configure"],
            ["embed", "Embed"],
            ["chain", "Testnet"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={
              "h-11 rounded-full px-4 text-sm " +
              (tab === id
                ? "bg-brass font-medium text-ink"
                : "border border-line bg-surface text-paper")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "build" && (
        <section className="mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label text="Name">
              <input
                className={FIELD}
                value={draft.name}
                maxLength={32}
                placeholder="Keel Note"
                onChange={(e) => patch({ name: e.target.value })}
              />
            </Label>
            <Label text="Symbol">
              <input
                className={FIELD}
                value={draft.symbol}
                maxLength={8}
                placeholder="KEEL"
                onChange={(e) => patch({ symbol: e.target.value.toUpperCase() })}
              />
            </Label>
            <Label text="Image URL">
              <input
                className={FIELD}
                value={draft.image}
                maxLength={180}
                placeholder="https://"
                onChange={(e) => patch({ image: e.target.value })}
              />
            </Label>
            <Label text="Token admin">
              <input
                className={FIELD}
                value={draft.admin}
                spellCheck={false}
                placeholder={wallet ?? "0x… or the connected wallet"}
                onChange={(e) => patch({ admin: e.target.value })}
              />
            </Label>
            <Label text="Description">
              <input
                className={FIELD}
                value={draft.description}
                maxLength={240}
                placeholder="Optional"
                onChange={(e) => patch({ description: e.target.value })}
              />
            </Label>
            <Label text="X profile">
              <input
                className={FIELD}
                value={draft.x}
                maxLength={120}
                placeholder="https://x.com/…"
                onChange={(e) => patch({ x: e.target.value })}
              />
            </Label>
          </div>

          <h2 className="mt-6 text-xl text-paper">Tax</h2>
          <p className="mt-1 text-sm text-muted">
            Defaults are the floor: 1% buy, 1% sell. On a {draft.buy}% buy, Clanker keeps{" "}
            {fmt(protocolTake(draft.buy))}% of the trade.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Num label="Buy %" value={draft.buy} min={1} max={10} onChange={(buy) => patch({ buy })} />
            <Num label="Sell %" value={draft.sell} min={1} max={10} onChange={(sell) => patch({ sell })} />
            <Num
              label="Dividends"
              value={draft.dividends}
              min={0}
              max={100}
              onChange={(dividends) => patch({ dividends })}
            />
            <Num label="Burn" value={draft.burn} min={0} max={100} onChange={(burn) => patch({ burn })} />
          </div>

          {over ? (
            <p className="mt-3 text-sm text-clay">Dividends and burn add up to more than 100%.</p>
          ) : (
            <>
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-raised" aria-hidden>
                <span className="bg-brass" style={{ width: `${share}%` }} />
                <span className="bg-paper" style={{ width: `${draft.dividends}%` }} />
                <span className="bg-clay" style={{ width: `${draft.burn}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">
                Of the tax left after Clanker: creator {fmt(splitOfTrade(draft.buy, share))}% of a
                buy, dividends {fmt(splitOfTrade(draft.buy, draft.dividends))}%, burn{" "}
                {fmt(splitOfTrade(draft.buy, draft.burn))}%. One fee slot takes the whole creator
                share. The factory allows seven.
              </p>
            </>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Label text="Min tokens for dividends">
              <input
                className={FIELD}
                inputMode="numeric"
                value={draft.minHold}
                onChange={(e) => patch({ minHold: e.target.value.replace(/[^\d]/g, "") })}
              />
            </Label>
            <div className="flex items-end">
              <button
                type="button"
                role="switch"
                aria-checked={draft.antiSnipe}
                onClick={() => patch({ antiSnipe: !draft.antiSnipe })}
                className={
                  "h-11 w-full rounded-lg border px-3 text-left text-sm " +
                  (draft.antiSnipe
                    ? "border-brass bg-brass text-ink"
                    : "border-line bg-raised text-paper")
                }
              >
                Anti-snipe {draft.antiSnipe ? "on" : "off"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">
            {draft.antiSnipe
              ? "First 20 seconds start near a 99% fee and decay to your tax. That extra fee goes to Clanker, not you."
              : "Off keeps the first trades on your normal tax. Clanker’s own floor is already 1%."}
            {draft.dividends > 0 && Number(draft.minHold) < 10000
              ? " Dividend holding must be at least 10,000 on Clanker."
              : ""}
          </p>
        </section>
      )}

      {tab === "embed" && (
        <section className="mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <p className="text-sm text-muted">
            Other apps do not assemble the pool themselves. They POST this body. v5 is the only
            launch protocol. <code className="text-paper">dryRun: true</code> checks it without
            deploying. Chain {BOT.id} is rejected by that API.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Label text="Clanker chain">
              <select
                className={FIELD}
                value={draft.chainId}
                onChange={(e) => patch({ chainId: Number(e.target.value) })}
              >
                {CLANKER_CHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name} · {chain.id}
                  </option>
                ))}
              </select>
            </Label>
            <Label text="Quote token">
              <input
                className={FIELD}
                spellCheck={false}
                value={draft.quote}
                onChange={(e) => patch({ quote: e.target.value })}
              />
            </Label>
            <Label text="Request key">
              <input
                className={FIELD}
                value={draft.requestKey}
                maxLength={64}
                onChange={(e) => patch({ requestKey: e.target.value })}
              />
            </Label>
            <div className="flex items-end">
              <button
                type="button"
                role="switch"
                aria-checked={draft.dryRun}
                onClick={() => patch({ dryRun: !draft.dryRun })}
                className={
                  "h-11 w-full rounded-lg border px-3 text-left text-sm " +
                  (draft.dryRun
                    ? "border-brass bg-brass text-ink"
                    : "border-line bg-raised text-paper")
                }
              >
                Dry run {draft.dryRun ? "on" : "off"}
              </button>
            </div>
          </div>
          {draft.chainId !== 8453 && (
            <p className="mt-3 text-sm text-muted">
              The quote field is still Base USDC until you paste the quote registered on{" "}
              {CLANKER_CHAINS.find((c) => c.id === draft.chainId)?.name}.
            </p>
          )}
          {!isAddress(draft.quote) && (
            <p className="mt-2 text-sm text-clay">Quote token needs a 20-byte address.</p>
          )}
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-line bg-ink p-3 text-xs leading-relaxed text-paper">
            {snippet}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("json", JSON.stringify(payload, null, 2))}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm text-paper"
            >
              <Copy className="h-4 w-4" />
              {copied === "json" ? "Copied" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={() => copy("sdk", snippet)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm text-paper"
            >
              <Copy className="h-4 w-4" />
              {copied === "sdk" ? "Copied" : "Copy fetch"}
            </button>
          </div>
        </section>
      )}

      {tab === "chain" && (
        <section className="mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <p className="text-sm text-muted">
            Deploys on {BOT.name}. The first click publishes a factory any bot can call. Each token
            after that is a clone
            {call ? ` (${creationBytes(call).toLocaleString()} bytes)` : sizeCall ? ` (${creationBytes(sizeCall).toLocaleString()} bytes)` : ""}, not a fresh{" "}
            {FACTORY_BYTES.toLocaleString()}-byte contract, so it spends less BOT. Supply stays{" "}
            {SUPPLY.toLocaleString()}. Leave image and description empty to keep the call smaller.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Label text="Factory">
              <input
                className={FIELD}
                spellCheck={false}
                value={factory}
                placeholder="Filled on first deploy, or paste one"
                onChange={(e) => setFactory(e.target.value.trim())}
              />
            </Label>
            <Label text="Bot">
              <input
                className={FIELD}
                spellCheck={false}
                value={botAddr}
                placeholder={wallet ?? "Blank uses the connected wallet"}
                onChange={(e) => setBotAddr(e.target.value.trim())}
              />
            </Label>
          </div>
          {factory.length > 0 && !factoryOk && (
            <p className="mt-2 text-sm text-clay">Factory needs a 20-byte address, or leave it empty.</p>
          )}
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <Fact k="RPC" v={BOT.rpc} />
            <Fact k="Chain" v={String(BOT.id)} />
            <Fact k="Wallet" v={wallet ? (onBot ? "On testnet" : "Other network") : "Not connected"} />
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onDeploy}
              className="h-11 rounded-full bg-brass px-5 text-sm font-medium text-ink hover:bg-brass-dim disabled:opacity-40"
            >
              {busy ? "Confirm in wallet…" : factoryOk ? "Deploy token" : "Deploy on testnet"}
            </button>
            <button
              type="button"
              onClick={() =>
                copy("data", call || "Add a name, a symbol, and a bot or admin address first.")
              }
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm text-paper"
            >
              <Copy className="h-4 w-4" />
              {copied === "data" ? "Copied" : "Copy bot call"}
            </button>
          </div>
          <p className="mt-3 text-sm text-muted">
            Bots send <span className="text-paper">deploy(name, symbol, supply, admin, image, metadata, bot)</span>{" "}
            to the factory. Testnet USDT, if you add a pool later: {BOT.usdt}
          </p>

          <h2 className="mt-6 text-xl text-paper">Launches</h2>
          {launches.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No testnet tokens from this browser yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {launches.map((launch) => (
                <li key={launch.hash} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-paper">
                      {launch.name} · {launch.symbol}
                    </p>
                    <p className="truncate text-xs text-muted">{launch.address}</p>
                  </div>
                  <a
                    className="inline-flex h-11 shrink-0 items-center gap-1 text-sm text-brass"
                    href={addressUrl(launch.address)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Token
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {note && <p className="mt-4 text-sm text-paper">{note}</p>}
    </main>
  );
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs tracking-wide text-muted uppercase">{text}</span>
      {children}
    </label>
  );
}

function Num({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <Label text={label}>
      <input
        className={FIELD}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Label>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-line bg-raised px-3 py-2">
      <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
      <dd className="truncate text-paper">{v}</dd>
    </div>
  );
}

function short(address: string) {
  return address.slice(0, 6) + "…" + address.slice(-4);
}

function fmt(n: number) {
  return n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}
