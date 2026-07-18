'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Briefcase, Plus, Save, Trash2, Play, Pause, 
  Eye, AlertCircle, CheckCircle, HelpCircle, DollarSign, Clock, RotateCcw
} from 'lucide-react';
import Button from '@/app/components/atoms/Button/Button';
import { gigsApi } from '@/lib/api/gigs';
import { categoriesApi } from '@/lib/api/search';
import type { Category, Gig } from '@/types/api';

export default function GigsList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingGig, setExistingGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Packages State
  const [basicTitle, setBasicTitle] = useState('Basic Package');
  const [basicDesc, setBasicDesc] = useState('');
  const [basicPrice, setBasicPrice] = useState('25');
  const [basicDelivery, setBasicDelivery] = useState('3');
  const [basicRevisions, setBasicRevisions] = useState('1');

  const [standardTitle, setStandardTitle] = useState('Standard Package');
  const [standardDesc, setStandardDesc] = useState('');
  const [standardPrice, setStandardPrice] = useState('75');
  const [standardDelivery, setStandardDelivery] = useState('5');
  const [standardRevisions, setStandardRevisions] = useState('3');

  const [premiumTitle, setPremiumTitle] = useState('Premium Package');
  const [premiumDesc, setPremiumDesc] = useState('');
  const [premiumPrice, setPremiumPrice] = useState('150');
  const [premiumDelivery, setPremiumDelivery] = useState('7');
  const [premiumRevisions, setPremiumRevisions] = useState('5');

  // FAQs State
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([
    { question: 'What inputs do you need to start?', answer: 'I will need your design assets, detailed wireframes or requirements, and reference websites you like.' }
  ]);

  const loadCategoriesAndGig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch categories
      let cats: Category[] = [];
      try {
        const catRes = await categoriesApi.list() as any;
        cats = catRes.items || [];
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id.toString());
        }
      } catch (catErr) {
        console.error('Failed to load categories', catErr);
      } finally {
        setFetchingCategories(false);
      }

      // 2. Fetch freelancer's existing gig
      const gigRes = await gigsApi.getMyGigs() as any;
      const gigList = gigRes.items || [];
      
      if (gigList.length > 0) {
        const gig = gigList[0];
        setExistingGig(gig);

        // Populate fields
        setTitle(gig.title || '');
        setCategoryId(gig.category_id ? gig.category_id.toString() : (cats.length > 0 ? cats[0].id.toString() : ''));
        setSubcategory(gig.subcategory || '');
        setDescription(gig.description || '');
        setThumbnailUrl(gig.thumbnail_url || '');

        if (Array.isArray(gig.tags)) {
          setTagsInput(gig.tags.join(', '));
        } else {
          setTagsInput('');
        }

        // Tiers
        setBasicTitle(gig.basic_title || 'Basic Package');
        setBasicDesc(gig.basic_description || '');
        setBasicPrice(gig.basic_price ? gig.basic_price.toString() : '25');
        setBasicDelivery(gig.basic_delivery_days ? gig.basic_delivery_days.toString() : '3');
        setBasicRevisions(gig.basic_revisions ? gig.basic_revisions.toString() : '1');

        setStandardTitle(gig.standard_title || 'Standard Package');
        setStandardDesc(gig.standard_description || '');
        setStandardPrice(gig.standard_price ? gig.standard_price.toString() : '75');
        setStandardDelivery(gig.standard_delivery_days ? gig.standard_delivery_days.toString() : '5');
        setStandardRevisions(gig.standard_revisions ? gig.standard_revisions.toString() : '3');

        setPremiumTitle(gig.premium_title || 'Premium Package');
        setPremiumDesc(gig.premium_description || '');
        setPremiumPrice(gig.premium_price ? gig.premium_price.toString() : '150');
        setPremiumDelivery(gig.premium_delivery_days ? gig.premium_delivery_days.toString() : '7');
        setPremiumRevisions(gig.premium_revisions ? gig.premium_revisions.toString() : '5');

        // FAQs
        if (gig.faqs && gig.faqs.length > 0) {
          setFaqs(gig.faqs.map((f: any) => ({ question: f.question, answer: f.answer })));
        } else {
          setFaqs([]);
        }
      } else {
        setExistingGig(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load service gig data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategoriesAndGig();
  }, [loadCategoriesAndGig]);

  const addFaq = () => {
    setFaqs(prev => [...prev, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqs(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handlePublish = async () => {
    if (!existingGig) return;
    setActionLoading(true);
    try {
      await gigsApi.publish(existingGig.id);
      setSuccessMessage('Your service offering has been activated and published successfully!');
      await loadCategoriesAndGig();
    } catch (err: any) {
      setError(err?.message || 'Failed to activate gig.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!existingGig) return;
    setActionLoading(true);
    try {
      await gigsApi.pause(existingGig.id);
      setSuccessMessage('Your service offering has been paused.');
      await loadCategoriesAndGig();
    } catch (err: any) {
      setError(err?.message || 'Failed to pause gig.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingGig) return;
    if (!confirm('Are you sure you want to delete your service gig? This will remove your package tiers and cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    try {
      await gigsApi.delete(existingGig.id);
      setSuccessMessage('Your service offering has been deleted.');
      setExistingGig(null);
      // Reset form fields
      setTitle('');
      setSubcategory('');
      setDescription('');
      setTagsInput('');
      setThumbnailUrl('');
      setBasicDesc('');
      setStandardDesc('');
      setPremiumDesc('');
      setFaqs([{ question: 'What inputs do you need to start?', answer: 'I will need your design assets, detailed wireframes or requirements, and reference websites you like.' }]);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete gig.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in the gig title and description.');
      return;
    }
    
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      title,
      category_id: categoryId ? parseInt(categoryId, 10) : undefined,
      subcategory,
      description,
      tags,
      thumbnail_url: thumbnailUrl || `https://picsum.photos/seed/${title.length}/800/450`,
      images: [thumbnailUrl || `https://picsum.photos/seed/${title.length}/800/450`],
      
      basic_title: basicTitle,
      basic_description: basicDesc,
      basic_price: parseFloat(basicPrice) || 5.0,
      basic_delivery_days: parseInt(basicDelivery, 10) || 3,
      basic_revisions: parseInt(basicRevisions, 10) || 1,

      standard_title: standardTitle,
      standard_description: standardDesc,
      standard_price: parseFloat(standardPrice) || 25.0,
      standard_delivery_days: parseInt(standardDelivery, 10) || 5,
      standard_revisions: parseInt(standardRevisions, 10) || 2,

      premium_title: premiumTitle,
      premium_description: premiumDesc,
      premium_price: parseFloat(premiumPrice) || 75.0,
      premium_delivery_days: parseInt(premiumDelivery, 10) || 7,
      premium_revisions: parseInt(premiumRevisions, 10) || 3,

      faqs: faqs.filter(f => f.question.trim() && f.answer.trim()),
    };

    try {
      if (existingGig) {
        // Update existing gig
        await gigsApi.update(existingGig.id, payload);
        setSuccessMessage('Your service offering changes have been saved successfully!');
        await loadCategoriesAndGig();
      } else {
        // Create new gig
        const res = await gigsApi.create(payload);
        if (res.id) {
          // Automatically publish
          await gigsApi.publish(res.id);
          setSuccessMessage('Your service offering has been created and published!');
          await loadCategoriesAndGig();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save your gig. Please check inputs.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active / Published
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <Pause size={12} />
            Paused
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Draft
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading your service package details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-150 dark:border-slate-850 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Briefcase className="text-blue-500" size={32} />
            {existingGig ? 'My Service Package' : 'Setup Service Package'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Configure your Fiverr-style tiered service offerings.
          </p>
        </div>
        {existingGig && (
          <div className="flex items-center gap-3 flex-wrap">
            {getStatusBadge(existingGig.status)}
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            
            {existingGig.status === 'paused' || existingGig.status === 'draft' ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePublish}
                disabled={actionLoading}
                className="flex items-center gap-1 text-emerald-600 border-emerald-250 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              >
                <Play size={14} /> Publish Offering
              </Button>
            ) : (
              existingGig.status === 'active' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="flex items-center gap-1 text-amber-600 border-amber-250 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                >
                  <Pause size={14} /> Pause Offering
                </Button>
              )
            )}

            <Link href={`/gigs/${(existingGig as any).slug}`} target="_blank">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Eye size={14} /> View Page
              </Button>
            </Link>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex items-center gap-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-250 dark:border-rose-900/50"
            >
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl text-sm text-emerald-800 dark:text-emerald-400">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          <div>
            <h4 className="font-bold">Success</h4>
            <p className="mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-sm text-rose-800 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Error</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Gig Overview */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">1</span>
            Service Details
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Service Header Title</label>
              <input
                type="text"
                placeholder="I will build a Next.js production app with Tailwind..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-medium"
              />
              <span className="text-xs text-slate-400 self-end block text-right">{title.length}/80 chars</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  disabled={fetchingCategories}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-medium"
                >
                  {fetchingCategories ? (
                    <option>Loading...</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Subcategory</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineering, Logos"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Service Description</label>
              <textarea
                rows={5}
                placeholder="Describe your service offering details, tech stack, and what makes you unique..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-medium leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Tags / Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="nextjs, tailwindcss, react"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Thumbnail Image URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/thumbnail.png"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Three-Tier Pricing Packages */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">2</span>
            Pricing Packages
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Tier */}
            <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-150 dark:border-slate-800/70 pb-2">Basic Package</h3>
              
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Package Title</label>
                  <input
                    type="text"
                    value={basicTitle}
                    onChange={(e) => setBasicTitle(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Package Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe basic features included..."
                    value={basicDesc}
                    onChange={(e) => setBasicDesc(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><DollarSign size={10} />Price</label>
                    <input
                      type="number"
                      value={basicPrice}
                      onChange={(e) => setBasicPrice(e.target.value)}
                      min={5}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><Clock size={10} />Days</label>
                    <input
                      type="number"
                      value={basicDelivery}
                      onChange={(e) => setBasicDelivery(e.target.value)}
                      min={1}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><RotateCcw size={10} />Revisions</label>
                    <input
                      type="number"
                      value={basicRevisions}
                      onChange={(e) => setBasicRevisions(e.target.value)}
                      min={0}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Tier */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-150 dark:border-slate-800/70 pb-2">Standard Package</h3>
              
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Package Title</label>
                  <input
                    type="text"
                    value={standardTitle}
                    onChange={(e) => setStandardTitle(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Package Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe standard features included..."
                    value={standardDesc}
                    onChange={(e) => setStandardDesc(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><DollarSign size={10} />Price</label>
                    <input
                      type="number"
                      value={standardPrice}
                      onChange={(e) => setStandardPrice(e.target.value)}
                      min={5}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><Clock size={10} />Days</label>
                    <input
                      type="number"
                      value={standardDelivery}
                      onChange={(e) => setStandardDelivery(e.target.value)}
                      min={1}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><RotateCcw size={10} />Revisions</label>
                    <input
                      type="number"
                      value={standardRevisions}
                      onChange={(e) => setStandardRevisions(e.target.value)}
                      min={0}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-150 dark:border-slate-800/70 pb-2">Premium Package</h3>
              
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Package Title</label>
                  <input
                    type="text"
                    value={premiumTitle}
                    onChange={(e) => setPremiumTitle(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-955 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Package Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe premium features included..."
                    value={premiumDesc}
                    onChange={(e) => setPremiumDesc(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-955 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><DollarSign size={10} />Price</label>
                    <input
                      type="number"
                      value={premiumPrice}
                      onChange={(e) => setPremiumPrice(e.target.value)}
                      min={5}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><Clock size={10} />Days</label>
                    <input
                      type="number"
                      value={premiumDelivery}
                      onChange={(e) => setPremiumDelivery(e.target.value)}
                      min={1}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5"><RotateCcw size={10} />Revisions</label>
                    <input
                      type="number"
                      value={premiumRevisions}
                      onChange={(e) => setPremiumRevisions(e.target.value)}
                      min={0}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Gig FAQs */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">3</span>
              Frequently Asked Questions (FAQs)
            </h2>
            <button
              type="button"
              onClick={addFaq}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
            >
              <Plus size={14} /> Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="flex gap-3 items-start border border-slate-100 dark:border-slate-850 p-4 rounded-xl relative group bg-slate-50/30 dark:bg-slate-950/10">
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Question</label>
                    <input
                      type="text"
                      placeholder="e.g. Can you handle custom design requests?"
                      value={faq.question}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Answer</label>
                    <textarea
                      rows={2}
                      placeholder="Yes, please contact me first to align on custom scope..."
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="p-1.5 text-rose-500 hover:bg-rose-55 dark:hover:bg-rose-950/20 rounded-lg transition-colors mt-6 self-start opacity-70 hover:opacity-100"
                  title="Remove FAQ"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {faqs.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No FAQs added yet. Click "Add FAQ" to answer common buyer queries.</p>
            )}
          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pb-12">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={actionLoading}
            className="px-8 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
          >
            {actionLoading ? 'Saving...' : (existingGig ? 'Save Changes' : 'Publish Service offering')}
          </Button>
        </div>
      </form>
    </div>
  );
}
