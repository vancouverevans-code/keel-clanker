import { DEPLOY_SELECTOR, FACTORY_BYTECODE } from "@/lib/bytecode";

/** Clanker v5 supply. The factory mints this; it is not a parameter. */
export const SUPPLY = 1_000_000_000n;
export const SUPPLY_WEI = SUPPLY * 10n ** 18n;

export const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const FACTORY = "0x572e88D3cD7f23E4241EB6ceDD96667271bF09A0";
/** KeelFactory already published on BOT Chain testnet. */
export const KEEL_FACTORY = "0x6c5fdb0fee4280ee5989fe68e268ffced962b4f3";

export const BOT = {
  id: 968,
  hex: "0x3c8",
  name: "BOT Chain Testnet",
  rpc: "https://rpc.bohr.life",
  explorer: "https://scan.bohr.life",
  symbol: "BOT",
  usdt: "0x75edC9335175Fc0552D51D48439F229c10420fe3",
} as const;

/** Chains the Clanker docs list as deploy targets. 968 is not one of them. */
export const CLANKER_CHAINS = [
  { id: 8453, name: "Base" },
  { id: 56, name: "BNB Chain" },
  { id: 143, name: "Monad" },
  { id: 4663, name: "Robinhood" },
  { id: 196, name: "X Layer" },
  { id: 5042, name: "Arc" },
  { id: 99901, name: "Elysium" },
] as const;

export type Draft = {
  name: string;
  symbol: string;
  image: string;
  description: string;
  admin: string;
  x: string;
  requestKey: string;
  buy: number;
  sell: number;
  dividends: number;
  burn: number;
  minHold: string;
  antiSnipe: boolean;
  chainId: number;
  quote: string;
  dryRun: boolean;
};

export const DEFAULT_DRAFT: Draft = {
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
  dryRun: true,
};

export type Launch = {
  name: string;
  symbol: string;
  address: string;
  hash: string;
  at: number;
};

export type Payload = {
  protocol: "v5";
  chainId: number;
  token: {
    name: string;
    symbol: string;
    image: string;
    tokenAdmin: string;
    description?: string;
    requestKey: string;
    socialMediaUrls?: { platform: string; url: string }[];
  };
  tax: {
    buyFee: number;
    sellFee: number;
    dividends: number;
    burn: number;
    minimumDividendHolding: string;
    antiSnipeEnabled: boolean;
    metadataEditable: true;
  };
  pool: { pairedToken: string };
  rewards: { admin: string; recipient: string; allocation: number }[];
  dryRun: boolean;
};

const ZERO = "0x0000000000000000000000000000000000000000";

export function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function text(value: unknown, max: number, fallback: string) {
  if (typeof value !== "string") return fallback;
  return value.slice(0, max);
}

export function hydrateDraft(value: unknown): Draft {
  const v = (typeof value === "object" && value ? value : {}) as Partial<Draft>;
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
    chainId: CLANKER_CHAINS.some((c) => c.id === v.chainId) ? (v.chainId as number) : 8453,
    quote: text(v.quote, 42, BASE_USDC),
    dryRun: v.dryRun !== false,
  };
}

export function creatorShare(draft: Draft) {
  return 100 - draft.dividends - draft.burn;
}

/** Clanker's cut of a trade, in percent. Floor 0.5, cap 1, else 10% of the tax. */
export function protocolTake(taxPct: number) {
  return Math.min(1, Math.max(0.5, taxPct * 0.1));
}

export function splitOfTrade(taxPct: number, sharePct: number) {
  const rest = Math.max(0, taxPct - protocolTake(taxPct));
  return (rest * sharePct) / 100;
}

export function adminOf(draft: Draft, wallet: string | null) {
  if (isAddress(draft.admin)) return draft.admin.trim();
  if (wallet && isAddress(wallet)) return wallet;
  return "";
}

export function buildPayload(draft: Draft, wallet: string | null): Payload {
  const admin = adminOf(draft, wallet) || ZERO;
  const token: Payload["token"] = {
    name: draft.name.trim(),
    symbol: draft.symbol.trim().toUpperCase(),
    image: draft.image.trim(),
    tokenAdmin: admin,
    requestKey: draft.requestKey.trim(),
  };
  if (draft.description.trim()) token.description = draft.description.trim();
  if (draft.x.trim().startsWith("https://")) {
    token.socialMediaUrls = [{ platform: "x", url: draft.x.trim() }];
  }
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
      metadataEditable: true,
    },
    pool: { pairedToken: draft.quote.trim() },
    rewards: [{ admin, recipient: admin, allocation: 100 }],
    dryRun: draft.dryRun,
  };
}

export function embedSnippet(payload: Payload) {
  return `await fetch("https://www.clanker.world/api/tokens/deploy", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": process.env.CLANKER_API_KEY,
  },
  body: JSON.stringify(${JSON.stringify(payload, null, 2)}),
});`;
}

function word(hex: string) {
  return hex.replace(/^0x/, "").padStart(64, "0");
}

function encodeString(value: string) {
  const bytes = new TextEncoder().encode(value);
  const len = word(bytes.length.toString(16));
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  const padded = hex.padEnd(Math.ceil(hex.length / 64) * 64, "0");
  return len + (bytes.length ? padded : "");
}

export function encodeDeploy(
  name: string,
  symbol: string,
  supply: bigint,
  owner: string,
  image: string,
  metadata: string,
  bot: string,
) {
  const parts = [name, symbol, image, metadata].map(encodeString);
  let cursor = 32 * 7;
  const offsets = parts.map((part) => {
    const at = cursor;
    cursor += part.length / 2;
    return at;
  });
  const head = [
    word(offsets[0].toString(16)),
    word(offsets[1].toString(16)),
    word(supply.toString(16)),
    word(owner.slice(2)),
    word(offsets[2].toString(16)),
    word(offsets[3].toString(16)),
    word(bot.slice(2)),
  ].join("");
  return "0x" + head + parts.join("");
}

export const FACTORY_BYTES = (FACTORY_BYTECODE.length - 2) / 2;

export function deployCall(draft: Draft, owner: string, bot: string) {
  const args = encodeDeploy(
    draft.name.trim(),
    draft.symbol.trim().toUpperCase(),
    SUPPLY_WEI,
    owner,
    draft.image.trim(),
    draft.description.trim(),
    bot,
  );
  return DEPLOY_SELECTOR + args.slice(2);
}

export function creationBytes(data: string) {
  return (data.length - 2) / 2;
}

type Eth = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getEth(): Eth {
  const eth = typeof window === "undefined" ? undefined : window.ethereum;
  if (!eth) throw new Error("No wallet in this browser.");
  return eth;
}

export async function connectWallet() {
  const eth = getEth();
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
  const account = accounts[0];
  if (!account) throw new Error("Wallet returned no account.");
  const hex = (await eth.request({ method: "eth_chainId" })) as string;
  return { account, chainId: Number(hex) };
}

export async function ensureBotChain() {
  const eth = getEth();
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BOT.hex }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902) throw error;
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: BOT.hex,
          chainName: BOT.name,
          nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
          rpcUrls: [BOT.rpc],
          blockExplorerUrls: [BOT.explorer],
        },
      ],
    });
  }
}

type Receipt = {
  contractAddress?: string | null;
  status?: string;
  logs?: { address?: string; topics?: string[] }[];
} | null;

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function sendAndWait(from: string, data: string, to?: string) {
  const eth = getEth();
  const tx: { from: string; data: string; to?: string } = { from, data };
  if (to) tx.to = to;
  const hash = (await eth.request({
    method: "eth_sendTransaction",
    params: [tx],
  })) as string;
  for (let i = 0; i < 40; i++) {
    const receipt = (await eth.request({
      method: "eth_getTransactionReceipt",
      params: [hash],
    })) as Receipt;
    if (receipt) {
      if (receipt.status === "0x0") throw new Error("The transaction reverted.");
      return { hash, receipt };
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error("Still waiting on a receipt. Check the explorer for " + hash);
}

export async function publishFactory(from: string) {
  const { hash, receipt } = await sendAndWait(from, FACTORY_BYTECODE);
  if (!receipt.contractAddress) throw new Error("Factory receipt had no address.");
  return { hash, address: receipt.contractAddress };
}

export async function deployViaFactory(draft: Draft, from: string, factory: string, bot: string) {
  const owner = isAddress(draft.admin) ? draft.admin.trim() : from;
  const data = deployCall(draft, owner, bot);
  const { hash, receipt } = await sendAndWait(from, data, factory);
  const token = receipt.logs?.find(
    (log) =>
      log.topics?.[0]?.toLowerCase() === TRANSFER_TOPIC &&
      !!log.address &&
      log.address.toLowerCase() !== factory.toLowerCase(),
  )?.address;
  if (!token) throw new Error("Mined, but the receipt had no token address.");
  return { hash, address: token };
}

export function txUrl(hash: string) {
  return `${BOT.explorer}/tx/${hash}`;
}

export function addressUrl(address: string) {
  return `${BOT.explorer}/address/${address}`;
}

export function errorText(error: unknown) {
  const code = (error as { code?: number }).code;
  if (code === 4001) return "Wallet request cancelled.";
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong.";
}

declare global {
  interface Window {
    ethereum?: Eth;
  }
}
