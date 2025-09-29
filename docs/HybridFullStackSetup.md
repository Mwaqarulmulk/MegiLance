# Hybrid Full-Stack Setup

Reference guide for stack decisions. See `README.md` in this folder for the docs index.

Perfect timing, Mujtaba. This document captures the latest decisions (hybrid architecture, AWS-to-Oracle migration plan, and AI plus blockchain FYP requirements) as a final blueprint suitable for FYP documentation and implementation.

---

## Finalized FYP Architecture & Cloud Strategy (2025)

### 1. Platform Vision

- AI and blockchain-powered freelance marketplace.
- Hybrid architecture with one backend for enterprise core transactions and another for AI and data intelligence.
- Must operate on free cloud tiers now and scale later.
- Cloud-agnostic design to support AWS, Oracle, and Azure.

### 2. Core Architecture

#### Frontend (Common)

- Technology: Next.js (React, Node.js runtime).
- Deployment: Vercel free tier.
- Feature scope: authentication, dashboards (client, freelancer, admin), project posting, bidding, chat, and payments.

#### Backend 1 (Enterprise/Core System)

- Technology: Spring Boot with AWS RDS (SQL).
- Rationale: enterprise reliability and structured transactional storage.
- Responsibilities:
  - Manage users, roles, and permissions.
  - Persist contracts, payments, and blockchain transaction references in PostgreSQL or MySQL on RDS.
  - Orchestrate project lifecycle stages (post, bid, hire, complete).
  - Provide enterprise features such as notifications and secure workflows.

#### Backend 2 (AI/Data Layer)

- Technology: Python (FastAPI or Django) with MongoDB Atlas and AWS S3.
- Rationale: optimized for AI/ML workloads and unstructured data handling.
- Responsibilities:
  - AI capabilities: resume and portfolio analysis, smart freelancer-client matching, fake job and fraud detection.
  - MongoDB Atlas for logs, ML training sets, and activity history.
  - AWS S3 for CVs, project files, datasets, and contracts.

#### Blockchain Layer

- Platform: Ethereum testnet or Polygon via Infura or Alchemy.
- Purpose: record contract hashes and payment proofs to secure trust and transparency.

### 3. Hosting and Deployment

- Frontend (Next.js): Vercel free tier or aws or any other suitable 
- Backend 1 (Spring Boot): AWS Elastic Beanstalk or EC2.
- Backend 2 (FastAPI or Django): AWS Lambda for lightweight APIs or EC2 for heavier AI workloads.
- Databases and storage:
  - PostgreSQL or MySQL on AWS RDS.
  - MongoDB Atlas free tier.
  - AWS S3 with the 5 GB free allowance.

### 4. Cloud Strategy (AWS to Oracle Migration)

- Phase 1: Build on AWS free tier using EC2, RDS, S3, Lambda, and Vercel.
- Phase 2: Migrate to Oracle Always Free for long-term hosting if need.
  - Oracle Autonomous Database replacing RDS.
  - Oracle Object Storage replacing S3.
  - Dockerized Spring Boot and FastAPI services deployed to Oracle VM or Kubernetes.
- Migration is simplified via Docker, PostgreSQL compatibility, and custom JWT authentication.

### 5. Architecture Type

- Cloud-native microservices.
- Polyglot persistence (SQL, NoSQL, object storage).
- Hybrid service-oriented design (Spring Boot for enterprise workflows, FastAPI for AI and data).

### 6. Career and Portfolio Benefits

- Demonstrated expertise with Next.js, Spring Boot, FastAPI or Django.
- Experience with PostgreSQL, MongoDB, AWS S3, and blockchain integration.
- Cloud-native deployment across AWS and Oracle.
- Portfolio highlight: "Built a hybrid microservices freelance platform on AWS, later migrated to Oracle Always Free for lifetime hosting."

### 7. Action Plan

1. Configure AWS account with MFA and billing alerts.
2. Deploy the Next.js frontend on Vercel.
3. Deploy the Spring Boot backend on Elastic Beanstalk and connect AWS RDS.
4. Deploy the FastAPI AI microservice on Lambda or EC2, backed by MongoDB Atlas and S3.
5. Integrate the frontend with both backends via REST APIs.
6. Add blockchain support for contract and payment hashing.
7. Dockerize both backend services to enable migration.
8. Test migration to Oracle Always Free infrastructure.
9. Assemble documentation and diagrams for the FYP report.

---

This setup delivers a scalable, real-world stack with integrated AI and blockchain components and positions the project for future opportunities.
