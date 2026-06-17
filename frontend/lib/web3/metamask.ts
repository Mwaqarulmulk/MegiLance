// @AI-HINT: Dependency-free MetaMask / EIP-1193 helper. Talks to window.ethereum directly
// (no ethers/wagmi) so anyone with the MetaMask extension can pay. Used by the crypto
// deposit flow to connect, switch chain, and send a native-coin transfer.

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getProvider(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export function isMetaMaskInstalled(): boolean {
  const p = getProvider();
  return !!p && (p.isMetaMask ?? true);
}

/** Prompt the user to connect and return the selected account address (lowercased). */
export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('MetaMask is not installed. Install it from metamask.io to pay with crypto.');
  }
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet account was authorized.');
  }
  return accounts[0].toLowerCase();
}

/** Currently authorized account without prompting, or null. */
export async function getCurrentAccount(): Promise<string | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    const accounts = (await provider.request({ method: 'eth_accounts' })) as string[];
    return accounts && accounts.length > 0 ? accounts[0].toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function getChainId(): Promise<number> {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask is not installed.');
  const hex = (await provider.request({ method: 'eth_chainId' })) as string;
  return parseInt(hex, 16);
}

export interface ChainParams {
  chainIdHex: string;
  chainName: string;
  rpcUrl: string;
  blockExplorer: string;
  currencySymbol: string;
}

/** Ensure MetaMask is on the target chain, adding it if the wallet doesn't know it. */
export async function ensureChain(target: ChainParams): Promise<void> {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask is not installed.');
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: target.chainIdHex }],
    });
  } catch (err: any) {
    // 4902 = chain not added to MetaMask yet → add it, then it becomes active.
    if (err?.code === 4902 || /Unrecognized chain/i.test(err?.message || '')) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: target.chainIdHex,
          chainName: target.chainName,
          nativeCurrency: { name: target.currencySymbol, symbol: target.currencySymbol, decimals: 18 },
          rpcUrls: [target.rpcUrl],
          blockExplorerUrls: [target.blockExplorer],
        }],
      });
    } else {
      throw err;
    }
  }
}

/** Convert a decimal native-coin amount (e.g. 0.0123 ETH) to a hex wei value. */
export function toWeiHex(amount: number): string {
  // Use integer string math to avoid float precision loss on 18 decimals.
  const [whole, fraction = ''] = amount.toString().split('.');
  const fractionPadded = (fraction + '0'.repeat(18)).slice(0, 18);
  const weiStr = `${whole}${fractionPadded}`.replace(/^0+(?=\d)/, '');
  return '0x' + BigInt(weiStr).toString(16);
}

export interface SendPaymentArgs {
  from: string;
  to: string;
  amountCrypto: number;
}

/** Send a native-coin transfer and return the transaction hash. */
export async function sendPayment({ from, to, amountCrypto }: SendPaymentArgs): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask is not installed.');
  const txHash = (await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from, to, value: toWeiHex(amountCrypto) }],
  })) as string;
  return txHash;
}

// === ERC-20 (stablecoin) helpers ===

function pad32(hexNo0x: string): string {
  return hexNo0x.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

/** Convert a decimal token amount to integer base units (as bigint) for the given decimals. */
export function toTokenUnits(amount: number, decimals: number): bigint {
  const [whole, frac = ''] = amount.toString().split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  const digits = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, '') || '0';
  return BigInt(digits);
}

/** ABI-encode erc20 transfer(address,uint256). */
function encodeErc20Transfer(to: string, amountUnits: bigint): string {
  return '0xa9059cbb' + pad32(to) + pad32(amountUnits.toString(16));
}

export interface SendTokenArgs {
  from: string;
  token: string;       // ERC-20 contract address
  to: string;          // recipient (platform wallet)
  amount: number;      // human amount (e.g. 25 USDC)
  decimals: number;
}

/** Send an ERC-20 token transfer and return the transaction hash. */
export async function sendTokenTransfer({ from, token, to, amount, decimals }: SendTokenArgs): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask is not installed.');
  const data = encodeErc20Transfer(to, toTokenUnits(amount, decimals));
  const txHash = (await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from, to: token, value: '0x0', data }],
  })) as string;
  return txHash;
}

/** Read an ERC-20 balanceOf(owner) as a human number. Returns 0 on any failure. */
export async function readTokenBalance(token: string, owner: string, decimals: number): Promise<number> {
  const provider = getProvider();
  if (!provider) return 0;
  try {
    const data = '0x70a08231' + pad32(owner);
    const result = (await provider.request({
      method: 'eth_call',
      params: [{ to: token, data }, 'latest'],
    })) as string;
    if (!result || result === '0x') return 0;
    return Number(BigInt(result)) / 10 ** decimals;
  } catch {
    return 0;
  }
}

/** Read balanceOf against a specific chain's RPC (correct even before switching networks). */
export async function readTokenBalanceRpc(
  rpcUrl: string, token: string, owner: string, decimals: number,
): Promise<number> {
  try {
    const data = '0x70a08231' + pad32(owner);
    const resp = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'eth_call',
        params: [{ to: token, data }, 'latest'],
      }),
    });
    const json = await resp.json();
    const result = json?.result;
    if (!result || result === '0x') return 0;
    return Number(BigInt(result)) / 10 ** decimals;
  } catch {
    return 0;
  }
}

/** Mint test tokens from a mock token's public mint(address,uint256). Returns tx hash. */
export async function mintTestTokens({ from, token, to, amount, decimals }: SendTokenArgs): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask is not installed.');
  // mint(address,uint256) selector = 0x40c10f19
  const data = '0x40c10f19' + pad32(to) + pad32(toTokenUnits(amount, decimals).toString(16));
  const txHash = (await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from, to: token, value: '0x0', data }],
  })) as string;
  return txHash;
}

/** Subscribe to account/chain changes. Returns an unsubscribe function. */
export function onWalletChange(cb: () => void): () => void {
  const provider = getProvider();
  if (!provider?.on || !provider.removeListener) return () => {};
  const handler = () => cb();
  provider.on('accountsChanged', handler);
  provider.on('chainChanged', handler);
  return () => {
    provider.removeListener?.('accountsChanged', handler);
    provider.removeListener?.('chainChanged', handler);
  };
}
