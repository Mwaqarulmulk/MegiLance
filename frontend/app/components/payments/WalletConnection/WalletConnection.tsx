// @AI-HINT: Shared wallet connection status component — shows MetaMask connection state,
// connected address, network, and balance. Used in both client and freelancer portals.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Button from '@/app/components/atoms/Button/Button';
import {
  isMetaMaskInstalled, connectWallet, getCurrentAccount, getChainId,
  onWalletChange, readTokenBalanceRpc,
} from '@/lib/web3/metamask';
import { Wallet, CheckCircle2, AlertTriangle, ExternalLink, Loader2, Copy, RefreshCw } from 'lucide-react';
import styles from './WalletConnection.module.css';

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean, address: string | null) => void;
  showBalance?: boolean;
  tokenAddress?: string;
  tokenDecimals?: number;
  rpcUrl?: string;
  compact?: boolean;
}

function shortAddr(addr: string): string {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnectionChange,
  showBalance = false,
  tokenAddress,
  tokenDecimals = 6,
  rpcUrl,
  compact = false,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isMetaMaskInstalled());
    const t = setTimeout(() => {
      setInstalled(isMetaMaskInstalled());
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const detectAccount = useCallback(async () => {
    try {
      const addr = await getCurrentAccount();
      setAccount(addr);
      if (addr) {
        const cid = await getChainId();
        setChainId(cid);
      }
    } catch {
      setAccount(null);
    }
  }, []);

  useEffect(() => {
    detectAccount();
    const unsub = onWalletChange(() => {
      detectAccount();
    });
    return () => unsub();
  }, [detectAccount]);

  useEffect(() => {
    onConnectionChange?.(!!account, account);
  }, [account, onConnectionChange]);

  useEffect(() => {
    if (!account || !tokenAddress || !rpcUrl) {
      setTokenBalance(null);
      return;
    }
    let active = true;
    readTokenBalanceRpc(rpcUrl, tokenAddress, account, tokenDecimals)
      .then((b) => active && setTokenBalance(b))
      .catch(() => active && setTokenBalance(null));
    return () => { active = false; };
  }, [account, tokenAddress, rpcUrl, tokenDecimals]);

  const handleConnect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      await connectWallet();
      await detectAccount();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to connect wallet';
      setError(msg);
    } finally {
      setConnecting(false);
    }
  }, [detectAccount]);

  const handleCopy = useCallback(() => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [account]);

  if (!installed) {
    return (
      <div className={styles.container}>
        <div className={styles.notice}>
          <AlertTriangle size={16} />
          <span>MetaMask not detected</span>
        </div>
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
          <Button variant="primary" size="sm">
            <Wallet size={14} /> Install MetaMask
          </Button>
        </a>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={styles.compactWrap}>
        {account ? (
          <div className={styles.connectedBadge}>
            <CheckCircle2 size={14} className={styles.connectedIcon} />
            <span className={styles.addressText}>{shortAddr(account)}</span>
            <button className={styles.copyBtn} onClick={handleCopy} title="Copy address">
              {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
            </button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={handleConnect} isLoading={connecting}>
            <Wallet size={14} /> Connect
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Wallet size={18} />
        <span className={styles.title}>Wallet Connection</span>
      </div>

      {account ? (
        <div className={styles.connectedSection}>
          <div className={styles.statusRow}>
            <CheckCircle2 size={16} className={styles.connectedIcon} />
            <span className={styles.connectedText}>Connected</span>
          </div>
          <div className={styles.addressRow}>
            <span className={styles.addressLabel}>Address</span>
            <div className={styles.addressValue}>
              <span className={styles.addressText}>{shortAddr(account)}</span>
              <button className={styles.copyBtn} onClick={handleCopy} title="Copy full address">
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              </button>
              {chainId && (
                <a
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkBtn}
                  title="View on explorer"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
          {chainId && (
            <div className={styles.statusRow}>
              <span className={styles.label}>Network</span>
              <span className={styles.value}>Chain {chainId}</span>
            </div>
          )}
          {showBalance && tokenBalance !== null && (
            <div className={styles.statusRow}>
              <span className={styles.label}>Token Balance</span>
              <span className={styles.value}>{tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={detectAccount} className={styles.refreshBtn}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      ) : (
        <div className={styles.disconnectedSection}>
          <p className={styles.hint}>Connect your MetaMask wallet to deposit funds or receive payments.</p>
          {error && (
            <div className={styles.error}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleConnect}
            isLoading={connecting}
          >
            <Wallet size={16} /> Connect MetaMask
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
