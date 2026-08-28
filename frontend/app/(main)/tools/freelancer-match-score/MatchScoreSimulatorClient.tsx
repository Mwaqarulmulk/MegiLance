'use client';

import React, { useState } from 'react';
import AIMatchCard, { FreelancerMatchData } from '@/app/components/AI/AIMatchCard/AIMatchCard';
import Link from 'next/link';
import { Sparkles, Loader2, Search, ArrowRight } from 'lucide-react';

const mockFreelancers: FreelancerMatchData[] = [
  {
    id: 'f1',
    name: 'Elena Popova',
    title: 'Senior Next.js & React Frontend Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    hourlyRate: 85,
    rating: 4.9,
    reviewCount: 48,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Redux', 'Performance Optimization'],
    matchScore: 94,
    matchQuality: 'excellent',
    confidenceLevel: 96,
    matchReasons: [
      'Expert in Next.js 16 & React 19 architecture with 6+ years experience',
      'Completed 18 verified high-scale marketplace contracts on MegiLance',
      'Top 1% rated in frontend performance and core web vitals',
    ],
    whyGoodFit: 'Elena is a verified Top Talent frontend engineer specializing in responsive modern dashboards and micro-interactions.',
    availability: 'available',
    completedProjects: 52,
    responseRate: 99,
  },
  {
    id: 'f2',
    name: 'Alex Rivera',
    title: 'Senior Python & FastAPI Cloud Backend Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    hourlyRate: 80,
    rating: 4.9,
    reviewCount: 34,
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'SQLAlchemy', 'OAuth2'],
    matchScore: 88,
    matchQuality: 'excellent',
    confidenceLevel: 92,
    matchReasons: [
      'Engineered high-throughput asynchronous APIs and microservices',
      'Expertise in PostgreSQL connection pooling and Turso/libSQL',
      '100% on-time milestone delivery record on MegiLance',
    ],
    whyGoodFit: 'Alex has extensive production experience designing secure REST APIs, role-based access control, and payment webhook pipelines.',
    availability: 'available',
    completedProjects: 38,
    responseRate: 98,
  },
  {
    id: 'f3',
    name: 'Dr. Sarah Chen',
    title: 'AI Integration & LLM RAG Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    hourlyRate: 95,
    rating: 5.0,
    reviewCount: 29,
    skills: ['Python', 'OpenAI API', 'LangChain', 'FastAPI', 'Vector DB', 'PyTorch', 'Fine-Tuning'],
    matchScore: 82,
    matchQuality: 'strong',
    confidenceLevel: 90,
    matchReasons: [
      'Specialist in production RAG systems, vector embeddings and LLM tooling',
      'Published AI research with 5+ years building intelligent agents',
      'Top 5% talent for autonomous agents and structured output parsing',
    ],
    whyGoodFit: 'Sarah is an elite specialist for projects requiring intelligent LLM workflows, conversational bots, and semantic vector search.',
    availability: 'available',
    completedProjects: 31,
    responseRate: 97,
  },
  {
    id: 'f4',
    name: 'Marcus Vance',
    title: 'Principal UI/UX & Design Systems Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    hourlyRate: 75,
    rating: 4.9,
    reviewCount: 41,
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Tailwind CSS', 'Prototyping', 'User Research'],
    matchScore: 78,
    matchQuality: 'strong',
    confidenceLevel: 88,
    matchReasons: [
      'Created multi-brand enterprise design systems and component libraries',
      'Deep expertise in WCAG AA accessibility and mobile-first ergonomics',
      'Consistently praised for clean layout hierarchy and dark mode craft',
    ],
    whyGoodFit: 'Marcus turns complex workflows into intuitive, visually distinctive product interfaces matching Claude & Stripe design standards.',
    availability: 'available',
    completedProjects: 45,
    responseRate: 96,
  },
  {
    id: 'f5',
    name: 'Liam O\'Brien',
    title: 'DevOps, Kubernetes & Cloud Security Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    hourlyRate: 90,
    rating: 4.8,
    reviewCount: 27,
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Security'],
    matchScore: 72,
    matchQuality: 'good',
    confidenceLevel: 85,
    matchReasons: [
      'Automated zero-downtime CI/CD deployment pipelines on GitHub Actions',
      'Infrastructure as Code (IaC) specialist for scalable cloud setups',
    ],
    whyGoodFit: 'Liam provides rock-solid cloud infrastructure, automated testing, and security auditing for fast-growing platforms.',
    availability: 'available',
    completedProjects: 29,
    responseRate: 94,
  },
  {
    id: 'f6',
    name: 'Priya Nair',
    title: 'Senior Full-Stack Web & Mobile Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=200&auto=format&fit=crop&q=80',
    hourlyRate: 70,
    rating: 4.9,
    reviewCount: 36,
    skills: ['React Native', 'React', 'Node.js', 'TypeScript', 'Firebase', 'GraphQL'],
    matchScore: 86,
    matchQuality: 'strong',
    confidenceLevel: 89,
    matchReasons: [
      'Delivered cross-platform iOS/Android apps with offline synchronization',
      'Full-stack JavaScript/TypeScript specialist with end-to-end delivery experience',
    ],
    whyGoodFit: 'Priya is a versatile full-stack engineer who moves rapidly from mobile frontend prototypes to reliable backend integrations.',
    availability: 'available',
    completedProjects: 39,
    responseRate: 98,
  }
];

export default function MatchScoreSimulatorClient() {
  const [skillsInput, setSkillsInput] = useState('React, Next.js, Python, FastAPI, TypeScript');
  const [activeSkills, setActiveSkills] = useState(['React', 'Next.js', 'Python', 'FastAPI', 'TypeScript']);
  const [simulating, setSimulating] = useState(false);

  const handleUpdateSkills = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (skills.length === 0) return;
    
    setSimulating(true);
    setTimeout(() => {
      setActiveSkills(skills);
      setSimulating(false);
    }, 450);
  };

  return (
    <div className="space-y-10">
      {/* Interactive Skills Input */}
      <section className="max-w-2xl mx-auto mb-10 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <form onSubmit={handleUpdateSkills} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              Project Required Skills (Comma Separated)
            </label>
            <div className="relative">
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                placeholder="e.g. React, Python, PostgreSQL, Figma, TypeScript"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Type your required tech stack or skills to run the multi-factor candidate matching simulation.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={simulating}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {simulating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Simulating Match Scores…</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Simulate Match Scores</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* Simulated Matches Grid */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Simulated Matching Candidates
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Ranked by skill relevance, verified ratings, and escrow project history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mockFreelancers.map((freelancer) => {
            // Calculate dynamic score based on matched skills count
            const matched = freelancer.skills.filter(s => 
              activeSkills.some(as => as.toLowerCase() === s.toLowerCase())
            );
            const scoreBase = activeSkills.length > 0 
              ? Math.round((matched.length / activeSkills.length) * 100) 
              : 50;
            
            // Adjust score slightly based on ratings to simulate engine
            const finalScore = Math.min(99, Math.max(45, scoreBase + (freelancer.rating ? (freelancer.rating - 4.5) * 20 : 0)));

            const quality = finalScore >= 88 ? 'excellent' : finalScore >= 75 ? 'strong' : finalScore >= 60 ? 'good' : 'fair';

            const updatedFreelancer = {
              ...freelancer,
              matchScore: Math.round(finalScore),
              matchQuality: quality,
              matchedSkills: matched,
            };

            return (
              <div key={freelancer.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                <AIMatchCard 
                  freelancer={updatedFreelancer} 
                  requiredSkills={activeSkills} 
                  showActions={false}
                />
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link 
                    href={`/freelancers/${freelancer.id}`} 
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>View Full Profile</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
