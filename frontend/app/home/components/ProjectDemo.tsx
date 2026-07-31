'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  Code, 
  Github, 
  Layers, 
  Database, 
  Cpu, 
  Lock, 
  Server, 
  Globe 
} from 'lucide-react';
import commonStyles from './ProjectDemo.common.module.css';

export default function ProjectDemo() {
  const mode = useThemeMode();
  const isDark = mode === 'dark';

  const techCards = [
    {
      icon: <Layers className="text-blue-500" />,
      layer: 'Frontend',
      tools: 'Next.js 16, Tailwind, shadcn/ui, Framer Motion',
      desc: 'Modern App Router rendering with isolated component styles and smooth micro-animations.'
    },
    {
      icon: <Server className="text-indigo-500" />,
      layer: 'Backend',
      tools: 'FastAPI, Python 3.11+, Pydantic',
      desc: 'Asynchronous route handling, strict type validation, and integrated rate limiting.'
    },
    {
      icon: <Database className="text-emerald-500" />,
      layer: 'Database',
      tools: 'Turso/libSQL, SQLAlchemy 2.0',
      desc: 'Edge-replicated relational storage using SQLite dialect with Alembic migrations.'
    },
    {
      icon: <Cpu className="text-amber-500" />,
      layer: 'AI Services',
      tools: 'NLP Matching, Rate Regression, Vetting',
      desc: 'Algorithmic 7-factor talent matching, price estimators, and real-time fraud checking.'
    },
    {
      icon: <Lock className="text-rose-500" />,
      layer: 'Blockchain',
      tools: 'Smart Contract Escrow (USDC)',
      desc: 'Programmatic milestone funding that secures developer earnings and client deposits.'
    },
    {
      icon: <Globe className="text-cyan-500" />,
      layer: 'Deployment',
      tools: 'Vercel, Cloud Hosting',
      desc: 'CI/CD pipeline deployments with decoupled environments and edge CDN delivery.'
    }
  ];

  return (
    <section className={cn(commonStyles.section, isDark ? commonStyles.dark : commonStyles.light)}>
      <div className={commonStyles.container}>
        
        {/* Section Header */}
        <div className={commonStyles.header}>
          <span className={commonStyles.badge}>
            <Code size={13} />
            Built with a modern AI + Web3 stack
          </span>
          <h2 className={commonStyles.title}>Technical Implementation &amp; Architecture</h2>
          <p className={commonStyles.subtitle}>
            MegiLance is engineered as a high-performance enterprise marketplace platform powering intelligent talent matching and decentralized escrow workflows.
          </p>
        </div>

        {/* 3x2 Grid of Tech Layers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {techCards.map((card, idx) => (
            <div 
              key={idx} 
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-850 mb-4">
                {card.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-850 dark:text-slate-250 mb-1">{card.layer}</h3>
              <p className="text-[11px] font-mono text-slate-500 mb-2">{card.tools}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Code Repository CTA */}
        <div className="bg-slate-50 dark:bg-slate-900/40 border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Explore the Complete Codebase</h4>
            <p className="text-xs text-slate-650 dark:text-slate-400 max-w-xl">
              Inspect database schemas, REST endpoints, testing coverages, and frontend components in the public repository.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a 
              href="https://github.com/ghulam-mujtaba5/MegiLance" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.01] transition-transform"
            >
              <Github size={15} />
              View GitHub Repo
            </a>
            <Link 
              href="/project-demo" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-905 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors"
            >
              Architecture & Stack Details
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
