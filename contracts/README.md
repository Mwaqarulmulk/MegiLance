# Crypto payments — stablecoin setup (USDC/USDT via MetaMask)

MegiLance accepts stablecoin deposits (USDC/USDT) and native coins (ETH/BNB/POL) through
MetaMask, across 10 EVM networks. The flow:

```
Client → pick USDC/USDT → Connect MetaMask → choose network (Polygon / BNB / Base …)
       → wallet transfer → tx signed → backend verifies the Transfer event
       → MegiLance credits wallet/escrow balance → freelancer payout
```

## Out-of-the-box

- **Mainnets** (Ethereum, Polygon, BNB, Base, Arbitrum, OP): real USDC/USDT contracts are
  already configured. Nothing to deploy.
- **Testnets** (Polygon Amoy, Sepolia): Circle's official **test USDC** is pre-configured.
  Get free test USDC at <https://faucet.circle.com> (pick the matching network).

The platform receiving wallet is `CRYPTO_WALLET_ADDRESS` in `backend/.env` (one EVM address
works on every EVM chain). The default network is `CRYPTO_NETWORK` (currently `AMOY`).

## Option: deploy your own Mock USDC (instant in-app faucet)

If you want a token with a **one-click faucet inside the app** (no external faucet site),
deploy `MockUSDC.sol`. It shows in the UI as real "USDC".

### Deploy with Remix (no toolchain, ~2 minutes)

1. Open <https://remix.ethereum.org>, create a file `MockUSDC.sol`, paste this folder's contract.
2. **Compile** tab → compile with Solidity 0.8.20+.
3. **Deploy & run** tab → Environment = **Injected Provider - MetaMask**.
4. In MetaMask, switch to your testnet (e.g. Polygon Amoy). Click **Deploy**, confirm.
5. Copy the deployed contract address.

### Wire it into the backend

Set in `backend/.env` (chain id `80002` = Polygon Amoy; `11155111` = Sepolia):

```env
STABLECOIN_TOKENS={"80002":{"USDC":{"address":"0xYourMockAddress","decimals":6,"faucet":true}}}
```

`"faucet": true` makes the app show a **“Get 1,000 test USDC”** button that mints tokens to the
user's wallet — so anyone can test paying without hunting for a faucet.

Restart the backend. Pick USDC + Polygon Amoy in the wallet deposit modal — done.

## How verification works (no funds credited without proof)

The backend never trusts the client. On `POST /crypto/deposit` (and `GET /crypto/verify/{tx}`)
it calls the chain's JSON-RPC `eth_getTransactionReceipt` and:

- **Stablecoin (ERC-20):** requires a `Transfer(from, to, value)` log emitted by the token
  contract, with `to == CRYPTO_WALLET_ADDRESS`; credits the actual on-chain token amount.
- **Native coin:** requires `receipt.to == CRYPTO_WALLET_ADDRESS` and success status.

Crediting is idempotent on the transaction hash, so polling never double-credits.
