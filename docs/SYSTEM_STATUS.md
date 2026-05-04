# System Status & API Health Dashboard

MegiLance includes a comprehensive system status monitoring dashboard that displays real-time health information for all services and API endpoints.

## Accessing the Status Dashboard

### Public Endpoint
Navigate to the status page in your browser:
```
https://megilance.site/system-status
```

### API Endpoints

The system status information is available via several REST API endpoints:

#### Full System Status
```
GET /api/status/full
```
Returns comprehensive system status including:
- Overall system health (healthy/degraded/offline)
- Service health metrics (database, LLM gateway)
- Summary statistics (total endpoints, AI services, tools)
- All available API endpoints categorized by type
- Documentation links

Example response:
```json
{
  "timestamp": "2026-05-04T12:30:45.123Z",
  "system_status": "healthy",
  "version": "2.0",
  "services": {
    "database": {
      "name": "Database (Turso)",
      "healthy": true,
      "message": "Connected",
      "response_time_ms": 45.23
    },
    "llm_gateway": {
      "name": "LLM Gateway (DigitalOcean)",
      "healthy": true,
      "message": "Model: llama3.3-70b-instruct",
      "response_time_ms": 234.56
    }
  },
  "summary": {
    "critical_services_healthy": true,
    "ai_services_available": true,
    "total_endpoints": 58,
    "ai_endpoints_count": 8,
    "public_tools_count": 18,
    "chatbot_endpoints_count": 4,
    "core_endpoints_count": 28
  },
  "endpoints": {
    "ai_services": [...],
    "public_tools": [...],
    "chatbot": [...],
    "core": [...]
  }
}
```

#### Simple Health Check
```
GET /api/status/simple
```
Quick status check with just critical service health.

#### Endpoints Listing
```
GET /api/status/endpoints
```
Get just the endpoint listing without service checks (faster response).

## System Components Monitored

### Critical Services
1. **Database (Turso)** - Remote LibSQL database
   - Connection status
   - Response time
   - Query execution

2. **LLM Gateway (DigitalOcean)** - AI model inference
   - API key validation
   - Model availability
   - Response latency

### API Endpoints (58 Total)

#### AI Services (8 endpoints)
- `/api/ai/status` - AI service status
- `/api/ai/chat` - Chatbot conversation
- `/api/ai/estimate-price` - Price estimation
- `/api/ai/extract-skills` - Skill extraction
- `/api/ai/analyze-sentiment` - Sentiment analysis
- `/api/ai/fraud-check` - Fraud detection
- `/api/ai/categorize-project` - Project categorization
- `/api/ai/generate-proposal` - Proposal generation

#### Public Tools (18 endpoints)
- **Price Estimator** - Market pricing intelligence
- **Rate Advisor** - Freelancer rate recommendations
- **Skill Analyzer** - Skill validation and analysis
- **Proposal Writer** - AI proposal generation
- **Scope Planner** - Project scope estimation
- **Income Calculator** - Earnings projections
- **Expense Tax Calculator** - Tax calculation
- **Invoice Generator** - Invoice creation
- **Contract Builder** - Contract generation

#### Chatbot Endpoints (4 endpoints)
- `/api/chatbot/start` - Start conversation
- `/api/chatbot/{conversation_id}/message` - Send message
- `/api/chatbot/{conversation_id}/history` - Get history
- `/api/chatbot/{conversation_id}/close` - Close conversation

#### Core API Endpoints (28 endpoints)
- Authentication (register, login, refresh)
- Projects (CRUD operations)
- Proposals (submit, review, accept)
- Reviews (create, read, update)
- Payments (initiate, track)
- Messages (send, retrieve)
- Notifications (get, mark as read)
- And more...

## Authentication Requirements

Most AI services and public tools are **publicly accessible** without authentication:

- ✅ **No Auth Required**: All AI services, chatbot, price estimator, rate advisor, skill analyzer, etc.
- 🔒 **Auth Required**: Core API endpoints (projects, proposals, payments, user profiles, etc.)

## Usage Examples

### Check System Health
```bash
# Simple health check
curl https://api.megilance.site/api/status/simple

# Full status with all endpoints
curl https://api.megilance.site/api/status/full
```

### Test AI Endpoints
```bash
# Test chatbot
curl -X POST https://api.megilance.site/api/chatbot/start

# Get price estimate
curl -X POST https://api.megilance.site/api/price-estimator/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "category": "software_development",
    "service_type": "web_application"
  }'

# Get rate advice
curl -X POST https://api.megilance.site/api/rate-advisor/advise \
  -H "Content-Type: application/json" \
  -d '{
    "service_type": "web_development",
    "experience_level": "mid",
    "country_code": "US"
  }'
```

## Integration with Monitoring

The system status endpoints can be integrated with external monitoring tools:

### Kubernetes Probes
Use `/api/health/ready` for readiness probes and `/api/health/live` for liveness probes.

### Prometheus Metrics
Access Prometheus-formatted metrics at `/api/health/metrics`:
```
GET /api/health/metrics
```

Returns metrics like:
```
megilance_database_healthy 1
megilance_database_latency_ms 45.23
megilance_memory_used_percent 67.5
megilance_disk_free_percent 42.1
```

## Performance Characteristics

| Component | Typical Response Time | Status |
|-----------|----------------------|--------|
| Database Check | 30-100ms | Varies |
| LLM Gateway Check | 200-500ms | Depends on API |
| Full Status Endpoint | 300-700ms | Combined |
| Simple Status Endpoint | 50-200ms | Lightweight |
| Endpoints Listing | 10-50ms | Cached |

## Troubleshooting

### System Status: Degraded

If the system status shows "degraded", check:

1. **Database Connection**
   - Verify Turso database URL is correct
   - Check TURSO_AUTH_TOKEN is valid
   - Ensure network connectivity to Turso servers

2. **LLM Gateway**
   - Verify DO_AI_API_KEY is set and valid
   - Check DigitalOcean API status
   - Ensure model availability

### AI Endpoints Returning Errors

1. **401 Unauthorized** on LLM endpoints
   - Verify API key format (should be Model Access Key, not personal token)
   - Check key hasn't expired
   - Regenerate key from DigitalOcean console

2. **503 Service Unavailable**
   - Backend database is unavailable
   - Check `/api/status/simple` for details
   - Wait for services to recover or contact support

3. **400 Bad Request**
   - Check request payload matches schema
   - Validate required fields are present
   - Review error message for specific field issues

## Security Considerations

- **No API Rate Limiting** on public endpoints (apply rate limiting at load balancer)
- **No Authentication** on public tools (suitable for public pricing/estimation)
- **Rate Limiting Recommended** for production deployments (100-1000 requests/hour per IP)
- **Firewall Rules** should restrict core API endpoints to authenticated users only

## Future Enhancements

Planned improvements to system status monitoring:

- [ ] Response time trends over time
- [ ] Error rate tracking
- [ ] Service dependency visualization
- [ ] Custom alert thresholds
- [ ] WebSocket real-time updates
- [ ] Historical status archive
- [ ] Incident tracking and reporting

## API Reference

See the full OpenAPI documentation at:
```
GET /api/docs
```

Or view the ReDoc documentation at:
```
GET /api/redoc
```

## Support

For issues with the system status dashboard or API endpoints:

1. Check `/api/status/full` for detailed error information
2. Review logs at `GET /api/health?detailed=true`
3. Contact support@megilance.site with error details

---

**Last Updated**: March 25, 2026
**Version**: 2.0
**Status**: Production Ready
