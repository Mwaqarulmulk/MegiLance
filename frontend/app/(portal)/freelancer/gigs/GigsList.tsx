'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Briefcase, Plus, Search } from 'lucide-react';
import Button from '@/app/components/atoms/Button/Button';

export default function GigsList() {
  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="text-blue-500" size={24} />
            My Gigs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your service gig listings, pricing packages, and orders.
          </p>
        </div>
        <Link href="/freelancer/gigs/create">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Create a Gig
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
          <Sparkles size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">No Active Gigs Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
          You haven't created any service gigs yet. Publish your first gig package to receive order requests from start-up clients.
        </p>
        <div className="pt-2">
          <Link href="/freelancer/gigs/create">
            <Button variant="outline" size="sm">
              Publish Your First Gig
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
