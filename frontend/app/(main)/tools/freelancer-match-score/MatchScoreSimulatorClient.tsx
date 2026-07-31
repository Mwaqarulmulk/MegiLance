'use client';

import React, { useState } from 'react';
import AIMatchCard, { FreelancerMatchData } from '@/app/components/AI/AIMatchCard/AIMatchCard';
import Link from 'next/link';

const mockFreelancers: FreelancerMatchData[] = [
  {
    id: 'f1',
    name: 'Sarah Jenkins',
    title: 'Senior React & Next.js Developer',
    avatarUrl: '/images/avatars/female1.png',
    hourlyRate: 85,
    rating: 4.9,
    reviewCount: 38,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'GraphQL'],
    matchScore: 92,
    matchQuality: 'excellent',
    confidenceLevel: 95,
    matchReasons: [
      'Expert in Next.js with 5+ years of experience',
      'Completed 12 similar e-commerce projects on MegiLance',
      'Excellent ratings on frontend performance optimization'
    ],
    whyGoodFit: 'Sarah is in the top 5% of frontend developers on MegiLance with verified experience building headless Shopify and Next.js platforms.',
    availability: 'available',
    completedProjects: 42,
    responseRate: 98,
  },
  {
    id: 'f2',
    name: 'Alex Rivera',
    title: 'Full Stack Python & FastAPI Developer',
    avatarUrl: '/images/avatars/male1.png',
    hourlyRate: 75,
    rating: 4.8,
    reviewCount: 24,
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React', 'AWS'],
    matchScore: 78,
    matchQuality: 'strong',
    confidenceLevel: 88,
    matchReasons: [
      'Strong FastAPI and PostgreSQL integration skills',
      'Familiar with Next.js frontend requirements',
      'AWS deployment certified'
    ],
    whyGoodFit: 'Alex has solid experience in backend API development and has worked successfully with Next.js teams in the SaaS domain.',
    availability: 'available',
    completedProjects: 26,
    responseRate: 95,
  },
  {
    id: 'f3',
    name: 'Mikael Chen',
    title: 'AI Integration & Machine Learning Engineer',
    avatarUrl: '/images/avatars/male2.png',
    hourlyRate: 110,
    rating: 4.7,
    reviewCount: 15,
    skills: ['Python', 'PyTorch', 'OpenAI API', 'FastAPI', 'LangChain', 'LlamaIndex'],
    matchScore: 64,
    matchQuality: 'good',
    confidenceLevel: 75,
    matchReasons: [
      'Experienced with LangChain and API agent architectures',
      'Has backend python integration experience',
    ],
    whyGoodFit: 'Mikael is a specialist in LLM application prototyping but has less direct experience in standard web app routing databases.',
    availability: 'busy',
    completedProjects: 18,
    responseRate: 90,
  }
];

export default function MatchScoreSimulatorClient() {
  const [skillsInput, setSkillsInput] = useState('React, Next.js, Python, FastAPI');
  const [activeSkills, setActiveSkills] = useState(['React', 'Next.js', 'Python', 'FastAPI']);

  const handleUpdateSkills = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');
    setActiveSkills(skills);
  };

  return (
    <div className="space-y-10">
      {/* Interactive Skills Input */}
      <section className="max-w-xl mx-auto mb-10 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-850">
        <form onSubmit={handleUpdateSkills} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Project Required Skills (Comma Separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. React, Python, PostgreSQL, Figma"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
          >
            Simulate Match Scores
          </button>
        </form>
      </section>

      {/* Simulated Matches Grid */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Simulated Matching Candidates
        </h2>
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
            const finalScore = Math.min(100, Math.max(30, scoreBase + (freelancer.rating ? (freelancer.rating - 4.5) * 20 : 0)));

            const updatedFreelancer = {
              ...freelancer,
              matchScore: Math.round(finalScore),
              matchedSkills: matched
            };

            return (
              <div key={freelancer.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 p-4 shadow-sm hover:shadow-md transition">
                <AIMatchCard 
                  freelancer={updatedFreelancer} 
                  requiredSkills={activeSkills} 
                  showActions={false}
                />
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 text-center">
                  <Link 
                    href="/signup?role=freelancer" 
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Invite to Project on MegiLance →
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
