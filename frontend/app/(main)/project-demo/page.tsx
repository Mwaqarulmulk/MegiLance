'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Code, 
  Github, 
  Layers, 
  Database, 
  Cpu, 
  Lock, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import commonStyles from './ProjectDemoPage.common.module.css';

export default function ProjectDemoPage() {
  const mode = useThemeMode();
  const isDark = mode === 'dark';
  const [activeTab, setActiveTab] = useState<'flow' | 'tech' | 'db' | 'escrow'>('flow');

  const demoSteps = [
    {
      title: '1. Client Posts Project',
      desc: 'Client enters details, and our AI parses the text to identify required tech stack skills and timeline constraints.',
      status: 'Active Module'
    },
    {
      title: '2. AI Estimates Budget',
      desc: 'The AI Price Estimator compares requirements with global market rates to suggest budget ranges and milestone tasks.',
      status: 'Active Module'
    },
    {
      title: '3. Freelancer Proposes',
      desc: 'Freelancers submit bids, which are scored dynamically (0-100%) against project requirements using semantic embedding similarity.',
      status: 'Active Module'
    },
    {
      title: '4. Escrow Funding',
      desc: 'Milestone funds are secured in a smart contract wrapper (in USDC or fiat representation) until delivery approval.',
      status: 'Live Escrow Engine'
    },
    {
      title: '5. Automated Vetting',
      desc: 'Real-time NLP scans conversation history and code submissions to flag communication quality and fraud risks.',
      status: 'Active Module'
    }
  ];

  const techStack = [
    {
      layer: 'Frontend UI',
      tools: ['Next.js 16 (App Router)', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      desc: 'Pixel-perfect, accessible interface with instant routing and per-component style isolation.'
    },
    {
      layer: 'Backend API',
      tools: ['FastAPI (Python)', 'Uvicorn', 'Pydantic v2', 'SlowAPI (Rate Limiting)'],
      desc: 'High-performance asynchronous API layer with automatic OpenAPI Swagger generation.'
    },
    {
      layer: 'Database & ORM',
      tools: ['Turso (Edge SQLite/libSQL)', 'SQLAlchemy 2.0', 'Alembic Migrations'],
      desc: 'Distributed relational database optimized for low-latency queries and atomic transactions.'
    },
    {
      layer: 'AI Engineering',
      tools: ['NLP Vetting', 'Semantic Matching Scores', 'Budget Regression Model'],
      desc: 'Dedicated services running text analysis, similarity calculations, and price estimation.'
    },
    {
      layer: 'Blockchain Escrow',
      tools: ['USDC Stablecoin Integration', 'Smart Contract Wrappers'],
      desc: 'Safe milestone funding that locks capital transparently and eliminates non-payment risk.'
    }
  ];

  const dbSchema = [
    {
      table: 'users',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'Unique account identifier' },
        { name: 'email', type: 'VARCHAR', desc: 'Verified user email' },
        { name: 'password_hash', type: 'VARCHAR', desc: 'Securely hashed credentials' },
        { name: 'role', type: 'ENUM', desc: 'client / freelancer / admin' }
      ]
    },
    {
      table: 'profiles',
      fields: [
        { name: 'user_id', type: 'VARCHAR (FK)', desc: 'Refers to users.id' },
        { name: 'bio', type: 'TEXT', desc: 'Professional description' },
        { name: 'avatar', type: 'VARCHAR', desc: 'Profile picture URL' },
        { name: 'skills', type: 'JSON', desc: 'Skills array' }
      ]
    },
    {
      table: 'projects',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'Project identifier' },
        { name: 'client_id', type: 'VARCHAR (FK)', desc: 'Owner reference' },
        { name: 'title', type: 'VARCHAR', desc: 'Project title' },
        { name: 'budget', type: 'INTEGER', desc: 'Target budget in USD' },
        { name: 'status', type: 'VARCHAR', desc: 'draft / active / completed' }
      ]
    },
    {
      table: 'proposals',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'Proposal identifier' },
        { name: 'project_id', type: 'VARCHAR (FK)', desc: 'Target project reference' },
        { name: 'freelancer_id', type: 'VARCHAR (FK)', desc: 'Applicant reference' },
        { name: 'bid_amount', type: 'INTEGER', desc: 'Proposed cost' },
        { name: 'match_score', type: 'FLOAT', desc: 'AI matching score' }
      ]
    }
  ];

  return (
    <main className={cn(commonStyles.main, isDark ? commonStyles.dark : commonStyles.light)}>
      <div className={commonStyles.container}>
        
        {/* Page Header */}
        <header className={commonStyles.header}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
            <Zap size={13} />
            Interactive Portfolio Review
          </div>
          <h1 className={commonStyles.title}>Project Demo &amp; Code Showcase</h1>
          <p className={commonStyles.subtitle}>
            Explore the full-stack engineering, algorithmic logic, and smart contract flows that power MegiLance.
          </p>
          
          <div className={commonStyles.ctaGroup}>
            <a 
              href="https://github.com/ghulam-mujtaba5/MegiLance" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={commonStyles.primaryBtn}
            >
              <Github size={18} />
              Browse GitHub Repository
            </a>
            <Link href="/login" className={commonStyles.secondaryBtn}>
              Launch in Demo Mode
              <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        {/* Tab Selector */}
        <nav className={commonStyles.tabs}>
          <button 
            className={cn(commonStyles.tabBtn, activeTab === 'flow' && commonStyles.tabActive)}
            onClick={() => setActiveTab('flow')}
          >
            <Play size={16} />
            Demo User Flow
          </button>
          <button 
            className={cn(commonStyles.tabBtn, activeTab === 'tech' && commonStyles.tabActive)}
            onClick={() => setActiveTab('tech')}
          >
            <Layers size={16} />
            Tech Stack Details
          </button>
          <button 
            className={cn(commonStyles.tabBtn, activeTab === 'db' && commonStyles.tabActive)}
            onClick={() => setActiveTab('db')}
          >
            <Database size={16} />
            Database Schema
          </button>
          <button 
            className={cn(commonStyles.tabBtn, activeTab === 'escrow' && commonStyles.tabActive)}
            onClick={() => setActiveTab('escrow')}
          >
            <Lock size={16} />
            USDC Smart Escrow
          </button>
        </nav>

        {/* Tab Contents */}
        <section className={commonStyles.contentArea}>
          
          {activeTab === 'flow' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Complete Lifecycle Demonstration</h2>
                  <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
                    MegiLance provides dedicated environments for each role. Register as a Client to post jobs and hire, or register as a Freelancer to bid on projects and receive milestone payouts.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-100 dark:border-blue-900 flex gap-3">
                    <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-blue-750 dark:text-blue-300 leading-relaxed">
                      <strong>Demo Hint:</strong> Use the Quick Login panel on the Login page to bypass input fields and enter testing accounts instantly.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {demoSteps.map((step, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-slate-900 border rounded-2xl flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{step.title}</h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {step.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tech' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {techStack.map((tech, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-slate-900 border rounded-2xl flex flex-col">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{tech.layer}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 flex-grow">{tech.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t">
                    {tech.tools.map((tool, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-850 font-semibold text-slate-650 dark:text-slate-350">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'db' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl flex gap-3 mb-6">
                <Database className="text-blue-500 flex-shrink-0" size={20} />
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                  Below is the schema mapping for MegiLance's relational models, structured in Python using <strong>SQLAlchemy 2.0 ORM</strong> and synchronized dynamically with the remote <strong>Turso libSQL Edge database</strong>.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dbSchema.map((sch, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-850 px-4 py-2.5 border-b font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      table: {sch.table}
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 text-[9px] uppercase font-bold text-slate-400">
                          <th className="px-4 py-1.5">Field</th>
                          <th className="px-4 py-1.5">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sch.fields.map((f, i) => (
                          <tr key={i} className="text-[11px] hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                            <td className="px-4 py-2 font-mono text-slate-800 dark:text-slate-200" title={f.desc}>{f.name}</td>
                            <td className="px-4 py-2 text-slate-500 font-mono">{f.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'escrow' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Milestone-Based Escrow Smart Contract</h2>
                  <p className="text-slate-650 dark:text-slate-400 mb-4 leading-relaxed text-sm">
                    To guarantee transaction safety, MegiLance leverages smart contracts to secure client budgets. Funds are deposited in stablecoins (USDC) and held in escrow, releasing automatically to the freelancer only upon client milestone approval.
                  </p>
                  <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed text-sm">
                    If disputes arise, the contract holds funds securely while a platform administrator reviews milestone artifacts.
                  </p>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border rounded-xl flex gap-2">
                    <ShieldCheck className="text-emerald-500 flex-shrink-0" size={18} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>Deployment Disclaimer:</strong> The smart-contract escrow architecture is fully designed and runs in concept/sandbox mode on our test network node for this portfolio demonstration.
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-slate-50/50 dark:bg-slate-950/30">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-450 mb-4">Escrow Protocol Lifecycle</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">1</div>
                      <p className="text-xs text-slate-650 dark:text-slate-450 leading-relaxed"><strong>Deposit:</strong> Client locks USDC into the contract upon proposal acceptance.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">2</div>
                      <p className="text-xs text-slate-650 dark:text-slate-450 leading-relaxed"><strong>Active Lock:</strong> Funds are visible on the ledger but cannot be retrieved by either party.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">3</div>
                      <p className="text-xs text-slate-650 dark:text-slate-450 leading-relaxed"><strong>Verification:</strong> Freelancer submits deliverables to the workspace contract.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">4</div>
                      <p className="text-xs text-slate-650 dark:text-slate-450 leading-relaxed"><strong>Payout Release:</strong> Client approves; contract releases USDC to the freelancer's wallet address.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </section>

      </div>
    </main>
  );
}
