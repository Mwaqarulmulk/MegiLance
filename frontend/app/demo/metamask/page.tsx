"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  isMetaMaskInstalled,
  connectWallet,
  getCurrentAccount,
  getChainId,
  ensureChain,
  sendTokenTransfer,
  mintTestTokens,
  readTokenBalanceRpc,
  onWalletChange,
  type ChainParams,
} from "@/lib/web3/metamask";
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Coins,
  Droplet,
  ArrowRight,
  Network,
  Zap,
} from "lucide-react";

const AMOY_CHAIN: ChainParams = {
  chainIdHex: "0x13882",
  chainName: "Polygon Amoy Testnet",
  rpcUrl: "https://rpc-amoy.polygon.technology",
  blockExplorer: "https://amoy.polygonscan.com",
  currencySymbol: "POL",
};

const MOCK_USDC = {
  address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
  decimals: 6,
  symbol: "USDC",
};

const RECEIVING_WALLET = "0x228d599d4c7e89194b94e9d65b1b4114870a4c34";

type Phase =
  | "idle"
  | "connecting"
  | "switching"
  | "minting"
  | "sending"
  | "success"
  | "error";

export default function MetaMaskDemoPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [amount, setAmount] = useState("10");
  const installed = isMetaMaskInstalled();

  useEffect(() => {
    getCurrentAccount().then(setAccount).catch(() => {});
    getChainId()
      .then(setCurrentChainId)
      .catch(() => {});
    const unsub = onWalletChange(() => {
      getCurrentAccount().then(setAccount).catch(() => {});
      getChainId().then(setCurrentChainId).catch(() => {});
    });
    return unsub;
  }, []);

  // Refresh balance when account/chain changes
  useEffect(() => {
    if (account && currentChainId === 80002) {
      readTokenBalanceRpc(
        AMOY_CHAIN.rpcUrl,
        MOCK_USDC.address,
        account,
        MOCK_USDC.decimals
      )
        .then(setBalance)
        .catch(() => setBalance(null));
    } else {
      setBalance(null);
    }
  }, [account, currentChainId]);

  const handleConnect = useCallback(async () => {
    setError(null);
    setPhase("connecting");
    try {
      const addr = await connectWallet();
      setAccount(addr);
      const chainId = await getChainId();
      setCurrentChainId(chainId);
      setPhase("idle");
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet.");
      setPhase("error");
    }
  }, []);

  const handleSwitchNetwork = useCallback(async () => {
    setError(null);
    setPhase("switching");
    try {
      await ensureChain(AMOY_CHAIN);
      const chainId = await getChainId();
      setCurrentChainId(chainId);
      setPhase("idle");
    } catch (e: any) {
      setError(e?.message || "Failed to switch network.");
      setPhase("error");
    }
  }, []);

  const handleMint = useCallback(async () => {
    if (!account) return;
    setError(null);
    setPhase("minting");
    try {
      await ensureChain(AMOY_CHAIN);
      await mintTestTokens({
        from: account,
        token: MOCK_USDC.address,
        to: account,
        amount: 1000,
        decimals: MOCK_USDC.decimals,
      });
      setTimeout(async () => {
        const b = await readTokenBalanceRpc(
          AMOY_CHAIN.rpcUrl,
          MOCK_USDC.address,
          account,
          MOCK_USDC.decimals
        );
        setBalance(b);
      }, 5000);
      setPhase("idle");
    } catch (e: any) {
      if (e?.code === 4001) {
        setError("Mint cancelled.");
      } else {
        setError(e?.message || "Faucet failed.");
      }
      setPhase("error");
    }
  }, [account]);

  const handlePay = useCallback(async () => {
    if (!account) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      setPhase("error");
      return;
    }
    if (balance !== null && balance < amt) {
      setError(`Insufficient balance. You have ${balance.toFixed(2)} USDC.`);
      setPhase("error");
      return;
    }

    setError(null);
    try {
      setPhase("switching");
      await ensureChain(AMOY_CHAIN);

      setPhase("sending");
      const hash = await sendTokenTransfer({
        from: account,
        token: MOCK_USDC.address,
        to: RECEIVING_WALLET,
        amount: amt,
        decimals: MOCK_USDC.decimals,
      });
      setTxHash(hash);
      setPhase("success");

      setTimeout(async () => {
        const b = await readTokenBalanceRpc(
          AMOY_CHAIN.rpcUrl,
          MOCK_USDC.address,
          account,
          MOCK_USDC.decimals
        );
        setBalance(b);
      }, 5000);
    } catch (e: any) {
      if (e?.code === 4001 || /user rejected/i.test(e?.message || "")) {
        setError("Transaction cancelled by user.");
      } else {
        setError(e?.message || "Payment failed.");
      }
      setPhase("error");
    }
  }, [account, amount, balance]);

  const busy = ["connecting", "switching", "minting", "sending"].includes(phase);
  const onAmoy = currentChainId === 80002;
  const explorerTx =
    txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Zap size={28} style={{ color: "#f59e0b" }} />
            MegiLance — MetaMask Payment Demo
          </h1>
          <p style={styles.subtitle}>
            Final Year Project Evaluation — Cryptocurrency Payment Gateway
          </p>
        </div>

        {/* Feature cards */}
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <Wallet size={20} style={{ color: "#f59e0b" }} />
            <span>Wallet Connection</span>
          </div>
          <div style={styles.featureCard}>
            <Network size={20} style={{ color: "#3b82f6" }} />
            <span>Multi-Network</span>
          </div>
          <div style={styles.featureCard}>
            <Coins size={20} style={{ color: "#10b981" }} />
            <span>ERC-20 Tokens</span>
          </div>
          <div style={styles.featureCard}>
            <ShieldCheck size={20} style={{ color: "#8b5cf6" }} />
            <span>On-Chain Verification</span>
          </div>
        </div>

        {!installed ? (
          <div style={styles.card}>
            <div style={styles.errorBox}>
              <AlertTriangle size={20} />
              <div>
                <strong>MetaMask not detected</strong>
                <p style={{ margin: "4px 0 0", opacity: 0.8 }}>
                  Install the MetaMask browser extension to continue.
                </p>
              </div>
            </div>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...styles.btn, ...styles.btnPrimary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Wallet size={16} /> Install MetaMask
            </a>
          </div>
        ) : (
          <div style={styles.card}>
            {/* Step 1: Connect */}
            <div style={styles.step}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>1</span>
                <span style={styles.stepTitle}>Connect Wallet</span>
                {account && <CheckCircle2 size={18} style={{ color: "#10b981" }} />}
              </div>
              {account ? (
                <div style={styles.addrBox}>
                  <div style={styles.addrDot} />
                  {account.slice(0, 6)}...{account.slice(-4)}
                  <span style={{ marginLeft: "auto", opacity: 0.5, fontSize: "0.75rem" }}>
                    Connected
                  </span>
                </div>
              ) : (
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onClick={handleConnect}
                  disabled={busy}
                >
                  {phase === "connecting" ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Wallet size={16} />
                  )}{" "}
                  Connect MetaMask
                </button>
              )}
            </div>

            {/* Step 2: Switch to Amoy Testnet */}
            <div style={styles.step}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>2</span>
                <span style={styles.stepTitle}>Switch to Polygon Amoy Testnet</span>
                {onAmoy && <CheckCircle2 size={18} style={{ color: "#10b981" }} />}
              </div>
              {!onAmoy && account ? (
                <button
                  style={{ ...styles.btn, ...styles.btnSecondary }}
                  onClick={handleSwitchNetwork}
                  disabled={busy}
                >
                  {phase === "switching" ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <ArrowRight size={16} />
                  )}{" "}
                  Switch Network
                </button>
              ) : onAmoy ? (
                <span style={{ color: "#10b981", fontSize: "0.85rem" }}>Polygon Amoy Testnet</span>
              ) : (
                <span style={{ opacity: 0.5, fontSize: "0.85rem" }}>Connect wallet first</span>
              )}
            </div>

            {/* Step 3: Get test USDC */}
            <div style={styles.step}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>3</span>
                <span style={styles.stepTitle}>Get Test USDC (Faucet)</span>
                {balance !== null && balance > 0 && (
                  <span style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: 600 }}>
                    {balance.toFixed(2)} USDC
                  </span>
                )}
              </div>
              {account && onAmoy ? (
                <button
                  style={{ ...styles.btn, ...styles.btnFaucet }}
                  onClick={handleMint}
                  disabled={busy}
                >
                  {phase === "minting" ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Droplet size={16} />
                  )}{" "}
                  Get 1,000 Test USDC
                </button>
              ) : (
                <span style={{ opacity: 0.5, fontSize: "0.85rem" }}>
                  {!account ? "Connect wallet first" : "Switch to Amoy first"}
                </span>
              )}
            </div>

            {/* Step 4: Make Payment */}
            <div style={styles.step}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>4</span>
                <span style={styles.stepTitle}>Send Payment</span>
              </div>
              {account && onAmoy ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount in USDC"
                      min="1"
                      step="1"
                      style={styles.input}
                      disabled={busy || phase === "success"}
                    />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>USDC</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                    To: {RECEIVING_WALLET.slice(0, 10)}...{RECEIVING_WALLET.slice(-6)}
                  </div>
                  {phase !== "success" ? (
                    <button
                      style={{
                        ...styles.btn,
                        ...styles.btnPay,
                        opacity: busy || !amount || parseFloat(amount) <= 0 ? 0.5 : 1,
                      }}
                      onClick={handlePay}
                      disabled={busy || !amount || parseFloat(amount) <= 0}
                    >
                      {phase === "sending" ? (
                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}{" "}
                      {phase === "sending"
                        ? "Confirm in MetaMask..."
                        : `Pay ${amount || 0} USDC`}
                    </button>
                  ) : (
                    <div style={styles.successBox}>
                      <CheckCircle2 size={20} />
                      <div>
                        <strong>Payment Sent Successfully!</strong>
                        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", opacity: 0.9 }}>
                          Transaction confirmed on Polygon Amoy Testnet.
                        </p>
                        {explorerTx && (
                          <a
                            href={explorerTx}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...styles.txLink, color: "inherit" }}
                          >
                            View on PolygonScan <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ opacity: 0.5, fontSize: "0.85rem" }}>
                  Complete steps 1-3 first
                </span>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Architecture diagram */}
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Architecture Overview</h3>
          <div style={styles.arch}>
            <div style={styles.archBox}>
              <strong>Frontend</strong>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Next.js + React + TypeScript</span>
            </div>
            <ArrowRight size={16} style={{ opacity: 0.3 }} />
            <div style={styles.archBox}>
              <strong>MetaMask</strong>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>EIP-1193 Provider</span>
            </div>
            <ArrowRight size={16} style={{ opacity: 0.3 }} />
            <div style={styles.archBox}>
              <strong>Blockchain</strong>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Polygon Amoy Testnet</span>
            </div>
            <ArrowRight size={16} style={{ opacity: 0.3 }} />
            <div style={styles.archBox}>
              <strong>Backend</strong>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>FastAPI + JSON-RPC Verify</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", opacity: 0.4, fontSize: "0.75rem", marginTop: "1rem" }}>
          MegiLance 2.0 — AI-Powered Freelancing Platform — FYP Demo
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    color: "#f1f5f9",
    padding: "2rem 1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: { maxWidth: 640, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "1.5rem" },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  subtitle: { margin: "0.5rem 0 0", opacity: 0.6, fontSize: "0.85rem" },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.5rem",
    marginBottom: "1.25rem",
  },
  featureCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.6rem 0.3rem",
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "0.7rem",
    fontWeight: 600,
    textAlign: "center",
  },
  card: {
    padding: "1.25rem",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "1rem",
  },
  step: {
    padding: "0.85rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "rgba(245,158,11,0.15)",
    color: "#f59e0b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  stepTitle: { fontSize: "0.9rem", fontWeight: 600 },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    padding: "0.55rem 1rem",
    borderRadius: 10,
    border: "none",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  btnPrimary: { background: "#f59e0b", color: "#000" },
  btnSecondary: { background: "rgba(59,130,246,0.15)", color: "#93bbff", border: "1px solid rgba(59,130,246,0.3)" },
  btnFaucet: { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px dashed rgba(16,185,129,0.4)" },
  btnPay: { background: "#10b981", color: "#000", width: "100%" },
  addrBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    borderRadius: 8,
    background: "rgba(255,255,255,0.05)",
    fontSize: "0.85rem",
    fontFamily: "monospace",
  },
  addrDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10b981",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "0.5rem 0.75rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#f1f5f9",
    fontSize: "0.9rem",
    fontWeight: 600,
    outline: "none",
  },
  successBox: {
    display: "flex",
    gap: "0.6rem",
    alignItems: "flex-start",
    padding: "0.75rem",
    borderRadius: 10,
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.25)",
    color: "#34d399",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.6rem 0.75rem",
    borderRadius: 8,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#f87171",
    fontSize: "0.82rem",
    marginTop: "0.5rem",
  },
  txLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    marginTop: "0.35rem",
    fontWeight: 600,
    fontSize: "0.8rem",
    textDecoration: "none",
  },
  arch: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  archBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.15rem",
    padding: "0.5rem 0.65rem",
    borderRadius: 8,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "0.8rem",
  },
};
