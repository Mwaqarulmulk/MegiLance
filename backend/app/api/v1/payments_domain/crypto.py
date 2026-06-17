# @AI-HINT: Crypto (MetaMask / EVM) payments router — config, record on-chain deposit,
# verify transaction receipt via JSON-RPC and credit the user's wallet balance.
# Native-coin transfers (ETH/BNB/POL) sent from MetaMask to the platform address.
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import json
import logging
import requests

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.core.config import get_settings
from app.db.turso_http import execute_query, parse_rows
from app.services.wallet_service import ensure_wallet_tables

router = APIRouter()


# EVM chain registry — public RPC + explorer so verification works without extra config.
# All MetaMask-supported EVM networks; one EVM receiving address works across all of them.
# (Non-EVM chains like Bitcoin/Solana/Tron can't be sent via the MetaMask window.ethereum
# provider, so they are intentionally not listed here.)
CHAINS: dict[int, dict] = {
    1: {
        "name": "Ethereum", "symbol": "ETH", "coingecko": "ethereum", "testnet": False,
        "rpc": "https://eth.llamarpc.com", "explorer": "https://etherscan.io",
    },
    10: {
        "name": "OP Mainnet", "symbol": "ETH", "coingecko": "ethereum", "testnet": False,
        "rpc": "https://mainnet.optimism.io", "explorer": "https://optimistic.etherscan.io",
    },
    56: {
        "name": "BNB Chain", "symbol": "BNB", "coingecko": "binancecoin", "testnet": False,
        "rpc": "https://bsc-dataseed.binance.org", "explorer": "https://bscscan.com",
    },
    137: {
        "name": "Polygon", "symbol": "POL", "coingecko": "polygon-ecosystem-token", "testnet": False,
        "rpc": "https://polygon-rpc.com", "explorer": "https://polygonscan.com",
    },
    8453: {
        "name": "Base", "symbol": "ETH", "coingecko": "ethereum", "testnet": False,
        "rpc": "https://mainnet.base.org", "explorer": "https://basescan.org",
    },
    42161: {
        "name": "Arbitrum One", "symbol": "ETH", "coingecko": "ethereum", "testnet": False,
        "rpc": "https://arb1.arbitrum.io/rpc", "explorer": "https://arbiscan.io",
    },
    59144: {
        "name": "Linea", "symbol": "ETH", "coingecko": "ethereum", "testnet": False,
        "rpc": "https://rpc.linea.build", "explorer": "https://lineascan.build",
    },
    80002: {
        "name": "Polygon Amoy Testnet", "symbol": "POL", "coingecko": "polygon-ecosystem-token", "testnet": True,
        "rpc": "https://rpc-amoy.polygon.technology", "explorer": "https://amoy.polygonscan.com",
    },
    11155111: {
        "name": "Sepolia Testnet", "symbol": "ETH", "coingecko": "ethereum", "testnet": True,
        "rpc": "https://ethereum-sepolia-rpc.publicnode.com", "explorer": "https://sepolia.etherscan.io",
    },
    97: {
        "name": "BSC Testnet", "symbol": "tBNB", "coingecko": "binancecoin", "testnet": True,
        "rpc": "https://data-seed-prebsc-1-s1.binance.org:8545", "explorer": "https://testnet.bscscan.com",
    },
}

_NETWORK_TO_CHAIN = {
    "ETH": 1, "ETHEREUM": 1, "MAINNET": 1,
    "OP": 10, "OPTIMISM": 10,
    "BSC": 56, "BNB": 56, "BINANCE": 56,
    "POLYGON": 137, "MATIC": 137, "POL": 137,
    "BASE": 8453,
    "ARBITRUM": 42161, "ARB": 42161,
    "LINEA": 59144,
    "AMOY": 80002, "POLYGON_AMOY": 80002,
    "SEPOLIA": 11155111,
    "BSC_TESTNET": 97, "BSCTESTNET": 97,
}

# Minimum confirmations not enforced via RPC here; receipt presence + success is required.
_price_cache: dict[str, tuple[float, float]] = {}  # coingecko_id -> (price_usd, fetched_at_epoch)
_PRICE_TTL = 60.0

# ERC-20 Transfer(address,address,uint256) event topic (keccak256 of the signature).
_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

# Built-in stablecoin (ERC-20) registry per chain. Mainnet = real circulating contracts;
# testnets = Circle's official test USDC (public faucet at faucet.circle.com). Override or
# add a mock token via the STABLECOIN_TOKENS env (e.g. your deployed MockUSDC with a faucet).
TOKENS: dict[int, dict[str, dict]] = {
    1: {  # Ethereum
        "USDC": {"address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "decimals": 6},
        "USDT": {"address": "0xdAC17F958D2ee523a2206206994597C13D831ec7", "decimals": 6},
    },
    137: {  # Polygon
        "USDC": {"address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", "decimals": 6},
        "USDT": {"address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "decimals": 6},
    },
    56: {  # BNB Chain (BSC stablecoins use 18 decimals)
        "USDC": {"address": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", "decimals": 18},
        "USDT": {"address": "0x55d398326f99059fF775485246999027B3197955", "decimals": 18},
    },
    8453: {  # Base
        "USDC": {"address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "decimals": 6},
    },
    42161: {  # Arbitrum One
        "USDC": {"address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", "decimals": 6},
        "USDT": {"address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", "decimals": 6},
    },
    10: {  # OP Mainnet
        "USDC": {"address": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", "decimals": 6},
        "USDT": {"address": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", "decimals": 6},
    },
    # --- Testnets (Circle official test USDC; mintable via faucet.circle.com) ---
    80002: {  # Polygon Amoy
        "USDC": {"address": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", "decimals": 6},
    },
    11155111: {  # Sepolia
        "USDC": {"address": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", "decimals": 6},
    },
}


def _tokens_for(chain_id: int) -> dict[str, dict]:
    """Stablecoin tokens for a chain, with STABLECOIN_TOKENS env overrides merged in."""
    base = {k: dict(v) for k, v in TOKENS.get(chain_id, {}).items()}
    settings = get_settings()
    raw = settings.STABLECOIN_TOKENS
    if raw:
        try:
            override = json.loads(raw)
            for sym, meta in (override.get(str(chain_id)) or {}).items():
                base[sym.upper()] = meta
        except Exception as e:
            logger.warning(f"Invalid STABLECOIN_TOKENS json: {e}")
    return base


class CryptoDepositRequest(BaseModel):
    tx_hash: str
    amount_usd: float
    amount_crypto: float
    chain_id: int
    from_address: Optional[str] = None
    currency: Optional[str] = None
    # ERC-20 stablecoin payments (USDC/USDT). When asset_type == 'token' the verifier
    # parses the Transfer event instead of the native value.
    asset_type: str = "native"  # 'native' | 'token'
    token_address: Optional[str] = None
    token_decimals: Optional[int] = None


def _resolve_chain_id() -> int:
    settings = get_settings()
    if settings.CRYPTO_CHAIN_ID:
        return int(settings.CRYPTO_CHAIN_ID)
    return _NETWORK_TO_CHAIN.get((settings.CRYPTO_NETWORK or "BSC").upper(), 56)


def _chain(chain_id: int) -> dict:
    return CHAINS.get(chain_id, CHAINS[56])


def _rpc_url(chain_id: int) -> str:
    settings = get_settings()
    return settings.CRYPTO_RPC_URL or _chain(chain_id).get("rpc")


def _get_prices_usd(coingecko_ids: list[str]) -> dict[str, Optional[float]]:
    """Spot price (USD) for several native coins in one cached, batched call."""
    import time
    now = time.time()
    out: dict[str, Optional[float]] = {}
    missing: list[str] = []
    for cid in set(coingecko_ids):
        cached = _price_cache.get(cid)
        if cached and (now - cached[1]) < _PRICE_TTL:
            out[cid] = cached[0]
        else:
            missing.append(cid)

    if missing:
        try:
            resp = requests.get(
                "https://api.coingecko.com/api/v3/simple/price",
                params={"ids": ",".join(missing), "vs_currencies": "usd"},
                timeout=8,
            )
            resp.raise_for_status()
            data = resp.json()
            for cid in missing:
                price = float(data.get(cid, {}).get("usd", 0)) or None
                if price:
                    _price_cache[cid] = (price, now)
                out[cid] = price
        except Exception as e:
            logger.warning(f"crypto price fetch failed for {missing}: {e}")
            for cid in missing:
                cached = _price_cache.get(cid)
                out[cid] = cached[0] if cached else None
    return out


def _get_price_usd(coingecko_id: str) -> Optional[float]:
    """Spot price of one native coin in USD (cached)."""
    return _get_prices_usd([coingecko_id]).get(coingecko_id)


def _rpc_call(chain_id: int, method: str, params: list):
    url = _rpc_url(chain_id)
    resp = requests.post(
        url,
        json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params},
        timeout=12,
    )
    resp.raise_for_status()
    return resp.json().get("result")


@router.get("/config")
async def crypto_config():
    """Public config the frontend needs to render the MetaMask payment flow.

    Returns every supported EVM network so the user can pick one in the UI; the same
    receiving address is used across all EVM chains (override per-chain via env if needed).
    """
    settings = get_settings()
    default_chain_id = _resolve_chain_id()
    address = settings.CRYPTO_WALLET_ADDRESS or ""

    prices = _get_prices_usd([c["coingecko"] for c in CHAINS.values()])

    chains = []
    for cid, c in CHAINS.items():
        tokens = _tokens_for(cid)
        chains.append({
            "chain_id": cid,
            "chain_id_hex": hex(cid),
            "chain_name": c["name"],
            "currency_symbol": c["symbol"],
            "rpc_url": _rpc_url(cid),
            "block_explorer": c["explorer"],
            "price_usd": prices.get(c["coingecko"]),
            "is_testnet": c.get("testnet", False),
            "receiving_address": address,
            # Stablecoins available on this chain (1 token ≈ $1).
            "tokens": [
                {
                    "symbol": sym,
                    "address": meta["address"],
                    "decimals": meta.get("decimals", 6),
                    "faucet": bool(meta.get("faucet", False)),
                }
                for sym, meta in tokens.items()
            ],
        })
    # Mainnets first, then testnets; stable order otherwise.
    chains.sort(key=lambda x: (x["is_testnet"], x["chain_id"]))

    default_chain = _chain(default_chain_id)
    return {
        "enabled": bool(address),
        "receiving_address": address,
        # Default/primary chain (back-compat top-level fields):
        "chain_id": default_chain_id,
        "chain_id_hex": hex(default_chain_id),
        "chain_name": default_chain["name"],
        "currency_symbol": default_chain["symbol"],
        "rpc_url": _rpc_url(default_chain_id),
        "block_explorer": default_chain["explorer"],
        "price_usd": prices.get(default_chain["coingecko"]),
        # All selectable networks:
        "supported_chains": chains,
        "min_deposit_usd": 1,
        "max_deposit_usd": 10000,
    }


@router.post("/deposit")
async def record_crypto_deposit(request: CryptoDepositRequest, current_user=Depends(get_current_user)):
    """Record a MetaMask-submitted transaction as a pending deposit, then verify it.

    Balance is credited only once the on-chain receipt confirms success — this call is
    idempotent on the transaction hash so retries/polling never double-credit.
    """
    settings = get_settings()
    if not settings.CRYPTO_WALLET_ADDRESS:
        raise HTTPException(status_code=503, detail="Crypto payments are not configured")
    if request.amount_usd <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if request.amount_usd > 10000:
        raise HTTPException(status_code=400, detail="Maximum single deposit is $10,000")

    tx_hash = (request.tx_hash or "").strip().lower()
    if not tx_hash.startswith("0x") or len(tx_hash) != 66:
        raise HTTPException(status_code=400, detail="Invalid transaction hash")

    ensure_wallet_tables()

    # Idempotency — one wallet transaction per tx hash.
    existing = execute_query(
        "SELECT id, status FROM wallet_transactions WHERE reference_id = ? AND type = 'deposit'",
        [tx_hash],
    )
    existing_rows = parse_rows(existing)
    if not existing_rows:
        now = datetime.now(timezone.utc).isoformat()
        chain = _chain(request.chain_id)
        asset_type = (request.asset_type or "native").lower()
        symbol = request.currency or ("USDC" if asset_type == "token" else chain["symbol"])
        meta = json.dumps({
            "tx_hash": tx_hash,
            "chain_id": request.chain_id,
            "amount_crypto": request.amount_crypto,
            "currency": symbol,
            "from_address": request.from_address,
            "method": "metamask",
            "asset_type": asset_type,
            "token_address": (request.token_address or "").lower() or None,
            "token_decimals": request.token_decimals,
        })
        label = (
            f"{symbol} deposit via MetaMask"
            if asset_type == "token"
            else f"Crypto deposit via MetaMask ({request.amount_crypto} {symbol})"
        )
        execute_query(
            """INSERT INTO wallet_transactions
               (user_id, type, amount, currency, status, description, reference_id, metadata, created_at)
               VALUES (?, 'deposit', ?, 'USD', 'pending', ?, ?, ?, ?)""",
            [current_user.id, request.amount_usd, label, tx_hash, meta, now],
        )

    return await _verify_and_credit(tx_hash, request.chain_id, current_user)


@router.get("/verify/{tx_hash}")
async def verify_crypto_deposit(tx_hash: str, current_user=Depends(get_current_user)):
    """Re-check an on-chain transaction and credit the wallet if newly confirmed."""
    tx_hash = (tx_hash or "").strip().lower()
    row = parse_rows(execute_query(
        "SELECT id, metadata, status FROM wallet_transactions WHERE reference_id = ? AND user_id = ? AND type = 'deposit'",
        [tx_hash, current_user.id],
    ))
    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")
    chain_id = _resolve_chain_id()
    try:
        chain_id = int(json.loads(row[0].get("metadata") or "{}").get("chain_id", chain_id))
    except Exception:
        pass
    return await _verify_and_credit(tx_hash, chain_id, current_user)


def _addr_eq(a: Optional[str], b: Optional[str]) -> bool:
    return bool(a) and bool(b) and a.lower() == b.lower()


def _topic_to_address(topic: str) -> str:
    """An indexed address topic is 32 bytes; the address is the low 20 bytes."""
    t = topic.lower().replace("0x", "")
    return "0x" + t[-40:]


def _validate_token_transfer(receipt: dict, token_address: str, expected_to: str) -> Optional[int]:
    """Return the raw amount of the ERC-20 Transfer to expected_to, or None if absent."""
    for log in receipt.get("logs", []) or []:
        if not _addr_eq(log.get("address"), token_address):
            continue
        topics = log.get("topics") or []
        if len(topics) < 3 or topics[0].lower() != _TRANSFER_TOPIC:
            continue
        if not _addr_eq(_topic_to_address(topics[2]), expected_to):
            continue
        data = (log.get("data") or "0x0")
        try:
            return int(data, 16)
        except ValueError:
            return None
    return None


async def _verify_and_credit(tx_hash: str, chain_id: int, current_user) -> dict:
    """Verify receipt via JSON-RPC; on first success, atomically credit the balance.

    For native transfers the receipt's `to` must be the platform wallet. For ERC-20
    stablecoins (USDC/USDT) we instead require a Transfer event from the token contract
    to the platform wallet, and credit the on-chain token amount (1 token ≈ $1).
    """
    settings = get_settings()
    row = parse_rows(execute_query(
        "SELECT id, amount, status, metadata FROM wallet_transactions WHERE reference_id = ? AND user_id = ? AND type = 'deposit'",
        [tx_hash, current_user.id],
    ))
    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")
    txn = row[0]

    if txn["status"] == "completed":
        bal = parse_rows(execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id]))
        return {"status": "completed", "confirmed": True, "credited": True,
                "balance": bal[0]["account_balance"] if bal else 0}

    meta = {}
    try:
        meta = json.loads(txn.get("metadata") or "{}")
    except Exception:
        pass
    asset_type = (meta.get("asset_type") or "native").lower()
    token_address = meta.get("token_address")
    token_decimals = int(meta.get("token_decimals") or 6)
    expected = (settings.CRYPTO_WALLET_ADDRESS or "").lower()

    # Query the chain for a receipt.
    try:
        receipt = _rpc_call(chain_id, "eth_getTransactionReceipt", [tx_hash])
    except Exception as e:
        logger.warning(f"RPC verify failed for {tx_hash}: {e}")
        return {"status": "pending", "confirmed": False, "credited": False, "detail": "Verification pending"}

    if not receipt:
        return {"status": "pending", "confirmed": False, "credited": False}

    success = str(receipt.get("status", "")).lower() in ("0x1", "1")
    if not success:
        execute_query("UPDATE wallet_transactions SET status = 'failed' WHERE id = ?", [txn["id"]])
        return {"status": "failed", "confirmed": True, "credited": False}

    credit_amount = float(txn["amount"])  # recorded USD amount (default)

    if asset_type == "token":
        if not token_address:
            raise HTTPException(status_code=400, detail="Missing token address for verification")
        raw = _validate_token_transfer(receipt, token_address, expected)
        if raw is None:
            execute_query("UPDATE wallet_transactions SET status = 'failed' WHERE id = ?", [txn["id"]])
            raise HTTPException(status_code=400, detail="No matching stablecoin transfer to platform wallet")
        # Stablecoins are ~1:1 with USD — credit the actual on-chain amount.
        credit_amount = raw / (10 ** token_decimals)
    else:
        to_addr = (receipt.get("to") or "").lower()
        if expected and to_addr and to_addr != expected:
            execute_query("UPDATE wallet_transactions SET status = 'failed' WHERE id = ?", [txn["id"]])
            raise HTTPException(status_code=400, detail="Transaction recipient does not match platform wallet")

    # Confirmed & valid — credit once. Guard on status to stay idempotent under concurrent polls.
    now = datetime.now(timezone.utc).isoformat()
    upd = execute_query(
        "UPDATE wallet_transactions SET status = 'completed', amount = ?, completed_at = ? WHERE id = ? AND status != 'completed'",
        [credit_amount, now, txn["id"]],
    )
    if upd and upd.get("rows_affected", 0) > 0:
        execute_query(
            "UPDATE users SET account_balance = COALESCE(account_balance, 0) + ? WHERE id = ?",
            [credit_amount, current_user.id],
        )

    bal = parse_rows(execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id]))
    return {"status": "completed", "confirmed": True, "credited": True,
            "balance": bal[0]["account_balance"] if bal else 0}
