---
title: ADR Index
+doc_version: 1.0.0
last_updated: 2025-11-25
status: active
owners: ["architecture"]
related: ["Architecture.md"]
description: Index and guidance for Architectural Decision Records (ADRs).
---

# ADR Index

> @AI-HINT: Provides process and listings for architectural decision records.

## Purpose
Capture significant architectural choices with context, options, decision, and consequences.

## Template
Create a new file: `ADR-<number>-<slug>.md` (sequential numbering).

```
---
title: ADR-<number>: <Title>
date: YYYY-MM-DD
status: proposed | accepted | superseded | deprecated
owners: ["architecture"]
related: ["Architecture.md"]
---

## Context
(Why this decision is needed.)

## Options Considered
- Option A: ...
- Option B: ...

## Decision
Chosen option and rationale.

## Consequences
Positive and negative outcomes.

## Alternatives & Trade-offs
Brief notes.

## Review
Date or condition for revisiting.
```

## Workflow
1. Draft ADR (status: proposed)
2. Review → approve (status: accepted)
3. Update `Architecture.md` cross-references
4. Supersede older ADRs by updating their status

## Listing
(None yet)
