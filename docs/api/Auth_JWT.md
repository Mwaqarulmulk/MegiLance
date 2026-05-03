# Authentication & Authorization (JWT)

Stateless token model using short-lived access + longer-lived refresh tokens.

## 1. Token Types
| Token | Lifetime (planned) | Transport | Purpose |
|-------|--------------------|----------|---------|
| Access | 30 minutes | Authorization header `Bearer` | Protect APIs |
| Refresh | 7 days | HTTP-only cookie or header | Issue new access |

## 2. JWT Claims (Access)
| Claim | Example | Notes |
|-------|---------|------|
| sub | user UUID | Principal identifier |
| role | freelancer | Access control |
| exp | epoch | Expiration time |
| iat | epoch | Issued at |
| jti | uuid | Token identifier (revocation future) |

## 3. Login Flow
1. User submits credentials.
2. Validate password (Argon2 hash).
3. Issue access & refresh token pair.
4. Return: access token in JSON body; refresh token as httpOnly cookie (preferred) or body.

## 4. Refresh Flow
| Step | Action |
|------|--------|
| 1 | Client sends refresh token |
| 2 | Validate signature & expiry |
| 3 | (Future) Check revocation store |
| 4 | Issue new access (and optional rotated refresh) |

## 5. Revocation Strategy (Planned)
| Scenario | Approach |
|----------|---------|
| Password reset | Invalidate all refresh tokens with user epoch counter |
| Manual admin ban | Add user id to deny list cache |
| Compromise suspicion | Increment global token version stored per user |

## 6. Authorization Model
| Resource | Access Rule Example |
|----------|--------------------|
| Project create | role == client |
| Proposal submit | role == freelancer AND project.open |
| Contract accept | user == project.owner |
| Review create | user involved in contract AND contract.completed |

Implemented via FastAPI dependency injecting current user + role check utilities.

## 7. Error Conditions
| Error | HTTP | Response Code Field |
|-------|------|--------------------|
| Missing header | 401 | UNAUTHORIZED |
| Invalid signature | 401 | UNAUTHORIZED |
| Expired | 401 | TOKEN_EXPIRED |
| Role denied | 403 | FORBIDDEN |

## 8. Security Considerations
| Risk | Mitigation |
|------|-----------|
| Token theft | HTTPS + short access lifetime |
| Replay of refresh | Rotation + jti store (future) |
| Brute force login | Rate limiting (future) |
| Weak password | Complexity & length enforcement |

## 9. Implementation Notes
- Use `python-jose` or `PyJWT` for signing (HS256 initially, future RS256).
- Central settings module provides secret & TTLs.
- Decorator / dependency caches decoded token for request lifecycle.

## 10. Future Enhancements
| Feature | Benefit |
|---------|---------|
| RS256 asymmetric keys | Key rotation without downtime |
| Token introspection endpoint | Central revocation checks |
| MFA (TOTP) | Elevated security actions |
| SCIM provisioning (later) | Enterprise readiness |

---
Auth specification; update if claim set or flows change.
