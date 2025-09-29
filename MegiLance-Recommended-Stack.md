# Notice: Consolidated guidance

Technology choices and setup are covered in `docs/HybridFullStackSetup.md` and deployment specifics in `docs/DeploymentGuide.md`. This file remains for reference.

---

# Recommended Stack for AI Coding Agents

## 1. Monorepo Structure
AI agents work best when they have unified access to all code (frontend, backend, smart contracts) in one place. This allows for end-to-end automation, refactoring, and cross-module intelligence.

## 2. Frontend
**Next.js (React-based)**
- Modern, full-featured, supports SSR/SSG, easy to test and automate, huge ecosystem, and AI agents (like Cascade, Copilot, etc.) are highly optimized for React/Next.js codebases.

## 3. Backend/API
**Python (FastAPI)**
- Python is the industry standard for AI/ML. FastAPI is async, fast, and designed for modern APIs. AI coding agents are best at Python, and it’s easy to integrate with AI models and tools.

**Node.js (NestJS or Express) [Alternative]**
- If you want everything in TypeScript/JavaScript, Node.js is also well-supported by AI agents, but Python is superior for AI/ML.

## 4. AI/ML Integration
**Python-based microservices**
- Use Python for all AI/ML logic (ranking, price prediction, sentiment analysis, chatbot, etc.). AI agents can generate, test, and improve Python AI code rapidly.

## 5. Blockchain/Smart Contracts
**Solidity (Ethereum, Polygon, or similar EVM chain)**
- Solidity is the most widely supported smart contract language. AI agents are trained on Solidity and can write, audit, and test contracts effectively.
- Hardhat or Foundry for contract development/testing.

## 6. Database
**PostgreSQL** (for structured data, scalable, and works well with both Python and Node.js)
**MongoDB** (if you prefer NoSQL/flexible schema)

## 7. DevOps/Deployment
**Docker** for containerization (AI agents can write Dockerfiles and docker-compose easily)
**GitHub Actions** for CI/CD automation

## 8. Other Tools
- Web3.js or Ethers.js for frontend-to-blockchain communication
- Jupyter Notebooks for AI/ML prototyping (Python)
- .env files for secrets (AI agents handle these well)

---

### Why is this best for AI coding agents?
- Code is readable, modular, and follows best practices.
- AI agents have the most training and context on Python, Next.js, and Solidity.
- Easy to automate tests, deployment, and documentation.
- AI agents can generate, refactor, and extend code across the stack.
- Modern, widely adopted, and easy to hire for if you add human devs later.

---

## Summary Table

| Layer         | Recommended Option         | Why Best for AI Agents           |
|-------------- |-------------------------- |----------------------------------|
| Structure     | Monorepo                  | Unified automation               |
| Frontend      | Next.js (React)           | Huge AI support, modern, popular |
| Backend/API   | Python (FastAPI)          | AI/ML native, async, fast        |
| AI/ML         | Python microservices      | Industry standard, agent-native  |
| Blockchain    | Solidity (EVM)            | Most supported, easy to test     |
| Database      | PostgreSQL or MongoDB     | Both agent-friendly              |
| DevOps        | Docker, GitHub Actions    | Automation-ready                 |

---

## Scaffold Plan
- `frontend/` (Next.js)
- `backend/` (FastAPI)
- `ai/` (Python microservices for AI/ML)
- `contracts/` (Solidity smart contracts)
- `db/` (database migrations/config)
- `.github/` (CI/CD workflows)
- `docker-compose.yml` (for local development)


