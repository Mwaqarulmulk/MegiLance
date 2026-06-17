'use client';

import { useState, useRef } from 'react';
import { RichTextEditor, ReadOnlyEditor } from '@/app/components/Editor';
import { SignaturePad } from '@/app/components/SignaturePad';
import { useToaster } from '@/app/components/molecules/Toast/ToasterProvider';
import { apiFetch } from '@/lib/api/core';
import {
  User, Mail, MapPin, Globe, Clock, Star, Award, Briefcase,
  Edit3, Save, Camera, Plus, Trash2, ExternalLink, Download,
  FileText, CheckCircle, AlertCircle, TrendingUp, DollarSign,
  Eye, Heart, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  location: string;
  timezone: string;
  hourlyRate: number;
  currency: string;
  bio: string;
  avatar: string;
  coverImage: string;
  skills: string[];
  experienceLevel: string;
  availability: string;
  languages: { name: string; level: string }[];
  education: { school: string; degree: string; field: string; year: string }[];
  certifications: { name: string; issuer: string; date: string; url: string }[];
  portfolio: {
    id: string;
    title: string;
    description: string;
    images: string[];
    link: string;
    skills: string[];
    date: string;
  }[];
  workHistory: {
    id: string;
    title: string;
    client: string;
    description: string;
    budget: number;
    status: string;
    rating: number;
    date: string;
  }[];
  stats: {
    totalEarnings: number;
    completedProjects: number;
    avgRating: number;
    totalReviews: number;
    responseTime: string;
    repeatClients: number;
  };
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
    website: string;
  };
}

const defaultProfile: FreelancerProfile = {
  id: '1',
  name: 'John Developer',
  title: 'Senior Full-Stack Developer',
  email: 'john@example.com',
  location: 'New York, USA',
  timezone: 'UTC-5',
  hourlyRate: 85,
  currency: 'USD',
  bio: 'Experienced full-stack developer with 8+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture. Passionate about clean code and user-centric design.',
  avatar: '/avatars/default.png',
  coverImage: '/covers/default.jpg',
  skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'PostgreSQL', 'Docker', 'GraphQL'],
  experienceLevel: 'Expert',
  availability: 'Available',
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Conversational' },
  ],
  education: [
    { school: 'MIT', degree: 'BS', field: 'Computer Science', year: '2016' },
  ],
  certifications: [
    { name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2023', url: '' },
  ],
  portfolio: [
    {
      id: '1',
      title: 'E-Commerce Platform',
      description: 'Built a full-stack e-commerce solution with real-time inventory, payment processing, and admin dashboard.',
      images: [],
      link: 'https://example.com',
      skills: ['React', 'Node.js', 'Stripe'],
      date: '2024-01-15',
    },
  ],
  workHistory: [],
  stats: {
    totalEarnings: 125000,
    completedProjects: 47,
    avgRating: 4.9,
    totalReviews: 42,
    responseTime: '< 2 hours',
    repeatClients: 18,
  },
  socialLinks: {
    linkedin: '',
    github: '',
    twitter: '',
    website: '',
  },
};

export default function FreelancerProfilePage() {
  const { showToast } = useToaster();
  const [profile, setProfile] = useState<FreelancerProfile>(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', 'avatar');
      const response = await fetch('/api/v1/uploads/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await import('@/lib/api/core')).getAuthToken() || ''}`,
        },
        body: formData,
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const url = data.url || data.file_url || data.path;
        if (url) setProfile((p) => ({ ...p, avatar: url }));
      } else {
        showToast('Failed to upload image. Please try again.', 'error');
      }
    } catch {
      showToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Cover image must be under 10MB', 'error');
      return;
    }
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', 'cover');
      const response = await fetch('/api/v1/uploads/cover', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await import('@/lib/api/core')).getAuthToken() || ''}`,
        },
        body: formData,
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const url = data.url || data.file_url || data.path;
        if (url) setProfile((p) => ({ ...p, coverImage: url }));
      } else {
        showToast('Failed to upload cover image. Please try again.', 'error');
      }
    } catch {
      showToast('Failed to upload cover image. Please try again.', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiFetch('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: profile.name,
          title: profile.title,
          bio: profile.bio,
          location: profile.location,
          timezone: profile.timezone,
          hourly_rate: profile.hourlyRate,
          skills: profile.skills,
          experience_level: profile.experienceLevel,
          availability_status: profile.availability.toLowerCase(),
          profile_image_url: profile.avatar || null,
          cover_image_url: profile.coverImage || null,
          linkedin_url: profile.socialLinks.linkedin || null,
          github_url: profile.socialLinks.github || null,
          twitter_url: profile.socialLinks.twitter || null,
          website_url: profile.socialLinks.website || null,
        }),
      });
      showToast('Profile saved successfully!', 'success');
      setEditing(false);
    } catch {
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'skills', label: 'Skills & Expertise' },
    { id: 'work-history', label: 'Work History' },
    { id: 'documents', label: 'Documents' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Cover Image & Avatar */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl h-48 overflow-hidden">
        {profile.coverImage && (
          <img src={profile.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          className="hidden"
          aria-label="Upload cover image"
        />
        {editing && (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/30 transition-colors"
          >
            <Camera size={14} />
            {uploadingCover ? 'Uploading…' : 'Change Cover'}
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="relative -mt-20 px-6">
        <div className="flex items-end gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden">
              {profile.avatar && profile.avatar !== '/avatars/default.png' ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              aria-label="Upload profile photo"
            />
            {editing && (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-1 right-1 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {uploadingImage ? (
                  <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full inline-block" />
                ) : (
                  <Camera size={12} />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 pb-2">
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 w-full"
                />
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 w-full"
                />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">{profile.title}</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 pb-2">
            <button
              onClick={() => {
                if (editing) {
                  handleSaveProfile();
                } else {
                  setEditing(true);
                }
              }}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              {saving ? (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : editing ? (
                <Save size={14} />
              ) : (
                <Edit3 size={14} />
              )}
              {saving ? 'Saving…' : editing ? 'Save Profile' : 'Edit Profile'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Download size={14} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-6 gap-4 mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {[
            { label: 'Earnings', value: `$${profile.stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
            { label: 'Projects', value: profile.stats.completedProjects, icon: Briefcase, color: 'text-blue-600' },
            { label: 'Rating', value: profile.stats.avgRating, icon: Star, color: 'text-yellow-500' },
            { label: 'Reviews', value: profile.stats.totalReviews, icon: MessageSquare, color: 'text-purple-600' },
            { label: 'Response', value: profile.stats.responseTime, icon: Clock, color: 'text-orange-500' },
            { label: 'Repeat Clients', value: profile.stats.repeatClients, icon: Heart, color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className={`mx-auto mb-1 ${stat.color}`} size={20} />
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Bio */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h3>
                {editing ? (
                  <RichTextEditor
                    content={profile.bio}
                    onChange={(html) => setProfile({ ...profile, bio: html })}
                    placeholder="Tell clients about yourself..."
                    minHeight="150px"
                  />
                ) : (
                  <ReadOnlyEditor content={profile.bio} />
                )}
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {editing && (
                    <button className="px-3 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                      <Plus size={12} className="inline mr-1" />
                      Add Skill
                    </button>
                  )}
                </div>
              </div>

              {/* Work History */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Work History</h3>
                {profile.workHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No completed projects yet.</p>
                ) : (
                  <div className="space-y-4">
                    {profile.workHistory.map((work) => (
                      <div key={work.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{work.title}</h4>
                            <p className="text-sm text-gray-500">{work.client}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">${work.budget.toLocaleString()}</div>
                            <div className="flex items-center gap-1 text-sm text-yellow-500">
                              <Star size={12} fill="currentColor" />
                              {work.rating}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{work.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'portfolio' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio</h3>
                {editing && (
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    <Plus size={14} />
                    Add Project
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {profile.portfolio.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <FileText size={40} className="text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.skills.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills & Expertise</h3>
              <div className="space-y-4">
                {profile.skills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{skill}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }} />
                      </div>
                      <span className="text-sm text-gray-500">Expert</span>
                      {editing && (
                        <button className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents & Agreements</h3>
              <div className="space-y-3">
                {[
                  { name: 'Service Agreement Template', type: 'Contract', status: 'Active', date: '2024-01-01' },
                  { name: 'NDA Template', type: 'NDA', status: 'Active', date: '2024-01-01' },
                  { name: 'W-9 Tax Form', type: 'Tax', status: 'Completed', date: '2024-01-15' },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{doc.name}</div>
                        <div className="text-xs text-gray-500">{doc.type} • {doc.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        doc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {doc.status}
                      </span>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* E-Signature Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Digital Signature</h4>
                <p className="text-sm text-gray-500 mb-4">Sign documents digitally with your saved signature.</p>
                <button
                  onClick={() => setShowSignaturePad(!showSignaturePad)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  {showSignaturePad ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showSignaturePad ? 'Hide Signature Pad' : 'Manage Signature'}
                </button>
                {showSignaturePad && (
                  <div className="mt-4">
                    <SignaturePad
                      onSignature={(dataUrl) => {
                        console.log('Signature saved:', dataUrl.substring(0, 50) + '...');
                        setShowSignaturePad(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Analytics</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Profile Views', value: '1,247', change: '+12%', icon: Eye },
                  { label: 'Proposal Success', value: '68%', change: '+5%', icon: TrendingUp },
                  { label: 'Search Appearances', value: '3,891', change: '+8%', icon: AlertCircle },
                ].map((metric) => (
                  <div key={metric.label} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <metric.icon className="text-blue-600 mb-2" size={20} />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                    <div className="text-sm text-gray-500">{metric.label}</div>
                    <div className="text-xs text-green-600 mt-1">{metric.change} this month</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin size={14} />
                {profile.location}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Globe size={14} />
                {profile.timezone}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock size={14} />
                {profile.availability}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <DollarSign size={14} />
                ${profile.hourlyRate}/hr
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Award size={14} />
                {profile.experienceLevel}
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Languages</h3>
            <div className="space-y-2">
              {profile.languages.map((lang) => (
                <div key={lang.name} className="flex justify-between text-sm">
                  <span className="text-gray-900 dark:text-white">{lang.name}</span>
                  <span className="text-gray-500">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Education</h3>
            <div className="space-y-3">
              {profile.education.map((edu, i) => (
                <div key={i}>
                  <div className="font-medium text-gray-900 dark:text-white">{edu.degree} in {edu.field}</div>
                  <div className="text-sm text-gray-500">{edu.school} • {edu.year}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Certifications</h3>
            <div className="space-y-3">
              {profile.certifications.map((cert, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{cert.name}</div>
                    <div className="text-xs text-gray-500">{cert.issuer} • {cert.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
