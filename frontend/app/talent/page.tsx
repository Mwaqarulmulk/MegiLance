// @AI-HINT: Public talent directory preview page.
'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface TalentProfile { id: string; name: string; role: string; rank: number; skills: string[]; avatar: string; }

const mock: TalentProfile[] = Array.from({ length: 8 }).map((_, i) => ({
  id: 't' + i,
  name: ['Aisha Khan','Bilal Ahmed','Sara Malik','Omar Farooq','Hira Javed','Zain Raza','Fatima Noor','Adnan Saeed'][i],
  role: ['Full Stack Dev','Data Scientist','UI/UX Designer','Blockchain Dev','ML Engineer','Backend Dev','Frontend Dev','DevOps Engineer'][i],
  rank: Math.round(Math.random()*100),
  skills: ['React','Node','AI','Python','Solidity','Postgres','Tailwind'].sort(() => .5 - Math.random()).slice(0,3),
  avatar: `https://i.pravatar.cc/120?img=${i+10}`
}));

export default function TalentDirectoryPage() {
  const { theme } = useTheme();
  const [q, setQ] = useState('');
  const filtered = mock.filter(m => !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.skills.some(s => s.toLowerCase().includes(q.toLowerCase())));

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Explore Top Talent</h1>
        <p className="mt-2 opacity-80">Preview a slice of our AI-ranked freelancer pool.</p>
        <div className="mt-6 flex justify-center">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search by name or skill..."
            className="w-full max-w-md rounded-md border px-4 py-2 bg-[var(--surface-elev)] border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            aria-label="Search talent"
          />
        </div>
      </header>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
        {filtered.map(p => (
          <li key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-elev)] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold leading-tight">{p.name}</h3>
                <p className="text-sm opacity-75">{p.role}</p>
              </div>
              <span className="ml-auto text-xs font-medium bg-[var(--primary)] text-[var(--text-on-primary)] px-2 py-1 rounded-md">Rank {p.rank}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.skills.map(s => <span key={s} className="text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] px-2 py-1">{s}</span>)}
            </div>
            <button className="mt-auto text-sm font-medium text-[var(--primary)] hover:underline self-start">View Profile</button>
          </li>
        ))}
        {filtered.length === 0 && <li className="col-span-full text-center opacity-70">No matches.</li>}
      </ul>
    </main>
  );
}
