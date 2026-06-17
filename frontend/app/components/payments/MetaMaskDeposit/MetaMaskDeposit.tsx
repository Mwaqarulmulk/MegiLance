// @AI-HINT: MetaMask deposit flow — pick a stablecoin (USDC/USDT) or native coin, pick an
// EVM network, connect wallet, send the transfer, record + poll-verify on the backend, credit
// balance. Stablecoins are 1:1 USD ERC-20 transfers. Dependency-free (lib/web3/metamask).
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/app/components/atoms/Button/Button';
import { cryptoApi, type CryptoConfig, type CryptoChain, type CryptoToken } from '@/lib/api/payments';
import {
  isMetaMaskInstalled, connectWallet, getCurrentAccount, getChainId,
  ensureChain, sendPayment, sendTokenTransfer, mintTestTokens, readTokenBalanceRpc, onWalletChange,
} from '@/lib/web3/metamask';
import {
  Wallet, CheckCircle2, AlertTriangle, ExternalLink, Loader2, ShieldCheck, ChevronDown, Coins, Droplet,
} from 'lucide-react';
import styles from './MetaMaskDeposit.module.css';

type Phase = 'idle' | 'connecting' | 'switching' | 'sending' | 'verifying' | 'success' | 'error';
const NATIVE = '__native__';

interface Props {
  amountUsd: number;
  onSuccess?: (balance?: number) => void;
}

function short(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
}

const MetaMaskDeposit: React.FC<Props> = ({ amountUsd, onSuccess }) => {
  const [config, setConfig] = useState<CryptoConfig | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [assetKey, setAssetKey] = useState<string>('USDC'); // token symbol or NATIVE
  const [account, setAccount] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [minting, setMinting] = useState(false);
  const installed = isMetaMaskInstalled();

  useEffect(() => {
    let active = true;
    cryptoApi.getConfig().then((c) => {
      if (!active) return;
      setConfig(c);
      setSelectedChainId((prev) => prev ?? c.chain_id);
    }).catch(() => {});
    getCurrentAccount().then((a) => active && setAccount(a)).catch(() => {});
    const unsub = onWalletChange(() => getCurrentAccount().then(setAccount).catch(() => {}));
    return () => { active = false; unsub(); };
  }, []);

  const chains: CryptoChain[] = config?.supported_chains ?? [];
  const chain: CryptoChain | null = useMemo(
    () => chains.find((c) => c.chain_id === selectedChainId) ?? chains[0] ?? null,
    [chains, selectedChainId],
  );
  const tokens: CryptoToken[] = chain?.tokens ?? [];

  // When the chain changes, keep the chosen asset if still available, else default sensibly.
  useEffect(() => {
    if (!chain) return;
    const hasAsset = assetKey === NATIVE || tokens.some((t) => t.symbol === assetKey);
    if (!hasAsset) setAssetKey(tokens[0]?.symbol ?? NATIVE);
  }, [chain?.chain_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedToken: CryptoToken | null = useMemo(
    () => (assetKey === NATIVE ? null : tokens.find((t) => t.symbol === assetKey) ?? null),
    [tokens, assetKey],
  );
  const isToken = !!selectedToken;

  // Stablecoins are 1:1 with USD; native uses the live price.
  const payAmount = isToken
    ? amountUsd
    : chain?.price_usd && amountUsd > 0 ? amountUsd / chain.price_usd : 0;
  const paySymbol = isToken ? selectedToken!.symbol : chain?.currency_symbol ?? '';

  // Load the user's token balance for the selected chain/token.
  useEffect(() => {
    let active = true;
    if (account && selectedToken && chain) {
      readTokenBalanceRpc(chain.rpc_url, selectedToken.address, account, selectedToken.decimals)
        .then((b) => active && setTokenBalance(b)).catch(() => active && setTokenBalance(null));
    } else {
      setTokenBalance(null);
    }
    return () => { active = false; };
  }, [account, selectedToken?.address, chain?.rpc_url]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = useCallback(async () => {
    setError(null);
    setPhase('connecting');
    try {
      const addr = await connectWallet();
      setAccount(addr);
      setPhase('idle');
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet.');
      setPhase('error');
    }
  }, []);

  const ensureOnChain = useCallback(async (from: string) => {
    if (!chain) return;
    const current = await getChainId();
    if (current !== chain.chain_id) {
      await ensureChain({
        chainIdHex: chain.chain_id_hex,
        chainName: chain.chain_name,
        rpcUrl: chain.rpc_url,
        blockExplorer: chain.block_explorer,
        currencySymbol: chain.currency_symbol,
      });
    }
  }, [chain]);

  const handleFaucet = useCallback(async () => {
    if (!selectedToken || !chain || !account) return;
    setError(null);
    setMinting(true);
    try {
      await ensureOnChain(account);
      await mintTestTokens({
        from: account, token: selectedToken.address, to: account,
        amount: 1000, decimals: selectedToken.decimals,
      });
      // Give the node a moment, then refresh balance.
      setTimeout(() => {
        readTokenBalanceRpc(chain.rpc_url, selectedToken.address, account, selectedToken.decimals)
          .then(setTokenBalance).catch(() => {});
      }, 4000);
    } catch (e: any) {
      setError(e?.code === 4001 ? 'Mint cancelled.' : (e?.message || 'Faucet failed.'));
    } finally {
      setMinting(false);
    }
  }, [selectedToken, chain, account, ensureOnChain]);

  const handlePay = useCallback(async () => {
    if (!config?.enabled || !chain || !chain.receiving_address) {
      setError('Crypto payments are not configured yet.');
      setPhase('error');
      return;
    }
    if (!amountUsd || amountUsd <= 0) {
      setError('Enter a valid amount first.');
      setPhase('error');
      return;
    }
    if (!payAmount || payAmount <= 0) {
      setError(isToken ? 'Amount unavailable.' : 'Live price unavailable — try again shortly.');
      setPhase('error');
      return;
    }
    setError(null);
    try {
      let from = account;
      if (!from) {
        setPhase('connecting');
        from = await connectWallet();
        setAccount(from);
      }

      setPhase('switching');
      await ensureOnChain(from!);

      setPhase('sending');
      let hash: string;
      if (isToken) {
        hash = await sendTokenTransfer({
          from: from!, token: selectedToken!.address, to: chain.receiving_address,
          amount: amountUsd, decimals: selectedToken!.decimals,
        });
      } else {
        hash = await sendPayment({ from: from!, to: chain.receiving_address, amountCrypto: Number(payAmount.toFixed(8)) });
      }
      setTxHash(hash);

      setPhase('verifying');
      let result = await cryptoApi.deposit({
        tx_hash: hash,
        amount_usd: amountUsd,
        amount_crypto: Number(payAmount.toFixed(8)),
        chain_id: chain.chain_id,
        from_address: from!,
        currency: paySymbol,
        asset_type: isToken ? 'token' : 'native',
        token_address: isToken ? selectedToken!.address : undefined,
        token_decimals: isToken ? selectedToken!.decimals : undefined,
      });

      let attempts = 0;
      while (result.status === 'pending' && attempts < 30) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts += 1;
        try { result = await cryptoApi.verify(hash); } catch { /* keep polling */ }
      }

      if (result.status === 'failed') {
        setError('Transaction failed on-chain.');
        setPhase('error');
      } else {
        setPhase('success');
        onSuccess?.(result.balance);
      }
    } catch (e: any) {
      if (e?.code === 4001 || /user rejected/i.test(e?.message || '')) {
        setError('Transaction cancelled.');
      } else {
        setError(e?.message || 'Payment failed.');
      }
      setPhase('error');
    }
  }, [config, chain, account, amountUsd, payAmount, paySymbol, isToken, selectedToken, ensureOnChain, onSuccess]);

  if (!installed) {
    return (
      <div className={styles.wrap}>
        <div className={styles.notice}>
          <AlertTriangle size={18} />
          <span>MetaMask isn’t installed.</span>
        </div>
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className={styles.installLink}>
          <Button variant="primary" size="sm"><Wallet size={16} /> Install MetaMask</Button>
        </a>
      </div>
    );
  }

  const explorerTx = chain && txHash ? `${chain.block_explorer}/tx/${txHash}` : null;
  const busy = ['connecting', 'switching', 'sending', 'verifying'].includes(phase);
  const lowBalance = isToken && tokenBalance !== null && tokenBalance < amountUsd;

  return (
    <div className={styles.wrap}>
      {config && !config.enabled && (
        <div className={styles.notice}>
          <AlertTriangle size={18} />
          <span>Crypto deposits aren’t enabled on this environment yet.</span>
        </div>
      )}

      {/* Asset (stablecoin / native) selector */}
      <div className={styles.assetRow}>
        {tokens.map((t) => (
          <button
            key={t.symbol}
            type="button"
            className={`${styles.assetChip} ${assetKey === t.symbol ? styles.assetChipActive : ''}`}
            onClick={() => setAssetKey(t.symbol)}
            disabled={busy || phase === 'success'}
          >
            <Coins size={14} /> {t.symbol}
          </button>
        ))}
        {chain && (
          <button
            type="button"
            className={`${styles.assetChip} ${assetKey === NATIVE ? styles.assetChipActive : ''}`}
            onClick={() => setAssetKey(NATIVE)}
            disabled={busy || phase === 'success'}
          >
            {chain.currency_symbol}
          </button>
        )}
      </div>

      {/* Network selector */}
      <label className={styles.field}>
        <span className={styles.label}>Network</span>
        <div className={styles.selectWrap}>
          <select
            className={styles.select}
            value={selectedChainId ?? ''}
            disabled={busy || phase === 'success' || chains.length === 0}
            onChange={(e) => setSelectedChainId(Number(e.target.value))}
            aria-label="Select payment network"
          >
            {chains.map((c) => (
              <option key={c.chain_id} value={c.chain_id}>
                {c.chain_name}{c.is_testnet ? ' — Testnet' : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className={styles.selectIcon} />
        </div>
      </label>

      <div className={styles.row}>
        <span className={styles.label}>Wallet</span>
        <span className={styles.value}>{account ? short(account) : 'Not connected'}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>You pay</span>
        <span className={styles.value}>
          {payAmount > 0
            ? (isToken ? `${payAmount.toFixed(2)} ${paySymbol}` : `≈ ${payAmount.toFixed(6)} ${paySymbol}`)
            : '—'}
          <span className={styles.usd}> (${amountUsd || 0})</span>
        </span>
      </div>
      {isToken && account && (
        <div className={styles.row}>
          <span className={styles.label}>Your {paySymbol} balance</span>
          <span className={styles.value}>
            {tokenBalance === null ? '…' : tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
      {!isToken && chain?.price_usd ? (
        <div className={styles.rate}>
          1 {paySymbol} ≈ ${chain.price_usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      ) : null}

      {/* Faucet for mock/test tokens */}
      {isToken && selectedToken?.faucet && account && phase !== 'success' && (
        <button type="button" className={styles.faucetBtn} onClick={handleFaucet} disabled={minting}>
          {minting ? <Loader2 size={14} className={styles.spin} /> : <Droplet size={14} />}
          Get 1,000 test {paySymbol}
        </button>
      )}

      {phase === 'success' ? (
        <div className={styles.success}>
          <CheckCircle2 size={20} />
          <div>
            <strong>Payment submitted!</strong>
            <p>Your deposit is being confirmed on-chain and will reflect in your balance shortly.</p>
            {explorerTx && (
              <a href={explorerTx} target="_blank" rel="noopener noreferrer" className={styles.txLink}>
                View transaction <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      ) : !account ? (
        <Button variant="primary" size="sm" fullWidth onClick={handleConnect} isLoading={phase === 'connecting'}>
          <Wallet size={16} /> Connect MetaMask
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handlePay}
          disabled={busy || !amountUsd || amountUsd <= 0 || !(config?.enabled)}
        >
          {busy ? <Loader2 size={16} className={styles.spin} /> : <ShieldCheck size={16} />}
          {phase === 'switching' && 'Switching network…'}
          {phase === 'sending' && 'Confirm in MetaMask…'}
          {phase === 'verifying' && 'Confirming on-chain…'}
          {(phase === 'idle' || phase === 'error') && `Pay ${payAmount > 0 ? `${isToken ? payAmount.toFixed(2) : payAmount.toFixed(6)} ${paySymbol}` : ''}`}
          {phase === 'connecting' && 'Connecting…'}
        </Button>
      )}

      {lowBalance && phase !== 'success' && (
        <div className={styles.hint}>
          Not enough {paySymbol}.{selectedToken?.faucet ? ' Use the faucet above to get test tokens.' : ''}
        </div>
      )}
      {error && (
        <div className={styles.error}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <p className={styles.disclaimer}>
        Funds are sent on-chain to MegiLance’s verified wallet. Network gas fees are paid by your wallet.
      </p>
    </div>
  );
};

export default MetaMaskDeposit;
