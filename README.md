# Keel

A small launch desk. It builds a [Clanker](https://clanker.gitbook.io/documentation) v5 config you can drop into another app, and it deploys tokens on [BOT Chain testnet](https://dev-docs.botchain.ai/docs/Developers/quick-guide/) through a factory any bot can call.

Clanker’s own factory is not on chain 968. Keel does not pretend it is. The pool, the buy/sell tax, and the fee slots stay in the embed payload for chains Clanker actually supports. The testnet button only does what chain 968 can do: publish a factory, then launch a fixed-supply token cheaply.

## Desk

| Tab | What you do |
| --- | --- |
| Configure | Name, symbol, image, admin, tax, dividends, burn, anti-snipe |
| Embed | Copy a `POST` to `https://www.clanker.world/api/tokens/deploy` |
| Testnet | Connect a wallet and launch on BOT Chain testnet |

Drafts and past launches stay in the browser (`localStorage`). There are no accounts.

## Clanker v5, as the desk models it

An app does not assemble the pool. It sends one body. v5 is the only launch protocol.

- Fixed supply of 1,000,000,000 tokens, 18 decimals, no further mint.
- Full supply goes into a Uniswap v4 pool. That liquidity cannot be removed.
- Buy tax and sell tax, each 1–10%. No LP fee.
- Clanker keeps the larger of 10% of the tax and 0.5% of the trade, and never more than 1% of the trade.
- What is left splits across creator wallets (up to 7), holder dividends, and burn.

Chains the Clanker docs list: Base (8453), BNB Chain (56), Monad (143), Robinhood Chain (4663), X Layer (196), Arc (5042), Elysium (99901). Chain 968 is not on that list. The embed tab defaults to `dryRun: true`.

Documented v5 factory (not used on BOT Chain): `0x572e88D3cD7f23E4241EB6ceDD96667271bF09A0`.

The quote field starts as Base USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`. Replace it if you change chain.

## BOT Chain testnet

| | |
| --- | --- |
| Chain ID | 968 (`0x3c8`) |
| RPC | `https://rpc.bohr.life` |
| Explorer | `https://scan.bohr.life` |
| Gas token | BOT |
| Testnet USDT | `0x75edC9335175Fc0552D51D48439F229c10420fe3` |

**Deploy on testnet** is always clickable. If the name or symbol is missing, it sends you back to Configure.

The first confirmation publishes `KeelFactory` (about 4,084 bytes of init code). That transaction creates the token implementation and locks it so it cannot be initialized. Every later launch is a call, not a new full contract:

```solidity
function deploy(
    string calldata name,
    string calldata symbol,
    uint256 supply,
    address admin,
    string calldata image,
    string calldata metadata,
    address bot
) external returns (address token);
```

Selector: `0xcee1ffe0`.

The factory clones the implementation (EIP-1167, 55 bytes of runtime code) and calls `initialize`. A short name with an empty image and description is about 420 bytes of calldata, so it spends less BOT than shipping the contract again. The `bot` argument is recorded in `Launched`. Leave the Bot field blank and the connected wallet is used. Any address can call `deploy`. Paste a factory address if you already published one.

The token has `transfer`, `approve`, `transferFrom`, `burn`, and `setMeta` (admin only). Supply is minted to `admin`. There is no mint function.

## Layout

```text
src/routes/index.tsx    desk UI
src/lib/desk.ts         Clanker payload, calldata, wallet
src/lib/bytecode.ts     factory init code and deploy selector
contracts/KeelFactory.sol
```

## Run

```bash
npm install
npm run dev
```

`npm run dev` serves the app on port 8080. `npm run typecheck` and `npm run build` check the production build.
