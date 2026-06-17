// @AI-HINT: Payments, wallet, invoices, escrow, refunds, payout methods, multi-currency API
import { apiFetch } from "./core";
import type { ResourceId } from "./core";
import type {
  PaymentFundData,
  PaymentWithdrawData,
  PaymentIntentData,
  PayoutMethodCreateData,
} from "@/types/api";

export const paymentsApi = {
  list: (page = 1, pageSize = 50) =>
    apiFetch(`/payments?page=${page}&page_size=${pageSize}`),

  get: (paymentId: ResourceId) => apiFetch(`/payments/${paymentId}`),

  addFunds: (data: PaymentFundData) =>
    apiFetch("/payments/add-funds", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  withdraw: (data: PaymentWithdrawData) =>
    apiFetch("/withdrawals", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createIntent: (data: PaymentIntentData) =>
    apiFetch("/payments/create-payment-intent", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const paymentMethodsApi = {
  list: () => apiFetch("/payment-methods"),
};

export const walletApi = {
  get: () => apiFetch("/wallet"),

  deposit: (data: {
    amount: number;
    method: "bank_transfer" | "crypto" | "binance" | "card";
    currency?: string;
  }) =>
    apiFetch("/wallet/deposit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  withdraw: (data: {
    amount: number;
    method: "bank_transfer" | "paypal" | "crypto" | "wise";
    destination: string;
    currency?: string;
  }) =>
    apiFetch("/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTransactions: (page = 1, pageSize = 20) =>
    apiFetch(`/wallet/transactions?page=${page}&page_size=${pageSize}`),

  analytics: (period: "7d" | "30d" | "90d" | "1y" | "all" = "30d") =>
    apiFetch(`/wallet/analytics?period=${period}`),

  getPendingWithdrawals: () => apiFetch("/wallet/withdrawals/pending"),

  cancelWithdrawal: (referenceId: string) =>
    apiFetch(`/wallet/withdrawals/${referenceId}/cancel`, { method: "POST" }),
};

export interface CryptoToken {
  symbol: string;       // e.g. "USDC"
  address: string;      // ERC-20 contract address
  decimals: number;
  faucet: boolean;      // true when the token exposes a public mint() faucet (mock/test tokens)
}

export interface CryptoChain {
  chain_id: number;
  chain_id_hex: string;
  chain_name: string;
  currency_symbol: string;
  rpc_url: string;
  block_explorer: string;
  price_usd: number | null;
  is_testnet: boolean;
  receiving_address: string;
  tokens: CryptoToken[];
}

export interface CryptoConfig {
  enabled: boolean;
  receiving_address: string;
  chain_id: number;
  chain_id_hex: string;
  chain_name: string;
  currency_symbol: string;
  rpc_url: string;
  block_explorer: string;
  price_usd: number | null;
  supported_chains: CryptoChain[];
  min_deposit_usd: number;
  max_deposit_usd: number;
}

export interface CryptoDepositResult {
  status: "pending" | "completed" | "failed";
  confirmed: boolean;
  credited: boolean;
  balance?: number;
  detail?: string;
}

// Crypto / MetaMask payments — config + record on-chain deposit + verify receipt.
export const cryptoApi = {
  getConfig: () => apiFetch<CryptoConfig>("/crypto/config"),

  deposit: (data: {
    tx_hash: string;
    amount_usd: number;
    amount_crypto: number;
    chain_id: number;
    from_address?: string;
    currency?: string;
    asset_type?: "native" | "token";
    token_address?: string;
    token_decimals?: number;
  }) =>
    apiFetch<CryptoDepositResult>("/crypto/deposit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verify: (txHash: string) =>
    apiFetch<CryptoDepositResult>(`/crypto/verify/${txHash}`, {}, true),
};

export const invoicesApi = {
  create: (data: {
    contract_id?: number;
    items?: { description: string; amount: number }[];
    due_date?: string;
    notes?: string;
    [key: string]: unknown;
  }) =>
    apiFetch("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (filters?: { status?: string; page?: number; page_size?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/invoices?${params}`);
  },

  get: (invoiceId: ResourceId) => apiFetch(`/invoices/${invoiceId}`),

  update: (
    invoiceId: ResourceId,
    data: { due_date?: string; notes?: string; status?: string },
  ) =>
    apiFetch(`/invoices/${invoiceId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (invoiceId: ResourceId) =>
    apiFetch(`/invoices/${invoiceId}`, { method: "DELETE" }),

  markAsPaid: (invoiceId: ResourceId, paymentId?: ResourceId) =>
    apiFetch(`/invoices/${invoiceId}/pay`, {
      method: "POST",
      body: JSON.stringify(paymentId ? { payment_id: paymentId } : {}),
    }),

  send: (invoiceId: ResourceId) =>
    apiFetch(`/invoices/${invoiceId}/send`, { method: "POST" }),
};

export const escrowApi = {
  list: (page = 1, pageSize = 20) =>
    apiFetch(`/escrow?page=${page}&page_size=${pageSize}`),

  get: (escrowId: ResourceId) => apiFetch(`/escrow/${escrowId}`),

  fund: (data: { contract_id: number; amount: number; description?: string }) =>
    apiFetch("/escrow/fund", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  release: (escrowId: ResourceId, data: { amount: number; notes?: string }) =>
    apiFetch(`/escrow/${escrowId}/release`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refund: (escrowId: ResourceId, data: { amount?: number; reason: string }) =>
    apiFetch(`/escrow/${escrowId}/refund`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBalance: () => apiFetch("/escrow/balance"),
};

export const refundsApi = {
  list: (filter?: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (filter) params.append("status", filter);
    return apiFetch(`/refunds?${params}`);
  },

  request: (
    data: { payment_id: number; reason: string; amount?: number } | FormData,
  ) =>
    apiFetch("/refunds", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  get: (refundId: ResourceId) => apiFetch(`/refunds/${refundId}`),

  approve: (refundId: ResourceId, data?: { admin_notes?: string }) =>
    apiFetch(`/refunds/${refundId}/approve`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  reject: (refundId: ResourceId, reason: string) =>
    apiFetch(`/refunds/${refundId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};

export const payoutMethodsApi = {
  create: (data: PayoutMethodCreateData) =>
    apiFetch("/payout-methods", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => apiFetch("/payout-methods"),

  get: (id: ResourceId) => apiFetch(`/payout-methods/${id}`),

  update: (id: ResourceId, data: Partial<PayoutMethodCreateData>) =>
    apiFetch(`/payout-methods/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: ResourceId) =>
    apiFetch(`/payout-methods/${id}`, { method: "DELETE" }),
};

export const multiCurrencyApi = {
  getSupportedCurrencies: () => apiFetch("/multicurrency/currencies"),
  getExchangeRates: (baseCurrency = "USD") =>
    apiFetch(`/multicurrency/rates?base=${baseCurrency}`),
  convert: (amount: number, from: string, to: string) =>
    apiFetch(`/multicurrency/convert?amount=${amount}&from=${from}&to=${to}`),
  getPreferredCurrency: () => apiFetch("/multicurrency/preference"),
  setPreferredCurrency: (currency: string) =>
    apiFetch("/multicurrency/preference", {
      method: "PUT",
      body: JSON.stringify({ currency }),
    }),
};
