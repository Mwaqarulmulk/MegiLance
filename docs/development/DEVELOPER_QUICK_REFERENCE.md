# MegiLance 2.0 - Developer Quick Reference

> **Quick access guide for all new advanced features**

---

## 🚀 Quick Start

### Deploy New Features
```bash
# 1. Apply database schema
cd backend
sqlite3 local.db < app/db/advanced_schema.sql

# 2. Install new dependencies
pip install pyotp qrcode twilio web3 httpx

# 3. Update environment variables
cp .env.example .env
# Add: TWILIO_*, TURN_SERVER_*, COINGECKO_API_KEY

# 4. Restart backend
uvicorn main:app --reload --port 8000
```

---

## 🔐 Security Features

### Multi-Factor Authentication

#### Setup MFA
```python
POST /api/security/mfa/setup
{
  "method": "totp",  # totp, sms, email, webauthn
  "contact": "optional@email.com"
}

Response:
{
  "method": "totp",
  "secret": "BASE32SECRET",
  "qr_code": "data:image/png;base64,...",
  "backup_codes": ["CODE1", "CODE2", ...]
}
```

#### Verify MFA
```python
POST /api/security/mfa/verify
{
  "method": "totp",
  "code": "123456"
}
```

### Risk-Based Authentication
```python
POST /api/security/assess-risk
{
  "user_id": 123,
  "ip_address": "1.2.3.4",
  "user_agent": "Mozilla/5.0...",
  "location": {"country": "US", "city": "New York"}
}

Response:
{
  "risk_score": 25.5,
  "risk_level": "low",
  "factors": [...],
  "require_additional_auth": false
}
```

### Session Management
```python
# Get active sessions
GET /api/security/sessions

# Revoke session
DELETE /api/security/sessions/{session_id}

# Revoke all sessions
DELETE /api/security/sessions/all
```

---

## 💰 Multi-Currency Payments

### Currency Conversion
```python
POST /api/payments/convert
{
  "amount": 1000,
  "from_currency": "USD",
  "to_currency": "EUR"
}

Response:
{
  "from_currency": "USD",
  "to_currency": "EUR",
  "amount": 1000,
  "converted_amount": 920.50,
  "exchange_rate": 0.9205,
  "timestamp": "2025-12-06T..."
}
```

### Cryptocurrency Payment
```python
POST /api/payments/crypto/pay
{
  "amount": 100,
  "cryptocurrency": "USDC",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "polygon"
}
```

### Get Exchange Rate
```python
GET /api/payments/exchange-rate?from=USD&to=EUR

Response:
{
  "rate": 0.9205,
  "timestamp": "2025-12-06T...",
  "provider": "exchangerate-api"
}
```

### Pricing Recommendation
```python
POST /api/payments/price-recommendation
{
  "project_id": 123,
  "freelancer_id": 456
}

Response:
{
  "suggested_price": 2500.00,
  "price_range": {"min": 2000, "max": 3000, "median": 2500},
  "market_rate": 2400.00,
  "confidence_score": 0.85
}
```

---

## 🤖 AI Features

### Deep Learning Matching
```python
POST /api/ai/match-freelancers-deep
{
  "project_id": 123,
  "max_results": 10
}

Response:
[
  {
    "freelancer_id": 456,
    "match_score": 92.5,
    "confidence": 0.88,
    "factors": {
      "skill_match": 0.95,
      "experience_match": 0.90,
      ...
    },
    "rank": 1
  },
  ...
]
```

### Fraud Detection
```python
POST /api/ai/detect-fraud
{
  "user_id": 123,
  "action_type": "proposal_submission",
  "context": {
    "ip_address": "1.2.3.4",
    "device_info": {...}
  }
}

Response:
{
  "user_id": 123,
  "risk_score": 35.0,
  "risk_level": "medium",
  "detected_patterns": ["new_account", "rapid_submissions"],
  "recommended_action": "monitor",
  "confidence": 0.75
}
```

### Quality Assessment
```python
POST /api/ai/assess-quality
{
  "work_id": 789,
  "work_type": "code",
  "content": "... code content ..."
}

Response:
{
  "work_id": 789,
  "work_type": "code",
  "quality_score": 85.0,
  "assessment_details": {
    "complexity": "medium",
    "maintainability": "good"
  },
  "issues": [
    {"severity": "warning", "message": "..."}
  ],
  "suggestions": ["Add more comments", "Add unit tests"]
}
```

---

## 📹 Video Communication

### Create Video Call
```python
POST /api/video/calls
{
  "participant_ids": [123, 456],
  "call_type": "group",  # one_on_one, group, screen_share
  "scheduled_at": "2025-12-06T14:00:00Z",
  "enable_recording": true
}

Response:
{
  "call_id": 789,
  "room_id": "room_abc123...",
  "join_url": "https://megilance.com/video/join/room_abc123",
  "status": "scheduled"
}
```

### Join Call
```python
POST /api/video/calls/{room_id}/join

Response:
{
  "room_id": "room_abc123",
  "ice_servers": [
    {"urls": "stun:stun.l.google.com:19302"},
    {"urls": "turn:...", "username": "...", "credential": "..."}
  ],
  "participant_count": 3,
  "call_config": {
    "max_participants": 50,
    "enable_recording": true,
    "video_quality": "720p"
  }
}
```

### WebSocket Signaling
```javascript
// Frontend JavaScript
const ws = new WebSocket('ws://localhost:8000/api/video/ws/room_abc123');

// Send offer
ws.send(JSON.stringify({
  type: 'offer',
  sdp: peerConnection.localDescription,
  from: currentUserId
}));

// Receive answer
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'answer') {
    peerConnection.setRemoteDescription(data.sdp);
  }
};
```

### Screen Sharing
```python
POST /api/video/screen-share/start
{
  "call_id": 789,
  "stream_id": "stream_xyz"
}
```

### Recording
```python
# Start recording
POST /api/video/calls/{call_id}/recording/start

# Stop recording
POST /api/video/calls/{call_id}/recording/stop

Response:
{
  "recording_url": "https://recordings.megilance.com/789/recording.mp4",
  "expires_in_days": 30
}
```

---

## 📊 Database Schema

### Key New Tables

#### MFA Methods
```sql
CREATE TABLE mfa_methods (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  method VARCHAR(20),  -- totp, sms, email, webauthn
  secret TEXT,
  contact VARCHAR(255),
  is_active BOOLEAN
);
```

#### Transactions (Multi-Currency)
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  from_user_id INTEGER,
  to_user_id INTEGER,
  amount DECIMAL(20,8),
  currency VARCHAR(10),
  converted_amount DECIMAL(20,8),
  exchange_rate DECIMAL(20,10),
  platform_fee DECIMAL(20,8),
  payment_method VARCHAR(50),
  tx_hash VARCHAR(100),  -- Crypto tx hash
  network VARCHAR(50)    -- ethereum, polygon, etc.
);
```

#### Video Calls
```sql
CREATE TABLE video_calls (
  id INTEGER PRIMARY KEY,
  host_id INTEGER,
  participant_ids TEXT,  -- JSON array
  room_id VARCHAR(100) UNIQUE,
  call_type VARCHAR(20),
  status VARCHAR(20),
  recording_url TEXT,
  duration_seconds INTEGER
);
```

#### Fraud Alerts
```sql
CREATE TABLE fraud_alerts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  alert_type VARCHAR(50),
  severity VARCHAR(20),
  risk_score DECIMAL(5,2),
  evidence TEXT,  -- JSON
  status VARCHAR(20)
);
```

---

## 🔧 Service Integration

### Advanced Security Service
```python
from app.services.advanced_security import get_security_service

security_service = get_security_service(db)

# Setup MFA
await security_service.setup_mfa(user_id, "totp")

# Verify MFA
result = await security_service.verify_mfa(user_id, "totp", "123456")

# Assess risk
risk = await security_service.assess_login_risk(
  user_id, ip_address, user_agent
)
```

### Multi-Currency Payment Service
```python
from app.services.multicurrency_payments import get_multicurrency_service

payment_service = get_multicurrency_service(db)

# Convert currency
conversion = await payment_service.convert_currency(
  Decimal("1000"), "USD", "EUR"
)

# Process payment
result = await payment_service.process_payment(payment_request)

# Get pricing recommendation
pricing = await payment_service.get_pricing_recommendation(
  project_id, freelancer_id
)
```

### Advanced AI Service
```python
from app.services.advanced_ai import get_advanced_ai_service

ai_service = get_advanced_ai_service(db)

# Deep learning matching
matches = await ai_service.match_freelancers_deep_learning(
  project_id, max_results=10
)

# Detect fraud
fraud_score = await ai_service.detect_fraud(
  user_id, action_type, context
)

# Assess quality
quality = await ai_service.assess_work_quality(
  work_id, work_type, content
)
```

---

## 🧪 Testing

### Unit Tests
```python
import pytest
from app.services.advanced_security import AdvancedSecurityService

@pytest.mark.asyncio
async def test_mfa_setup(db_session):
    service = AdvancedSecurityService(db_session)
    result = await service.setup_mfa(user_id=1, method="totp")
    
    assert "secret" in result
    assert "qr_code" in result
    assert len(result["backup_codes"]) == 10
```

### Integration Tests
```python
@pytest.mark.asyncio
async def test_payment_flow(client):
    # Create payment
    response = await client.post("/api/payments/multi-currency", json={
        "amount": 1000,
        "currency": "USD",
        "recipient_id": 2,
        "payment_method": "stripe"
    })
    
    assert response.status_code == 200
    assert "transaction_id" in response.json()
```

### Load Tests
```bash
# Using Locust
locust -f tests/load_test.py --host=http://localhost:8000
```

---

## 📈 Monitoring

### Health Checks
```python
GET /api/health/ready

Response:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "cache": "connected",
    "payment_provider": "connected"
  }
}
```

### Metrics
```python
GET /api/metrics

Response:
{
  "total_users": 15000,
  "active_sessions": 500,
  "avg_response_time_ms": 45,
  "error_rate": 0.001
}
```

---

## 🔥 Common Patterns

### Error Handling
```python
from fastapi import HTTPException

try:
    result = await service.process_payment(request)
except InsufficientFundsError:
    raise HTTPException(
        status_code=400,
        detail="Insufficient balance"
    )
except Exception as e:
    logger.error(f"Payment error: {e}")
    raise HTTPException(
        status_code=500,
        detail="Payment processing failed"
    )
```

### Async Operations
```python
import asyncio

# Run multiple operations concurrently
results = await asyncio.gather(
    service.get_exchange_rate("USD", "EUR"),
    service.get_exchange_rate("USD", "GBP"),
    service.get_exchange_rate("USD", "JPY")
)
```

### Caching
```python
from functools import lru_cache

@lru_cache(maxsize=1000)
async def get_cached_exchange_rate(from_curr, to_curr):
    return await fetch_exchange_rate(from_curr, to_curr)
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check database file permissions
ls -la backend/local.db

# Recreate database
rm backend/local.db
cd backend && python -c "from app.db.init_db import init_db; from app.db.session import engine; init_db(engine)"
```

#### 2. WebSocket Connection Failed
```bash
# Check TURN server configuration
echo $TURN_SERVER_URL
echo $TURN_USERNAME

# Test WebSocket endpoint
wscat -c ws://localhost:8000/api/video/ws/test_room
```

#### 3. Payment Processing Error
```bash
# Verify Stripe API key
echo $STRIPE_SECRET_KEY | grep -o '^sk_test'

# Test Stripe connection
curl https://api.stripe.com/v1/charges -u $STRIPE_SECRET_KEY:
```

#### 4. Exchange Rate API Limit
```bash
# Check rate limits
curl https://api.exchangerate-api.com/v4/latest/USD

# Use fallback provider
export USE_FALLBACK_RATES=true
```

---

## 📚 Resources

### Documentation
- [Full Enhancement Plan](MARKET_COMPETITIVE_ENHANCEMENTS.md)
- [Implementation Summary](IMPLEMENTATION_COMPLETE.md)
- [API Documentation](http://localhost:8000/api/docs)
- [Database Schema](../backend/app/db/advanced_schema.sql)

### External APIs
- [CoinGecko API](https://www.coingecko.com/en/api)
- [ExchangeRate-API](https://www.exchangerate-api.com/)
- [Stripe API](https://stripe.com/docs/api)
- [Twilio API](https://www.twilio.com/docs)
- [WebRTC Specification](https://webrtc.org/)

### Tools
- [Postman Collection](../tests/MegiLance_2.0.postman_collection.json)
- [Database Viewer](https://sqlitebrowser.org/)
- [WebRTC Tester](https://test.webrtc.org/)

---

## 🎯 Best Practices

### Security
1. ✅ Always use HTTPS in production
2. ✅ Rotate API keys every 90 days
3. ✅ Enable MFA for all admin accounts
4. ✅ Monitor security events daily
5. ✅ Run security audits monthly

### Performance
1. ✅ Cache exchange rates (5-minute TTL)
2. ✅ Use database indexes
3. ✅ Implement rate limiting
4. ✅ Optimize WebSocket connections
5. ✅ Use CDN for static assets

### Code Quality
1. ✅ Follow PEP 8 style guide
2. ✅ Write comprehensive docstrings
3. ✅ Add type hints everywhere
4. ✅ Test all new features
5. ✅ Review code before deployment

---

## 🆘 Support

### Get Help
- 📧 Email: dev@megilance.com
- 💬 Slack: #megilance-dev
- 📖 Wiki: https://wiki.megilance.com
- 🐛 Issues: https://github.com/megilance/platform/issues

---

**Last Updated**: December 6, 2025  
**Version**: 2.0  
**Maintainer**: MegiLance Dev Team
