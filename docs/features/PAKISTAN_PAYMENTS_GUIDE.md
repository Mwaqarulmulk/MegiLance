# 🇵🇰 Pakistan Payment Integration Guide

## Overview

Since **Stripe is NOT available in Pakistan**, MegiLance provides these alternative payment methods:

| Provider | Type | Fees | Speed | Best For |
|----------|------|------|-------|----------|
| 🔷 **USDC (Polygon)** | Crypto | ~0.1% + $0.01 | 2-5 min | **Recommended** - Lowest fees! |
| 💎 USDC (Ethereum) | Crypto | ~0.1% + $5 | 5-15 min | High liquidity |
| 📱 JazzCash | Mobile | 1.5% | Instant | Local PKR |
| 📱 EasyPaisa | Mobile | 1.5% | Instant | Local PKR |
| 🔄 AirTM | P2P | 2% | 15-30 min | PKR to USD conversion |
| 🏦 Wise | Bank | 0.5% + $1 | 1-2 days | Best exchange rates |
| 💳 Payoneer | Freelancer | 2% | Instant | Already popular |

---

## 1. USDC on Polygon (RECOMMENDED) ⭐

### Why Polygon?
- **Near-zero fees**: ~$0.01 per transaction
- **Fast**: 2-5 seconds confirmation
- **Stablecoin**: 1 USDC = 1 USD (no volatility)
- **No country restrictions**: Works globally

### Setup Steps

#### Step 1: Install MetaMask
```
1. Go to https://metamask.io/download/
2. Install browser extension (Chrome, Firefox, Edge)
3. Create a new wallet and save your seed phrase
```

#### Step 2: Add Polygon Network
```
Network Name: Polygon Mainnet
RPC URL: https://polygon-rpc.com/
Chain ID: 137
Symbol: MATIC
Block Explorer: https://polygonscan.com
```

Or click "Add Polygon" in MetaMask networks.

#### Step 3: Get USDC on Polygon

**Option A: From Centralized Exchange (Recommended)**
1. Create account on Binance, Bybit, or OKX
2. Buy USDC with PKR/USD
3. Withdraw USDC to Polygon network (select "Polygon" not "ERC20")
4. Receive in MetaMask

**Option B: Bridge from Ethereum**
1. If you have USDC on Ethereum
2. Use https://wallet.polygon.technology/bridge
3. Bridge USDC from Ethereum to Polygon

**Option C: Buy with Fiat**
1. Use https://transak.com or https://moonpay.com
2. Select Polygon network
3. Buy USDC directly

### Receiving Payments

Your MegiLance wallet address will be provided. When a client pays:
1. They connect MetaMask
2. Send USDC to your address
3. Transaction confirmed in 2-5 seconds
4. Funds available immediately

### Environment Variables

Add to `backend/.env`:
```env
# USDC Polygon Configuration
POLYGON_RPC_URL=https://polygon-rpc.com/
USDC_CONTRACT_ADDRESS_POLYGON=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
USDC_RECEIVING_ADDRESS_POLYGON=your-wallet-address

# Optional: Ethereum mainnet
ETHEREUM_RPC_URL=https://eth.llamarpc.com
USDC_CONTRACT_ADDRESS_ETH=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
```

---

## 2. JazzCash Integration

### Setup

1. **Register as Merchant**
   - Visit https://www.jazzcash.com.pk/for-business/
   - Apply for merchant account
   - Get approved (1-3 days)
   - Receive Merchant Code

2. **Add Credentials**
   ```env
   JAZZCASH_MERCHANT_ID=your-merchant-id
   JAZZCASH_PASSWORD=your-password
   JAZZCASH_INTEGRITY_SALT=your-salt
   JAZZCASH_MERCHANT_CODE=MEGILANCE001
   ```

3. **API Endpoint** (for advanced integration)
   - Sandbox: https://sandbox.jazzcash.com.pk
   - Production: https://payments.jazzcash.com.pk

### Payment Flow
1. User opens JazzCash app
2. Selects "Send Money" → "Pay Merchant"
3. Enters merchant code: `MEGILANCE001`
4. Enters PKR amount
5. Confirms with PIN
6. MegiLance receives notification

---

## 3. EasyPaisa Integration

### Setup

1. **Register as Merchant**
   - Visit https://www.easypaisa.com.pk/merchant
   - Submit business documents
   - Get merchant credentials

2. **Add Credentials**
   ```env
   EASYPAISA_STORE_ID=your-store-id
   EASYPAISA_HASH_KEY=your-hash-key
   EASYPAISA_MERCHANT_CODE=your-code
   ```

### Payment Flow
Similar to JazzCash - users pay via EasyPaisa app.

---

## 4. AirTM Integration

### What is AirTM?
AirTM is a P2P dollar exchange platform. Users can:
- Deposit PKR via bank/JazzCash
- Convert to USD at competitive rates
- Send USD to other AirTM users instantly

### Setup

1. **Create AirTM Account**
   - Go to https://airtm.com
   - Sign up and verify identity (KYC)
   - Add receiving email

2. **Add Credentials**
   ```env
   AIRTM_RECEIVING_EMAIL=payments@megilance.com
   AIRTM_API_KEY=your-api-key  # Optional for advanced
   ```

### Payment Flow
1. User deposits PKR to their AirTM
2. Converts PKR to USD
3. Sends USD to MegiLance AirTM email
4. MegiLance verifies and credits account

---

## 5. Wise (TransferWise)

### Why Wise?
- Best exchange rates (mid-market rate)
- Low transparent fees
- Trusted by millions globally

### Setup

1. **Create Business Account**
   - Go to https://wise.com/business/
   - Verify your business
   - Get USD account details

2. **Add Credentials**
   ```env
   WISE_PROFILE_ID=your-profile-id
   WISE_API_TOKEN=your-api-token
   WISE_RECEIVING_EMAIL=payments@megilance.com
   ```

### Payment Flow
1. User logs into Wise
2. Sends USD to MegiLance Wise email
3. Transfer completes in 1-2 days
4. MegiLance credits account

---

## 6. Payoneer Integration

### Why Payoneer?
- Already used by many Pakistani freelancers
- FREE transfers between Payoneer users
- Competitive bank withdrawal rates

### Setup

1. **Apply for Payoneer Business**
   - https://www.payoneer.com/solutions/freelancers/
   - Verify business
   - Get payment email

2. **Add Credentials**
   ```env
   PAYONEER_PARTNER_ID=your-partner-id
   PAYONEER_RECEIVING_EMAIL=payments@megilance.com
   ```

### Payment Flow
1. User logs into Payoneer
2. Clicks "Make a Payment"
3. Enters MegiLance Payoneer email
4. Sends USD instantly
5. FREE if both parties use Payoneer!

---

## API Endpoints

All Pakistan payment endpoints are at `/api/pk-payments/`:

```
GET  /api/pk-payments/providers              # List available providers
GET  /api/pk-payments/providers/{id}         # Provider details
POST /api/pk-payments/calculate-fee          # Calculate fees
POST /api/pk-payments/wallet/connect         # Connect crypto wallet
GET  /api/pk-payments/wallet                 # Get connected wallet
DELETE /api/pk-payments/wallet/disconnect    # Disconnect wallet
POST /api/pk-payments/create                 # Create payment
POST /api/pk-payments/verify                 # Verify blockchain tx
GET  /api/pk-payments/status/{tx_id}         # Check payment status
GET  /api/pk-payments/exchange-rate          # USD/PKR rate
POST /api/pk-payments/convert                # Currency conversion
```

### Example: Create USDC Payment

```bash
curl -X POST http://localhost:8000/api/pk-payments/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "provider": "usdc_polygon",
    "description": "Payment for project"
  }'
```

Response:
```json
{
  "success": true,
  "transaction_id": "usdc_polygon_abc123",
  "status": "awaiting_payment",
  "amount": 100.00,
  "fee": 0.11,
  "net_amount": 99.89,
  "instructions": "Send 100 USDC to...",
  "block_explorer_url": "https://polygonscan.com/address/0x..."
}
```

---

## Frontend Component

Use the `PakistanPaymentOptions` component:

```tsx
import PakistanPaymentOptions from '@/app/components/PakistanPaymentOptions/PakistanPaymentOptions';

<PakistanPaymentOptions
  amount={100}
  onProviderSelect={(provider) => setSelectedProvider(provider)}
  selectedProvider={selectedProvider}
  onPaymentInitiate={(details) => handlePayment(details)}
/>
```

---

## Security Considerations

1. **Never share private keys** - MetaMask signs transactions locally
2. **Verify addresses** - Double-check before sending crypto
3. **Use 2FA** - Enable on all payment accounts
4. **Monitor transactions** - Check blockchain explorers
5. **Keep records** - Save transaction IDs for disputes

---

## Recommended Order of Implementation

1. ✅ **USDC on Polygon** - Set up immediately (free, instant)
2. ✅ **JazzCash/EasyPaisa** - For local users who prefer PKR
3. ✅ **Payoneer** - Many freelancers already have it
4. ✅ **AirTM** - Good for PKR to USD conversion
5. ✅ **Wise** - For clients preferring bank transfers

---

## Cost Comparison (on $100 payment)

| Provider | Fee | You Receive |
|----------|-----|-------------|
| USDC Polygon | $0.11 | **$99.89** ⭐ |
| Wise | $1.50 | $98.50 |
| JazzCash | $1.50 | $98.50 |
| EasyPaisa | $1.50 | $98.50 |
| Payoneer | $2.00 | $98.00 |
| AirTM | $2.00 | $98.00 |
| USDC Ethereum | $5.10 | $94.90 |

**USDC on Polygon saves ~95% on fees compared to traditional methods!**
