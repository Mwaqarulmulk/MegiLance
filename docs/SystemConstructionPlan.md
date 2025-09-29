# MegiLance System Construction Plan

This document outlines the complete construction methodology for building the MegiLance freelance marketplace platform from ground up.

---

## Phase 1: Foundation Setup (Weeks 1-2)

### 1.1 Development Environment Setup

#### Local Development Stack
```bash
# Development environment setup script
#!/bin/bash

echo "Setting up MegiLance development environment..."

# Create project structure
mkdir -p megilance/{frontend,backend,ai,db,docs,scripts}
cd megilance

# Frontend setup (Next.js)
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app
npm install @reduxjs/toolkit react-redux axios socket.io-client
npm install -D @types/node

# Backend setup (Spring Boot)
cd ../backend
# Use Spring Initializr or manual setup
mkdir -p src/main/java/com/megilance/{config,controller,entity,repository,service,security}
mkdir -p src/main/resources
mkdir -p src/test/java/com/megilance

# AI Backend setup (FastAPI)
cd ../ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn pandas scikit-learn mongodb pymongo boto3
pip freeze > requirements.txt

# Database setup
cd ../db
# Create database initialization scripts
touch init-postgres.sql init-mongodb.js

echo "Development environment setup complete!"
```

#### Docker Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: megilance-postgres-dev
    environment:
      POSTGRES_DB: megilance_dev
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - ./db/init-postgres.sql:/docker-entrypoint-initdb.d/init.sql
      - postgres_dev_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6
    container_name: megilance-mongodb-dev
    ports:
      - "27017:27017"
    volumes:
      - ./db/init-mongodb.js:/docker-entrypoint-initdb.d/init.js
      - mongodb_dev_data:/data/db

  redis:
    image: redis:7-alpine
    container_name: megilance-redis-dev
    ports:
      - "6379:6379"

volumes:
  postgres_dev_data:
  mongodb_dev_data:
```

### 1.2 Version Control and CI/CD Setup

#### Git Repository Structure
```
megilance/
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       ├── backend-ci.yml
│       ├── ai-ci.yml
│       └── deploy.yml
├── frontend/
├── backend/
├── ai/
├── db/
├── docs/
├── scripts/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── README.md
```

#### GitHub Actions Workflow
```yaml
# .github/workflows/main.yml
name: MegiLance CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm run test
      
      - name: Build application
        run: |
          cd frontend
          npm run build

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: megilance_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Cache Maven packages
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
          restore-keys: ${{ runner.os }}-m2
      
      - name: Run tests
        run: |
          cd backend
          ./mvnw clean test
      
      - name: Build application
        run: |
          cd backend
          ./mvnw clean package -DskipTests

  test-ai:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd ai
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: |
          cd ai
          pytest --cov=./ --cov-report=xml
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  deploy:
    needs: [test-frontend, test-backend, test-ai]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to AWS
        run: |
          echo "Deploying to AWS..."
          # Add deployment scripts here
```

---

## Phase 2: Core Backend Development (Weeks 3-6)

### 2.1 Spring Boot Backend Architecture

#### Project Structure
```
backend/
├── src/main/java/com/megilance/
│   ├── MegilanceApplication.java
│   ├── config/
│   │   ├── DatabaseConfig.java
│   │   ├── SecurityConfig.java
│   │   ├── RedisConfig.java
│   │   └── SwaggerConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── ProjectController.java
│   │   ├── BidController.java
│   │   └── PaymentController.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── Project.java
│   │   ├── Bid.java
│   │   ├── Contract.java
│   │   └── Payment.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── ProjectRepository.java
│   │   ├── BidRepository.java
│   │   └── PaymentRepository.java
│   ├── service/
│   │   ├── UserService.java
│   │   ├── ProjectService.java
│   │   ├── BidService.java
│   │   ├── PaymentService.java
│   │   └── BlockchainService.java
│   └── security/
│       ├── JwtAuthenticationFilter.java
│       └── JwtTokenProvider.java
└── src/main/resources/
    ├── application.yml
    ├── application-dev.yml
    ├── application-prod.yml
    └── db/migration/
        ├── V1__Create_users_table.sql
        ├── V2__Create_projects_table.sql
        └── V3__Create_bids_table.sql
```

#### Core Entity Classes
```java
// User.java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    private UserType userType;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> profileData;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private boolean isVerified = false;
    private boolean isActive = true;
    
    // Getters, setters, constructors
}

// Project.java
@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal budgetMin;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal budgetMax;
    
    @Enumerated(EnumType.STRING)
    private ProjectStatus status;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> skillsRequired;
    
    private LocalDateTime deadline;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<Bid> bids = new ArrayList<>();
    
    // Getters, setters, constructors
}
```

#### Service Layer Implementation
```java
// ProjectService.java
@Service
@Transactional
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    
    public ProjectService(ProjectRepository projectRepository, 
                         UserRepository userRepository,
                         BidRepository bidRepository,
                         RedisTemplate<String, Object> redisTemplate) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.bidRepository = bidRepository;
        this.redisTemplate = redisTemplate;
    }
    
    public Project createProject(CreateProjectRequest request, UUID clientId) {
        User client = userRepository.findById(clientId)
            .orElseThrow(() -> new UserNotFoundException("Client not found"));
        
        Project project = Project.builder()
            .client(client)
            .title(request.getTitle())
            .description(request.getDescription())
            .budgetMin(request.getBudgetMin())
            .budgetMax(request.getBudgetMax())
            .skillsRequired(request.getSkillsRequired())
            .deadline(request.getDeadline())
            .status(ProjectStatus.OPEN)
            .build();
        
        Project savedProject = projectRepository.save(project);
        
        // Cache the project for quick access
        redisTemplate.opsForValue().set(
            "project:" + savedProject.getId(), 
            savedProject, 
            Duration.ofHours(1)
        );
        
        // Trigger AI matching service
        triggerAIMatching(savedProject);
        
        return savedProject;
    }
    
    public Page<Project> getProjects(Pageable pageable, ProjectFilter filter) {
        Specification<Project> spec = ProjectSpecification.withFilter(filter);
        return projectRepository.findAll(spec, pageable);
    }
    
    private void triggerAIMatching(Project project) {
        // Send project to AI service for matching
        CompletableFuture.runAsync(() -> {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String aiServiceUrl = "http://ai-backend:8000/api/match-freelancers";
                restTemplate.postForObject(aiServiceUrl, project, Void.class);
            } catch (Exception e) {
                log.error("Failed to trigger AI matching for project {}", project.getId(), e);
            }
        });
    }
}
```

### 2.2 Database Design and Migration

#### Flyway Migration Scripts
```sql
-- V1__Create_users_table.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_type AS ENUM ('CLIENT', 'FREELANCER', 'ADMIN');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type user_type NOT NULL,
    profile_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);

-- V2__Create_projects_table.sql
CREATE TYPE project_status AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    project_status project_status NOT NULL DEFAULT 'DRAFT',
    skills_required JSONB,
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_created ON projects(created_at);
CREATE INDEX idx_projects_skills ON projects USING GIN (skills_required);

-- V3__Create_bids_table.sql
CREATE TYPE bid_status AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    freelancer_id UUID NOT NULL REFERENCES users(id),
    bid_amount DECIMAL(10,2) NOT NULL,
    proposal TEXT,
    bid_status bid_status NOT NULL DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, freelancer_id)
);

CREATE INDEX idx_bids_project ON bids(project_id);
CREATE INDEX idx_bids_freelancer ON bids(freelancer_id);
CREATE INDEX idx_bids_status ON bids(bid_status);
```

---

## Phase 3: AI/ML Backend Development (Weeks 4-7)

### 3.1 FastAPI AI Service Structure

#### Project Structure
```
ai/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   └── recommendation.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── matching_service.py
│   │   ├── analysis_service.py
│   │   ├── ml_service.py
│   │   └── fraud_detection.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── endpoints/
│   │   │   ├── matching.py
│   │   │   ├── analysis.py
│   │   │   └── recommendations.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── s3_client.py
│   │   └── ml_models.py
│   └── utils/
│       ├── __init__.py
│       ├── text_processing.py
│       └── feature_extraction.py
├── ml_models/
├── data/
├── requirements.txt
└── Dockerfile
```

#### Core AI Services Implementation
```python
# services/matching_service.py
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)

class FreelancerMatchingService:
    def __init__(self, db_client: MongoClient):
        self.db = db_client.megilance
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
    async def find_matching_freelancers(self, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Find freelancers that match a project's requirements
        """
        try:
            # Extract project requirements
            project_description = project_data.get('description', '')
            required_skills = project_data.get('skills_required', [])
            budget_range = (project_data.get('budget_min', 0), project_data.get('budget_max', 0))
            
            # Get active freelancers from database
            freelancers = list(self.db.users.find({
                'user_type': 'FREELANCER',
                'is_active': True,
                'is_verified': True
            }))
            
            if not freelancers:
                return []
            
            # Calculate similarity scores
            matches = []
            for freelancer in freelancers:
                score = await self._calculate_match_score(
                    freelancer, project_description, required_skills, budget_range
                )
                if score > 0.3:  # Minimum match threshold
                    matches.append({
                        'freelancer_id': str(freelancer['_id']),
                        'match_score': score,
                        'reasons': self._get_match_reasons(freelancer, required_skills)
                    })
            
            # Sort by match score
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            return matches[:10]  # Return top 10 matches
            
        except Exception as e:
            logger.error(f"Error in freelancer matching: {e}")
            return []
    
    async def _calculate_match_score(
        self, 
        freelancer: Dict[str, Any], 
        project_description: str,
        required_skills: List[str],
        budget_range: tuple
    ) -> float:
        """Calculate match score between freelancer and project"""
        
        scores = []
        
        # Skills matching score
        freelancer_skills = freelancer.get('profile_data', {}).get('skills', [])
        skill_score = self._calculate_skill_match(freelancer_skills, required_skills)
        scores.append(skill_score * 0.4)  # 40% weight
        
        # Experience matching score
        experience_score = self._calculate_experience_match(
            freelancer.get('profile_data', {}), project_description
        )
        scores.append(experience_score * 0.3)  # 30% weight
        
        # Budget compatibility score
        budget_score = self._calculate_budget_compatibility(
            freelancer.get('profile_data', {}), budget_range
        )
        scores.append(budget_score * 0.2)  # 20% weight
        
        # Rating and reviews score
        rating_score = self._calculate_rating_score(freelancer)
        scores.append(rating_score * 0.1)  # 10% weight
        
        return sum(scores)
    
    def _calculate_skill_match(self, freelancer_skills: List[str], required_skills: List[str]) -> float:
        """Calculate skill matching score"""
        if not required_skills:
            return 0.5
        
        freelancer_skills_lower = [skill.lower() for skill in freelancer_skills]
        required_skills_lower = [skill.lower() for skill in required_skills]
        
        matches = sum(1 for skill in required_skills_lower if skill in freelancer_skills_lower)
        return matches / len(required_skills) if required_skills else 0
    
    def _calculate_experience_match(self, profile: Dict[str, Any], project_description: str) -> float:
        """Calculate experience matching using text similarity"""
        freelancer_bio = profile.get('bio', '')
        freelancer_experience = ' '.join([
            exp.get('description', '') for exp in profile.get('experience', [])
        ])
        
        freelancer_text = f"{freelancer_bio} {freelancer_experience}"
        
        if not freelancer_text.strip() or not project_description.strip():
            return 0.0
        
        try:
            vectors = self.vectorizer.fit_transform([freelancer_text, project_description])
            similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
            return float(similarity)
        except:
            return 0.0
    
    def _calculate_budget_compatibility(self, profile: Dict[str, Any], budget_range: tuple) -> float:
        """Calculate budget compatibility score"""
        freelancer_rate = profile.get('hourly_rate', 0)
        if not freelancer_rate or not any(budget_range):
            return 0.5
        
        budget_min, budget_max = budget_range
        if budget_min <= freelancer_rate <= budget_max:
            return 1.0
        elif freelancer_rate < budget_min:
            return 0.8  # Slightly prefer lower rates
        else:
            return max(0.0, 1.0 - (freelancer_rate - budget_max) / budget_max)
    
    def _calculate_rating_score(self, freelancer: Dict[str, Any]) -> float:
        """Calculate rating-based score"""
        avg_rating = freelancer.get('profile_data', {}).get('average_rating', 0)
        total_reviews = freelancer.get('profile_data', {}).get('total_reviews', 0)
        
        if total_reviews == 0:
            return 0.3  # New freelancers get neutral score
        
        # Normalize rating (assuming 1-5 scale)
        rating_score = (avg_rating - 1) / 4 if avg_rating > 0 else 0
        
        # Boost score for freelancers with more reviews
        review_boost = min(1.0, total_reviews / 10)  # Cap at 10 reviews
        
        return rating_score * (0.7 + 0.3 * review_boost)
```

#### Resume Analysis Service
```python
# services/analysis_service.py
import PyPDF2
import docx
import re
from typing import Dict, List, Any
import spacy
from transformers import pipeline
import boto3

class ResumeAnalysisService:
    def __init__(self, s3_client):
        self.s3_client = s3_client
        self.nlp = spacy.load("en_core_web_sm")
        self.classifier = pipeline("text-classification", 
                                 model="microsoft/DialoGPT-medium")
        
    async def analyze_resume(self, file_url: str) -> Dict[str, Any]:
        """Analyze uploaded resume and extract key information"""
        try:
            # Download file from S3
            file_content = await self._download_file(file_url)
            
            # Extract text based on file type
            text = await self._extract_text(file_content, file_url)
            
            # Perform analysis
            analysis = {
                'skills': await self._extract_skills(text),
                'experience': await self._extract_experience(text),
                'education': await self._extract_education(text),
                'contact_info': await self._extract_contact_info(text),
                'summary': await self._generate_summary(text),
                'quality_score': await self._calculate_quality_score(text)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing resume: {e}")
            return {'error': str(e)}
    
    async def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from resume text"""
        # Common technical skills patterns
        skill_patterns = [
            r'\b(?:Python|Java|JavaScript|TypeScript|React|Angular|Vue|Node\.js|Spring|Django|Flask)\b',
            r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|MongoDB|PostgreSQL|MySQL)\b',
            r'\b(?:Machine Learning|AI|Data Science|Deep Learning|TensorFlow|PyTorch)\b',
            r'\b(?:HTML|CSS|SCSS|Bootstrap|Tailwind|jQuery|Express|FastAPI)\b'
        ]
        
        skills = []
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            skills.extend(matches)
        
        # Remove duplicates and normalize
        unique_skills = list(set([skill.lower().title() for skill in skills]))
        return unique_skills
    
    async def _extract_experience(self, text: str) -> List[Dict[str, Any]]:
        """Extract work experience from resume"""
        doc = self.nlp(text)
        
        # Look for date patterns and job titles
        date_pattern = r'\b(?:20\d{2}|19\d{2})\b'
        
        experiences = []
        sentences = [sent.text for sent in doc.sents]
        
        for i, sentence in enumerate(sentences):
            if any(keyword in sentence.lower() for keyword in ['experience', 'work', 'employment', 'job']):
                # Extract subsequent sentences that might contain experience details
                experience_text = ' '.join(sentences[i:i+3])
                dates = re.findall(date_pattern, experience_text)
                
                if dates:
                    experiences.append({
                        'text': experience_text,
                        'years': len(set(dates)),
                        'dates': dates
                    })
        
        return experiences
    
    async def _calculate_quality_score(self, text: str) -> float:
        """Calculate overall resume quality score"""
        scores = []
        
        # Length score (optimal resume length)
        word_count = len(text.split())
        if 300 <= word_count <= 800:
            scores.append(1.0)
        elif word_count < 300:
            scores.append(word_count / 300)
        else:
            scores.append(max(0.5, 1.0 - (word_count - 800) / 1000))
        
        # Structure score (sections present)
        sections = ['experience', 'education', 'skills', 'contact']
        section_score = sum(1 for section in sections if section in text.lower()) / len(sections)
        scores.append(section_score)
        
        # Grammar and readability (simplified)
        doc = self.nlp(text)
        error_rate = sum(1 for token in doc if token.is_alpha and token.lemma_ == 'UNKNOWN') / len(doc)
        grammar_score = max(0.0, 1.0 - error_rate)
        scores.append(grammar_score)
        
        return sum(scores) / len(scores)
```

---

## Phase 4: Frontend Development (Weeks 5-8)

### 4.1 Next.js Application Structure

#### Project Structure
```
frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── freelancers/
│   │   └── messages/
│   └── api/
│       ├── auth/
│       └── proxy/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   ├── ProjectForm.tsx
│   │   └── BidForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── features/
│       ├── projects/
│       ├── messaging/
│       └── payments/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── store.ts
│   └── utils.ts
├── styles/
├── types/
└── hooks/
```

#### Core Components Implementation
```typescript
// components/forms/ProjectForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ProjectFormData {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  skillsRequired: string[];
  deadline: string;
}

export function ProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    budgetMin: 0,
    budgetMax: 0,
    skillsRequired: [],
    deadline: '',
  });

  const skillOptions = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'Java', 'Spring Boot', 'AWS', 'Docker', 'MongoDB'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/projects', formData);
      toast.success('Project created successfully!');
      router.push(`/projects/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to create project');
      console.error('Project creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Post a New Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Project Title
          </label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a descriptive project title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Project Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your project requirements, goals, and expectations"
            rows={6}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="budgetMin" className="block text-sm font-medium mb-2">
              Minimum Budget ($)
            </label>
            <Input
              id="budgetMin"
              type="number"
              value={formData.budgetMin}
              onChange={(e) => handleInputChange('budgetMin', Number(e.target.value))}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="budgetMax" className="block text-sm font-medium mb-2">
              Maximum Budget ($)
            </label>
            <Input
              id="budgetMax"
              type="number"
              value={formData.budgetMax}
              onChange={(e) => handleInputChange('budgetMax', Number(e.target.value))}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Required Skills
          </label>
          <MultiSelect
            options={skillOptions}
            selected={formData.skillsRequired}
            onChange={(skills) => handleInputChange('skillsRequired', skills)}
            placeholder="Select required skills"
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium mb-2">
            Project Deadline
          </label>
          <Input
            id="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Create Project
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
```

#### State Management with Redux Toolkit
```typescript
// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { projectsSlice } from './slices/projectsSlice';
import { messagesSlice } from './slices/messagesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    projects: projectsSlice.reducer,
    messages: messagesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// lib/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'CLIENT' | 'FREELANCER';
  profileData?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
```

---

## Phase 5: Integration and Testing (Weeks 9-10)

### 5.1 Integration Testing Strategy

#### Backend Integration Tests
```java
// ProjectIntegrationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
@Testcontainers
class ProjectIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("megilance_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldCreateProjectSuccessfully() {
        // Given
        User client = createTestClient();
        userRepository.save(client);

        CreateProjectRequest request = CreateProjectRequest.builder()
                .title("Test Project")
                .description("Test Description")
                .budgetMin(BigDecimal.valueOf(100))
                .budgetMax(BigDecimal.valueOf(500))
                .skillsRequired(List.of("Java", "Spring Boot"))
                .deadline(LocalDateTime.now().plusDays(30))
                .build();

        String token = generateAuthToken(client);
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<CreateProjectRequest> entity = new HttpEntity<>(request, headers);

        // When
        ResponseEntity<ProjectResponse> response = restTemplate.postForEntity(
                "/api/projects", entity, ProjectResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Test Project");

        // Verify in database
        List<Project> projects = projectRepository.findAll();
        assertThat(projects).hasSize(1);
        assertThat(projects.get(0).getTitle()).isEqualTo("Test Project");
    }

    @Test
    void shouldReturnProjectsWithPagination() {
        // Given
        User client = createTestClient();
        userRepository.save(client);
        
        for (int i = 1; i <= 15; i++) {
            Project project = createTestProject(client, "Project " + i);
            projectRepository.save(project);
        }

        String token = generateAuthToken(client);
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // When
        ResponseEntity<PagedResponse<ProjectResponse>> response = restTemplate.exchange(
                "/api/projects?page=0&size=10", HttpMethod.GET, entity, 
                new ParameterizedTypeReference<PagedResponse<ProjectResponse>>() {});

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent()).hasSize(10);
        assertThat(response.getBody().getTotalElements()).isEqualTo(15);
    }

    private User createTestClient() {
        return User.builder()
                .email("client@test.com")
                .passwordHash("hashedpassword")
                .firstName("Test")
                .lastName("Client")
                .userType(UserType.CLIENT)
                .isVerified(true)
                .isActive(true)
                .build();
    }
}
```

#### Frontend Component Tests
```typescript
// __tests__/components/ProjectForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { authSlice } from '@/lib/slices/authSlice';
import * as api from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockStore = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  preloadedState: {
    auth: {
      user: { id: '1', email: 'test@test.com', userType: 'CLIENT' },
      token: 'test-token',
      loading: false,
      error: null,
    },
  },
});

describe('ProjectForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <Provider store={mockStore}>
        <ProjectForm />
      </Provider>
    );

    expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum budget/i)).toBeInTheDocument();
    expect(screen.getByText(/required skills/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project deadline/i)).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    const mockApiPost = jest.spyOn(api, 'post').mockResolvedValue({
      data: { id: '123', title: 'Test Project' },
    });

    render(
      <Provider store={mockStore}>
        <ProjectForm />
      </Provider>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/project title/i), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(screen.getByLabelText(/project description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/minimum budget/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/maximum budget/i), {
      target: { value: '500' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/projects', {
        title: 'Test Project',
        description: 'Test Description',
        budgetMin: 100,
        budgetMax: 500,
        skillsRequired: [],
        deadline: '',
      });
    });
  });

  it('displays error message on API failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(new Error('API Error'));

    render(
      <Provider store={mockStore}>
        <ProjectForm />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/project title/i), {
      target: { value: 'Test Project' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create project/i)).toBeInTheDocument();
    });
  });
});
```

### 5.2 End-to-End Testing

#### Playwright E2E Tests
```typescript
// e2e/project-lifecycle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Project Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Login as client
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'client@test.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete full project lifecycle', async ({ page, context }) => {
    // Step 1: Create a new project
    await page.click('[data-testid=create-project-button]');
    await expect(page).toHaveURL('/projects/new');

    await page.fill('[data-testid=project-title]', 'E2E Test Project');
    await page.fill('[data-testid=project-description]', 'This is a test project for E2E testing');
    await page.fill('[data-testid=budget-min]', '100');
    await page.fill('[data-testid=budget-max]', '500');
    
    // Select skills
    await page.click('[data-testid=skills-select]');
    await page.click('[data-testid=skill-javascript]');
    await page.click('[data-testid=skill-react]');
    
    // Set deadline
    await page.fill('[data-testid=deadline]', '2024-12-31T23:59');
    
    await page.click('[data-testid=submit-project]');
    
    // Verify project created
    await expect(page.locator('[data-testid=success-message]')).toContainText('Project created successfully');
    
    // Step 2: Open new tab as freelancer
    const freelancerPage = await context.newPage();
    await freelancerPage.goto('/login');
    await freelancerPage.fill('[data-testid=email]', 'freelancer@test.com');
    await freelancerPage.fill('[data-testid=password]', 'password123');
    await freelancerPage.click('[data-testid=login-button]');
    
    // Navigate to projects
    await freelancerPage.goto('/projects');
    await freelancerPage.click('[data-testid=project-card]:has-text("E2E Test Project")');
    
    // Submit bid
    await freelancerPage.fill('[data-testid=bid-amount]', '300');
    await freelancerPage.fill('[data-testid=bid-proposal]', 'I am interested in this project and have relevant experience.');
    await freelancerPage.click('[data-testid=submit-bid]');
    
    await expect(freelancerPage.locator('[data-testid=success-message]')).toContainText('Bid submitted successfully');
    
    // Step 3: Back to client - accept bid
    await page.reload();
    await page.goto('/projects');
    await page.click('[data-testid=my-projects-tab]');
    await page.click('[data-testid=project-card]:has-text("E2E Test Project")');
    
    // View bids
    await page.click('[data-testid=view-bids-button]');
    await expect(page.locator('[data-testid=bid-card]')).toBeVisible();
    await page.click('[data-testid=accept-bid-button]');
    
    // Confirm acceptance
    await page.click('[data-testid=confirm-accept-button]');
    await expect(page.locator('[data-testid=success-message]')).toContainText('Bid accepted');
    
    // Step 4: Verify contract creation
    await page.goto('/contracts');
    await expect(page.locator('[data-testid=contract-card]:has-text("E2E Test Project")')).toBeVisible();
    
    // Step 5: Send message
    await page.click('[data-testid=contract-card]:has-text("E2E Test Project")');
    await page.click('[data-testid=send-message-button]');
    await page.fill('[data-testid=message-input]', 'Looking forward to working with you!');
    await page.click('[data-testid=send-button]');
    
    // Verify message sent
    await expect(page.locator('[data-testid=message]:has-text("Looking forward to working with you!")')).toBeVisible();
  });

  test('should handle project search and filtering', async ({ page }) => {
    await page.goto('/projects');
    
    // Test search
    await page.fill('[data-testid=search-input]', 'JavaScript');
    await page.press('[data-testid=search-input]', 'Enter');
    
    // Wait for results
    await page.waitForSelector('[data-testid=project-card]');
    
    // Verify search results contain JavaScript
    const projectCards = page.locator('[data-testid=project-card]');
    const count = await projectCards.count();
    
    for (let i = 0; i < count; i++) {
      const card = projectCards.nth(i);
      await expect(card).toContainText(/javascript/i);
    }
    
    // Test filters
    await page.click('[data-testid=budget-filter]');
    await page.click('[data-testid=budget-100-500]');
    
    await page.waitForTimeout(1000); // Wait for filter to apply
    
    // Verify filtered results
    const filteredCards = page.locator('[data-testid=project-card]');
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBeGreaterThan(0);
  });
});
```

---

This comprehensive construction plan provides a detailed roadmap for building the MegiLance platform, covering all aspects from initial setup to deployment and testing. Each phase builds upon the previous one, ensuring a systematic and well-structured development process.
