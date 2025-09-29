# Notice: This file is deprecated

This preview has been consolidated. Please use the canonical doc: `docs/SystemArchitectureDiagrams.md`.

---

# MegiLance System Diagrams Preview

This file contains all the key diagrams from your system architecture documentation for easy viewing in VS Code.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    %% Client Layer
    subgraph "Client Layer"
        Web[Web Application<br/>Next.js React]
        Mobile[Mobile App<br/>Future Enhancement]
    end

    %% API Gateway
    Gateway[API Gateway<br/>Load Balancer]

    %% Backend Services
    subgraph "Backend Services"
        subgraph "Enterprise Backend"
            SpringBoot[Spring Boot API<br/>User Management<br/>Project Lifecycle<br/>Payments]
            Auth[Authentication Service<br/>JWT/OAuth]
        end
        
        subgraph "AI/ML Backend"
            FastAPI[FastAPI Service<br/>AI Matching<br/>Resume Analysis<br/>Fraud Detection]
            MLEngine[ML Processing Engine]
        end
    end

    %% Data Layer
    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL<br/>Users, Projects,<br/>Contracts, Payments)]
        MongoDB[(MongoDB Atlas<br/>Logs, ML Data,<br/>Analytics)]
        S3[AWS S3<br/>File Storage<br/>Documents, Media]
    end

    %% Blockchain Layer
    subgraph "Blockchain Layer"
        Ethereum[Ethereum/Polygon<br/>Smart Contracts<br/>Payment Proofs]
        IPFS[IPFS<br/>Decentralized Storage]
    end

    %% External Services
    subgraph "External Services"
        PaymentGW[Payment Gateway<br/>Stripe/PayPal]
        EmailService[Email Service<br/>SendGrid/SES]
        NotificationService[Push Notifications<br/>Firebase/OneSignal]
    end

    %% Connections
    Web --> Gateway
    Mobile --> Gateway
    Gateway --> SpringBoot
    Gateway --> FastAPI
    
    SpringBoot --> Auth
    SpringBoot --> PostgreSQL
    SpringBoot --> Ethereum
    SpringBoot --> PaymentGW
    SpringBoot --> EmailService
    
    FastAPI --> MongoDB
    FastAPI --> S3
    FastAPI --> MLEngine
    
    Auth --> PostgreSQL
    
    SpringBoot --> NotificationService
    Ethereum --> IPFS
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef blockchain fill:#fff3e0
    classDef external fill:#fce4ec
    
    class Web,Mobile frontend
    class SpringBoot,FastAPI,Auth,MLEngine backend
    class PostgreSQL,MongoDB,S3 database
    class Ethereum,IPFS blockchain
    class PaymentGW,EmailService,NotificationService external
```

---

## 2. Database Schema (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum user_type
        json profile_data
        timestamp created_at
        timestamp updated_at
        boolean is_verified
        boolean is_active
    }

    PROJECTS {
        uuid id PK
        uuid client_id FK
        string title
        text description
        decimal budget_min
        decimal budget_max
        enum project_status
        json skills_required
        timestamp deadline
        timestamp created_at
        timestamp updated_at
    }

    BIDS {
        uuid id PK
        uuid project_id FK
        uuid freelancer_id FK
        decimal bid_amount
        text proposal
        enum bid_status
        timestamp submitted_at
        timestamp updated_at
    }

    CONTRACTS {
        uuid id PK
        uuid project_id FK
        uuid client_id FK
        uuid freelancer_id FK
        decimal contract_amount
        text terms
        string blockchain_hash
        enum contract_status
        timestamp start_date
        timestamp end_date
        timestamp created_at
    }

    PAYMENTS {
        uuid id PK
        uuid contract_id FK
        decimal amount
        enum payment_type
        enum payment_status
        string transaction_id
        string blockchain_tx_hash
        timestamp processed_at
        timestamp created_at
    }

    SKILLS {
        uuid id PK
        string name UK
        string category
        text description
        boolean is_active
    }

    USER_SKILLS {
        uuid user_id FK
        uuid skill_id FK
        integer proficiency_level
        boolean is_verified
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid contract_id FK
        uuid reviewer_id FK
        uuid reviewee_id FK
        integer rating
        text comment
        timestamp created_at
    }

    MESSAGES {
        uuid id PK
        uuid sender_id FK
        uuid receiver_id FK
        uuid project_id FK
        text content
        json attachments
        boolean is_read
        timestamp sent_at
    }

    %% Relationships
    USERS ||--o{ PROJECTS : "client creates"
    USERS ||--o{ BIDS : "freelancer submits"
    PROJECTS ||--o{ BIDS : "receives"
    PROJECTS ||--|| CONTRACTS : "converts to"
    CONTRACTS ||--o{ PAYMENTS : "includes"
    USERS ||--o{ USER_SKILLS : "has"
    SKILLS ||--o{ USER_SKILLS : "assigned to"
    CONTRACTS ||--o{ REVIEWS : "generates"
    USERS ||--o{ MESSAGES : "sends"
    USERS ||--o{ MESSAGES : "receives"
```

---

## 3. Data Flow Architecture

```mermaid
flowchart TD
    subgraph "User Interface"
        Client[Client Dashboard]
        Freelancer[Freelancer Dashboard]
        Admin[Admin Panel]
    end

    subgraph "API Layer"
        REST[REST APIs]
        GraphQL[GraphQL Endpoint]
        WebSocket[WebSocket Connection]
    end

    subgraph "Business Logic"
        AuthLogic[Authentication Logic]
        ProjectLogic[Project Management Logic]
        PaymentLogic[Payment Processing Logic]
        AILogic[AI Processing Logic]
    end

    subgraph "Data Processing"
        Validation[Data Validation]
        Transformation[Data Transformation]
        Encryption[Data Encryption]
    end

    subgraph "Storage Layer"
        RDBMS[(Relational Database<br/>PostgreSQL)]
        NoSQL[(Document Database<br/>MongoDB)]
        Cache[(Cache Layer<br/>Redis)]
        Files[File Storage<br/>AWS S3]
        Blockchain[Blockchain<br/>Ethereum]
    end

    %% Data Flow
    Client --> REST
    Freelancer --> REST
    Admin --> GraphQL
    
    REST --> AuthLogic
    GraphQL --> AuthLogic
    WebSocket --> AuthLogic
    
    AuthLogic --> ProjectLogic
    ProjectLogic --> PaymentLogic
    ProjectLogic --> AILogic
    
    ProjectLogic --> Validation
    PaymentLogic --> Validation
    AILogic --> Validation
    
    Validation --> Transformation
    Transformation --> Encryption
    
    Encryption --> RDBMS
    Encryption --> NoSQL
    Encryption --> Cache
    Encryption --> Files
    Encryption --> Blockchain
    
    %% Real-time data flow
    WebSocket -.-> Cache
    Cache -.-> WebSocket
```

---

## 4. Microservices Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        NextJS[Next.js Application<br/>- User Interface<br/>- Client-side Routing<br/>- State Management]
    end

    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>- Rate Limiting<br/>- Authentication<br/>- Load Balancing<br/>- Request Routing]
    end

    subgraph "Microservices"
        subgraph "Core Services"
            UserService[User Service<br/>- Registration/Login<br/>- Profile Management<br/>- Role Management]
            
            ProjectService[Project Service<br/>- Project Creation<br/>- Bidding System<br/>- Project Lifecycle]
            
            PaymentService[Payment Service<br/>- Transaction Processing<br/>- Escrow Management<br/>- Blockchain Integration]
            
            ContractService[Contract Service<br/>- Contract Creation<br/>- Digital Signatures<br/>- Legal Compliance]
        end
        
        subgraph "AI Services"
            MatchingService[AI Matching Service<br/>- Skill-based Matching<br/>- Recommendation Engine<br/>- Success Prediction]
            
            AnalysisService[Analysis Service<br/>- Resume Parsing<br/>- Portfolio Analysis<br/>- Fraud Detection]
            
            MLService[ML Training Service<br/>- Model Training<br/>- Data Processing<br/>- Feature Engineering]
        end
        
        subgraph "Support Services"
            NotificationService[Notification Service<br/>- Email Notifications<br/>- Push Notifications<br/>- SMS Alerts]
            
            FileService[File Service<br/>- File Upload/Download<br/>- Document Management<br/>- Media Processing]
            
            ChatService[Chat Service<br/>- Real-time Messaging<br/>- Message History<br/>- File Sharing]
        end
    end

    subgraph "Data Layer"
        PostgresMain[(PostgreSQL<br/>Primary Database)]
        MongoAI[(MongoDB<br/>AI/Analytics Data)]
        Redis[(Redis<br/>Cache & Sessions)]
        S3Storage[S3 Bucket<br/>File Storage]
    end

    subgraph "Blockchain Layer"
        SmartContracts[Smart Contracts<br/>Ethereum/Polygon]
    end

    %% Connections
    NextJS --> Gateway
    Gateway --> UserService
    Gateway --> ProjectService
    Gateway --> PaymentService
    Gateway --> ContractService
    Gateway --> MatchingService
    Gateway --> AnalysisService
    Gateway --> NotificationService
    Gateway --> FileService
    Gateway --> ChatService
    
    UserService --> PostgresMain
    ProjectService --> PostgresMain
    PaymentService --> PostgresMain
    ContractService --> PostgresMain
    
    MatchingService --> MongoAI
    AnalysisService --> MongoAI
    MLService --> MongoAI
    
    FileService --> S3Storage
    
    PaymentService --> SmartContracts
    ContractService --> SmartContracts
    
    UserService --> Redis
    ChatService --> Redis
```

---

## 5. CI/CD Pipeline Architecture

```mermaid
flowchart LR
    subgraph "Source Control"
        GitHub[GitHub Repository]
        Branches[Feature Branches]
    end

    subgraph "CI Pipeline"
        Trigger[Webhook Trigger]
        Build[Build Process]
        Test[Automated Testing]
        Security[Security Scanning]
        Quality[Code Quality Check]
    end

    subgraph "Artifact Management"
        Registry[Container Registry]
        S3Artifacts[S3 Artifact Storage]
    end

    subgraph "CD Pipeline"
        Dev[Development Environment]
        Staging[Staging Environment]
        Prod[Production Environment]
    end

    subgraph "Deployment"
        Infrastructure[Infrastructure as Code]
        Containers[Container Orchestration]
        Database[Database Migration]
        Configuration[Configuration Management]
    end

    subgraph "Monitoring"
        HealthCheck[Health Checks]
        Metrics[Performance Metrics]
        Alerts[Alert System]
        Rollback[Automatic Rollback]
    end

    %% Flow
    GitHub --> Trigger
    Branches --> Trigger
    Trigger --> Build
    Build --> Test
    Test --> Security
    Security --> Quality
    Quality --> Registry
    Quality --> S3Artifacts
    
    Registry --> Dev
    Dev --> Staging
    Staging --> Prod
    
    Prod --> Infrastructure
    Infrastructure --> Containers
    Containers --> Database
    Database --> Configuration
    
    Configuration --> HealthCheck
    HealthCheck --> Metrics
    Metrics --> Alerts
    Alerts --> Rollback
```

---

## How to View These Diagrams in VS Code:

1. Prefer opening the canonical doc: `docs/SystemArchitectureDiagrams.md` in VS Code
2. **Press `Ctrl+Shift+V`** to open Markdown Preview
3. **All diagrams will render beautifully** in the preview pane
4. You can also **right-click** on any diagram and select "Copy as Image" for presentations

## For Individual Diagrams:
- Open any of the documentation files (SystemArchitectureDiagrams.md, DatabaseDesignSpecs.md, etc.)
- Use Markdown Preview (`Ctrl+Shift+V`) to see all diagrams rendered

The Mermaid extension is already installed, so all diagrams should render perfectly! 🎉