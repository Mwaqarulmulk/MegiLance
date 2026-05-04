# Code Style & Conventions

## 1. General Principles
| Principle | Rationale |
|-----------|----------|
| Readability over cleverness | Ease of maintenance |
| Explicit imports | Avoid namespace ambiguity |
| Single responsibility modules | Testability |

## 2. Python (Backend)
| Aspect | Rule | Example |
|--------|------|---------|
| Formatting | Ruff / Black defaults | 88 char line |
| Types | Mandatory annotations for defs | `def create_user(data: UserIn) -> User:` |
| Docstrings | Public funcs/modules | Google style concise |
| Logging | Structured adapter | `logger.info("proposal.created", extra={...})` |
| Exceptions | Raise domain-specific | `raise AuthorizationError()` |

## 3. FastAPI Patterns
| Pattern | Guideline |
|--------|----------|
| Dependency injection | Use `Depends` for DB/session/user |
| Schemas | Separate request/response models |
| Validation | Rely on Pydantic + custom validators |

## 4. React/Next.js (Frontend)
| Aspect | Rule |
|--------|-----|
| Components | Functional components + hooks |
| State | Local first, minimal global context |
| Props typing | Strict `interface` definitions |
| CSS Modules | 3‑file theme pattern (common/light/dark) |
| Accessibility | ARIA labels on interactive elements |

## 5. Naming Conventions
| Item | Style | Example |
|------|-------|---------|
| Python variables | snake_case | `proposal_count` |
| Python classes | PascalCase | `ProposalService` |
| React components | PascalCase | `ProjectCard` |
| Files (React) | PascalCase.tsx | `ProjectList.tsx` |
| CSS classes | kebab-case | `.list-item` |

## 6. Error Handling
| Rule | Description |
|------|------------|
| Narrow except | Catch specific exceptions |
| Preserve traceback | Re-raise or log exception info |
| Map to API errors | Central exception handler returns uniform envelope |

## 7. Imports Ordering (Python)
1. Standard library
2. Third-party
3. Internal packages

Each group separated by blank line.

## 8. Security Hygiene
| Item | Rule |
|------|------|
| Secrets | Never hardcode; use env |
| Input | Validate all external inputs |
| Logging | Redact sensitive fields |

## 9. Testing Conventions
| Aspect | Rule |
|--------|------|
| Test filenames | `test_<module>.py` |
| Assertions | Prefer explicit over broad | `assert response.status_code == 200` |
| Factories | Use helper builders instead of fixtures overuse |

## 10. Git Practices
| Commit messages | `<type>(scope): summary` (feat, fix, docs, chore) |
| Branch names | `feature/<short-desc>` |
| PR size | Prefer < 400 LOC per review |

## 11. Dependency Management
| Rule | Description |
|------|------------|
| Pin critical libs | Deterministic builds |
| Review updates | Monthly security review |

## 12. Performance Considerations
| Aspect | Rule |
|--------|------|
| DB queries | Avoid unbounded scans |
| JSON size | Exclude internal fields |
| Caching | Only after measurement |

## 13. Lint & Type Commands
```
ruff check .
ruff format .
mypy backend/
```

## 14. Frontend Theming Pattern
See `copilot-instructions.md`: always import `Component.common/light/dark.module.css` and merge with `cn()`.

---
Adhere for consistency; propose changes via PR updating this document.
