# Operations Runbook

Primary reference for routine ops & incident handling.

## 1. Quick Commands
| Task | Command |
|------|---------|
| Check container status | `docker ps` |
| Tail backend logs | `docker compose logs -f backend` |
| Restart backend | `docker compose restart backend` |
| Pull latest code | `git pull origin main` |
| Rebuild minimal stack | `docker compose -f docker-compose.minimal.yml up -d --build` |
| Health live | `curl http://<IP>/api/health/live` |
| Health ready | `curl http://<IP>/api/health/ready` |

## 2. Health Endpoints
| Endpoint | Purpose | Expected 200 Criteria |
|----------|---------|----------------------|
| /api/health/live | Process up | App responding |
| /api/health/ready | Dependencies OK | DB ping success |

## 3. Routine Maintenance
| Frequency | Task | Detail |
|-----------|------|-------|
| Weekly | Review logs | Scan for ERROR spikes |
| Weekly | Pull updates | Security patches & code | 
| Monthly | Secret rotation (manual) | Update .env.production & restart |
| Quarterly | Wallet backup verification | Validate integrity & access |

## 4. Incident Classification
| Severity | Impact | SLA Initial Response |
|----------|--------|----------------------|
| SEV1 | Full outage | 15 min |
| SEV2 | Partial degradation | 30 min |
| SEV3 | Minor feature issue | Next business day |

## 5. Incident Response Workflow
1. Detect (monitor / user report)
2. Triage severity (SEV1–3)
3. Contain (disable problematic feature flag or rollback)
4. Remediate (hotfix, config change)
5. Verify (readiness + smoke test)
6. Post-mortem (root cause, action items)

## 6. Rollback Procedure
| Step | Command |
|------|---------|
| Identify last good commit | `git log --oneline` |
| Checkout | `git checkout <commit>` |
| Rebuild | `docker compose -f docker-compose.minimal.yml up -d --build` |
| Verify | Health endpoints + feature smoke |

## 7. Log Analysis Tips
| Scenario | Query / Approach |
|----------|------------------|
| Spike errors | Filter lines containing `ERROR` last 200 lines |
| Slow responses | (Future) latency metrics in logs |
| Auth failures | Count occurrences of UNAUTHORIZED |

## 8. Capacity Monitoring (Manual Minimal)
| Metric | Command |
|--------|---------|
| CPU | `top` / `htop` |
| Memory | `free -m` |
| Disk | `df -h` |
| Network | `ss -tuna | wc -l` |

## 9. Scaling Triggers (Future)
| Symptom | Threshold | Action |
|---------|-----------|--------|
| Memory usage high | >85% sustained | Optimize / add swap cautiously |
| Response latency | p95 > 700ms | Profile DB / code path |
| Error rate | >2% 5xx | Investigate logs, rollback |

## 10. Backup & Recovery (Wallet & Config)
| Item | Action |
|------|--------|
| Wallet | Secure offline copy |
| .env.production | Encrypted local backup |
| Git repo | Hosted on GitHub (redundant) |

## 11. Manual DB Connectivity Test
```
python -c "import oracledb; oracledb.init_oracle_client();
import os; conn=oracledb.connect(dsn=os.environ['ORACLE_DSN'], user=os.environ['ORACLE_USER'], password=os.environ['ORACLE_PASSWORD']);
cur=conn.cursor(); cur.execute('SELECT 1 FROM dual'); print(cur.fetchone())"
```

## 12. Common Issues
| Symptom | Likely Cause | Remediation |
|---------|-------------|------------|
| 502 gateway | Backend down | Restart container |
| Wallet permission error | Wrong chmod | `chmod 500 wallet` |
| High memory kill | OOM | Reduce workers / reload |

## 13. Post-Mortem Template
```
Incident: <title>
Date/Time:
Severity:
Impact Summary:
Timeline:
Root Cause:
Corrective Actions (Immediate):
Preventive Actions (Long-term):
Owner:
Due Dates:
```

---
Living runbook; iterate with operational maturity.
