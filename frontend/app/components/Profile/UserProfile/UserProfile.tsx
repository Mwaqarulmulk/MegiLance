// @AI-HINT: Public user profile - portfolio showcase, reviews, contact. Fully theme-aware with CSS modules.
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Star, MapPin, Clock, CheckCircle, DollarSign,
  Linkedin, Github, Globe, Mail, Phone,
  Calendar, Award, ThumbsUp, MessageCircle,
  Briefcase, GraduationCap, Languages, Video, ExternalLink,
  Twitter, Palette, Layers, RotateCcw, AlertCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import Button from '@/app/components/atoms/Button/Button';
import StarRating from '@/app/components/molecules/StarRating/StarRating';
import Loading from '@/app/components/atoms/Loading/Loading';
import Image from 'next/image';

import commonStyles from './UserProfile.common.module.css';
import lightStyles from './UserProfile.light.module.css';
import darkStyles from './UserProfile.dark.module.css';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  tags: string[];
  completedAt: string;
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  projectTitle: string;
  createdAt: string;
  criteria: {
    quality: number;
    communication: number;
    timeliness: number;
    professionalism: number;
  };
}

interface UserProfileProps {
  userId: string | number;
  initialProfile?: any;
}

function normalizeProfile(data: any) {
  if (!data) return null;
  return {
    ...data,
    avatarUrl: data.avatarUrl || data.profile_image_url || data.avatar,
    hourlyRate: data.hourlyRate || data.hourly_rate || 0,
    joinedAt: data.joinedAt || data.joined_at,
    title: data.headline || data.title || data.user_type || 'Freelancer',
    tagline: data.tagline,
    skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()) : (data.skills ? [data.skills] : [])),
    linkedinUrl: data.linkedin_url || data.linkedinUrl,
    githubUrl: data.github_url || data.githubUrl,
    websiteUrl: data.website_url || data.websiteUrl,
    twitterUrl: data.twitter_url || data.twitterUrl,
    dribbbleUrl: data.dribbble_url || data.dribbbleUrl,
    behanceUrl: data.behance_url || data.behanceUrl,
    stackoverflowUrl: data.stackoverflow_url || data.stackoverflowUrl,
    phone: data.phone_number || data.phone,
    experienceLevel: data.experience_level || data.experienceLevel,
    yearsOfExperience: data.years_of_experience || data.yearsOfExperience,
    availabilityStatus: data.availability_status || data.availabilityStatus,
    languages: data.languages,
    timezone: data.timezone,
    videoIntroUrl: data.video_intro_url || data.videoIntroUrl,
    availabilityHours: data.availability_hours || data.availabilityHours,
  };
}

export default function UserProfile({ userId, initialProfile }: UserProfileProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(!initialProfile);
  const [profile, setProfile] = useState<any>(initialProfile ? normalizeProfile(initialProfile) : null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [gig, setGig] = useState<any | null>(null);
  const [loadingGig, setLoadingGig] = useState(true);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const themed = (mounted && resolvedTheme === 'light') ? lightStyles : darkStyles;

  useEffect(() => {
    loadProfile();
    loadPortfolio();
    loadReviews();
    loadGig();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const data = await (api.users as any).get?.(userId);
      setProfile({
        ...data,
        avatarUrl: data.profile_image_url,
        hourlyRate: data.hourly_rate,
        joinedAt: data.joined_at,
        title: data.headline || data.title || data.user_type || 'Freelancer',
        tagline: data.tagline,
        skills: Array.isArray(data.skills) ? data.skills : (data.skills ? [data.skills] : []),
        linkedinUrl: data.linkedin_url,
        githubUrl: data.github_url,
        websiteUrl: data.website_url,
        twitterUrl: data.twitter_url,
        dribbbleUrl: data.dribbble_url,
        behanceUrl: data.behance_url,
        stackoverflowUrl: data.stackoverflow_url,
        phone: data.phone_number,
        experienceLevel: data.experience_level,
        yearsOfExperience: data.years_of_experience,
        availabilityStatus: data.availability_status,
        languages: data.languages,
        timezone: data.timezone,
        videoIntroUrl: data.video_intro_url,
        availabilityHours: data.availability_hours,
        preferredProjectSize: data.preferred_project_size,
        industryFocus: data.industry_focus,
        toolsAndTechnologies: data.tools_and_technologies,
        education: data.education ? (typeof data.education === 'string' ? JSON.parse(data.education) : data.education) : [],
        certifications: data.certifications ? (typeof data.certifications === 'string' ? JSON.parse(data.certifications) : data.certifications) : [],
        workHistory: data.work_history ? (typeof data.work_history === 'string' ? JSON.parse(data.work_history) : data.work_history) : [],
        achievements: data.achievements ? (typeof data.achievements === 'string' ? JSON.parse(data.achievements) : data.achievements) : [],
      });
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const data = await (api.portfolio as any).list?.(userId);
      const mappedPortfolio = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url || '/images/clients/placeholder.svg',
        projectUrl: item.project_url,
        tags: item.tags || [],
        completedAt: item.created_at,
      }));
      setPortfolio(mappedPortfolio);
    } catch {
      // Failed to load portfolio
    }
  };

  const loadReviews = async () => {
    try {
      const data = await (api.reviews as any).list?.({ user_id: Number(userId) });
      const mappedReviews = (data as any[]).map((item: any) => ({
        id: item.id,
        reviewerName: item.reviewer_name || 'Anonymous',
        reviewerAvatar: item.reviewer_avatar || item.reviewer_profile_image_url || '/images/default-avatar.svg',
        rating: item.rating,
        comment: item.review_text,
        projectTitle: item.project_title || 'Project',
        createdAt: item.created_at,
        criteria: {
          quality: item.quality_rating || 0,
          communication: item.communication_rating || 0,
          timeliness: item.deadline_rating || 0,
          professionalism: item.professionalism_rating || 0,
        },
      }));
      setReviews(mappedReviews);
    } catch {
      // Failed to load reviews
    }
  };

  const loadGig = async () => {
    setLoadingGig(true);
    try {
      const data = await apiFetch(`/gigs?seller_id=${userId}`);
      const items = (data as any)?.items || [];
      if (items.length > 0) {
        setGig(items[0]);
      } else {
        setGig(null);
      }
    } catch (err) {
      console.warn("Failed to load seller gig:", err);
      setGig(null);
    } finally {
      setLoadingGig(false);
    }
  };

  const handleOrderPackage = async (packageTier: 'basic' | 'standard' | 'premium') => {
    if (!isAuthenticated || !currentUser) {
      router.push('/login?redirect=' + encodeURIComponent(`/freelancers/${userId}`));
      return;
    }
    
    // Prevent ordering own gig
    if (Number(currentUser.id) === Number(userId)) {
      setOrderError("You cannot order your own service package.");
      return;
    }

    setOrderLoading(true);
    setOrderSuccess(null);
    setOrderError(null);

    try {
      const res = await apiFetch("/gigs/orders", {
        method: "POST",
        body: JSON.stringify({
          gig_id: gig.id,
          package: packageTier,
        }),
      }) as { id?: number; price?: number };

      setOrderSuccess(`Your order for the ${packageTier} package ($${res.price || 0}) has been placed successfully! Order ID: #${res.id || 0}.`);
    } catch (err: any) {
      setOrderError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const handleContact = useCallback(async () => {
    setContactLoading(true);
    try {
      if (!isAuthenticated || !currentUser) {
        router.push('/login?redirect=' + encodeURIComponent(`/freelancers/${userId}`));
        return;
      }
      
      const currentUserId = currentUser.id;
      const currentRole = currentUser.role || 'client';
      
      // Determine client/freelancer IDs based on current user role
      const conversationData = currentRole === 'freelancer'
        ? { client_id: Number(userId), freelancer_id: Number(currentUserId) }
        : { client_id: Number(currentUserId), freelancer_id: Number(userId) };
      
      const result = await api.messages.createConversation(conversationData) as { id?: number; conversation_id?: number } | undefined;
      const conversationId = result?.id || result?.conversation_id;
      if (conversationId) {
        router.push(`/messages?conversation=${conversationId}`);
      } else {
        router.push(`/messages`);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      // Fallback: just navigate to messages
      router.push('/messages');
    } finally {
      setContactLoading(false);
    }
  }, [userId, router, isAuthenticated, currentUser]);

  const handleHire = useCallback(() => {
    router.push('/client/find-talent');
  }, [userId, router]);

  if (loading) {
    return (
      <div className={cn(commonStyles.container, themed.container)}>
        <h1 className="sr-only">Loading Freelancer Profile</h1>
        <Loading size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={cn(commonStyles.container, themed.container)}>
        <div className={commonStyles.emptyState} role="alert">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Freelancer Profile Not Found
          </h1>
          <p className={cn(commonStyles.emptyText, themed.emptyText)}>
            The profile you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const avgRating = calculateAverageRating();

  return (
    <div className={cn(commonStyles.container, themed.container)}>
      {/* Profile Header */}
      <header className={cn(commonStyles.header, themed.header)}>
        <div className={commonStyles.avatar}>
          <Image
            src={profile.avatarUrl || '/images/default-avatar.svg'}
            alt={`${profile.name}'s profile photo`}
            width={120}
            height={120}
            className={commonStyles.avatarImage}
          />
          {profile.verified && (
            <div
              className={cn(commonStyles.verifiedBadge, themed.verifiedBadge)}
              aria-label="Verified user"
            >
              <CheckCircle size={16} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className={cn(commonStyles.nameSection, themed.nameSection)}>
          <div className={commonStyles.nameRow}>
            <h1 className={cn(commonStyles.title, themed.title)}>
              {profile.name}
            </h1>
            {profile.topRated && (
              <span className={cn(commonStyles.badge, themed.badge)}>
                <Award size={14} aria-hidden="true" />
                Top Rated
              </span>
            )}
          </div>
          <p className={cn(commonStyles.subtitle, themed.subtitle)}>
            {profile.title}
          </p>
          {profile.tagline && (
            <p className={cn(commonStyles.subtitle, themed.subtitle)} style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              {profile.tagline}
            </p>
          )}

          <div className={commonStyles.metaRow}>
            {profile.location && (
              <div className={cn(commonStyles.metaItem, themed.metaItem)}>
                <MapPin size={14} aria-hidden="true" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.timezone && (
              <div className={cn(commonStyles.metaItem, themed.metaItem)}>
                <Clock size={14} aria-hidden="true" />
                <span>{profile.timezone}</span>
              </div>
            )}
            {profile.hourlyRate && (
              <div className={cn(commonStyles.metaItem, themed.metaItem)}>
                <DollarSign size={14} aria-hidden="true" />
                <span>${profile.hourlyRate}/hr</span>
              </div>
            )}
            {profile.experienceLevel && (
              <div className={cn(commonStyles.metaItem, themed.metaItem)}>
                <Briefcase size={14} aria-hidden="true" />
                <span>{profile.experienceLevel.charAt(0).toUpperCase() + profile.experienceLevel.slice(1)} Level</span>
                {profile.yearsOfExperience && <span> ({profile.yearsOfExperience} yrs)</span>}
              </div>
            )}
            {profile.languages && (
              <div className={cn(commonStyles.metaItem, themed.metaItem)}>
                <Languages size={14} aria-hidden="true" />
                <span>{profile.languages}</span>
              </div>
            )}
          </div>

          <div className={cn(commonStyles.stats, themed.stats)}>
            <div className={cn(commonStyles.statItem, themed.statItem)}>
              <StarRating rating={avgRating} showValue reviewCount={reviews.length} />
            </div>
            <div className={cn(commonStyles.statItem, themed.statItem)}>
              <ThumbsUp size={14} aria-hidden="true" />
              <span>{profile.projectsCompleted || 0} projects completed</span>
            </div>
            <div className={cn(commonStyles.statItem, themed.statItem)}>
              <Calendar size={14} aria-hidden="true" />
              <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={cn(commonStyles.availability, themed.availability)}>
            <Clock size={14} aria-hidden="true" />
            <span>
              {profile.availabilityStatus === 'available'
                ? 'Available Now'
                : profile.availabilityStatus === 'busy'
                  ? 'Currently Busy'
                  : profile.availabilityStatus === 'on_vacation'
                    ? 'On Vacation'
                    : profile.availabilityStatus === 'unavailable'
                      ? 'Unavailable'
                      : profile.availability === 'immediate'
                        ? 'Available Now'
                        : profile.availability === 'within-week'
                          ? 'Available Within a Week'
                          : 'Available Within a Month'}
            </span>
            {profile.availabilityHours && (
              <span> &middot; {profile.availabilityHours} hrs/week</span>
            )}
          </div>
        </div>

        <div className={cn(commonStyles.actions, themed.actions)}>
          <Button 
            variant="primary" 
            size="lg" 
            aria-label={`Contact ${profile.name}`}
            onClick={handleContact}
            disabled={contactLoading}
          >
            <Mail size={16} aria-hidden="true" />
            {contactLoading ? 'Starting chat...' : 'Contact'}
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            aria-label={`Hire ${profile.name}`}
            onClick={handleHire}
          >
            Hire Now
          </Button>
        </div>
      </header>

      {/* About Section */}
      {profile.bio && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="about-heading">
          <h2 id="about-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            About
          </h2>
          <p className={cn(commonStyles.aboutText, themed.aboutText)}>
            {profile.bio}
          </p>
        </section>
      )}

      {/* Skills Section */}
      {profile.skills?.length > 0 && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="skills-heading">
          <h2 id="skills-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            Skills
          </h2>
          <div className={cn(commonStyles.skillsGrid, themed.skillsGrid)}>
            {profile.skills.map((skill: string, index: number) => (
              <span key={index} className={cn(commonStyles.skillTag, themed.skillTag)}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tools & Technologies */}
      {profile.toolsAndTechnologies && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="tools-heading">
          <h2 id="tools-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            Tools & Technologies
          </h2>
          <div className={cn(commonStyles.skillsGrid, themed.skillsGrid)}>
            {profile.toolsAndTechnologies.split(',').map((tool: string, i: number) => (
              <span key={i} className={cn(commonStyles.skillTag, themed.skillTag)}>
                {tool.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Video Introduction */}
      {profile.videoIntroUrl && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="video-heading">
          <h2 id="video-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            <Video size={18} aria-hidden="true" /> Video Introduction
          </h2>
          <a
            href={profile.videoIntroUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(commonStyles.socialLink, themed.socialLink)}
          >
            <ExternalLink size={14} aria-hidden="true" />
            Watch Introduction Video
          </a>
        </section>
      )}

      {/* Education */}
      {profile.education?.length > 0 && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="education-heading">
          <h2 id="education-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            <GraduationCap size={18} aria-hidden="true" /> Education
          </h2>
          {profile.education.map((edu: any, i: number) => (
            <div key={i} className={cn(commonStyles.reviewCard, themed.reviewCard)} style={{ marginBottom: '0.75rem' }}>
              <div>
                <p className={cn(commonStyles.reviewerName, themed.reviewerName)}>{edu.degree || edu.title}</p>
                <p className={cn(commonStyles.reviewProject, themed.reviewProject)}>{edu.institution || edu.school}</p>
                {edu.year && <time className={cn(commonStyles.reviewDate, themed.reviewDate)}>{edu.year}</time>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {profile.certifications?.length > 0 && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="certs-heading">
          <h2 id="certs-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            <Award size={18} aria-hidden="true" /> Certifications
          </h2>
          {profile.certifications.map((cert: any, i: number) => (
            <div key={i} className={cn(commonStyles.reviewCard, themed.reviewCard)} style={{ marginBottom: '0.75rem' }}>
              <div>
                <p className={cn(commonStyles.reviewerName, themed.reviewerName)}>{cert.name || cert.title}</p>
                <p className={cn(commonStyles.reviewProject, themed.reviewProject)}>{cert.issuer || cert.organization}</p>
                {cert.year && <time className={cn(commonStyles.reviewDate, themed.reviewDate)}>{cert.year}</time>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Work History */}
      {profile.workHistory?.length > 0 && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="work-heading">
          <h2 id="work-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            <Briefcase size={18} aria-hidden="true" /> Work History
          </h2>
          {profile.workHistory.map((work: any, i: number) => (
            <div key={i} className={cn(commonStyles.reviewCard, themed.reviewCard)} style={{ marginBottom: '0.75rem' }}>
              <div>
                <p className={cn(commonStyles.reviewerName, themed.reviewerName)}>{work.title || work.role}</p>
                <p className={cn(commonStyles.reviewProject, themed.reviewProject)}>{work.company}</p>
                {work.duration && <time className={cn(commonStyles.reviewDate, themed.reviewDate)}>{work.duration}</time>}
                {work.description && <p className={cn(commonStyles.aboutText, themed.aboutText)} style={{ marginTop: '0.5rem' }}>{work.description}</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {profile.achievements?.length > 0 && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="achievements-heading">
          <h2 id="achievements-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            <Award size={18} aria-hidden="true" /> Achievements
          </h2>
          <div className={cn(commonStyles.skillsGrid, themed.skillsGrid)}>
            {profile.achievements.map((achievement: any, i: number) => (
              <span key={i} className={cn(commonStyles.skillTag, themed.skillTag)}>
                {typeof achievement === 'string' ? achievement : achievement.title || achievement.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Service Gigs Tier Section */}
      {gig && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="packages-heading">
          <h2 id="packages-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            Service Packages
          </h2>
          
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm mt-4">
            {/* Packages Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              {(['basic', 'standard', 'premium'] as const).map((tier) => {
                const isActive = selectedTier === tier;
                const price = gig[`${tier}_price`] || 0;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => { setSelectedTier(tier); setOrderSuccess(null); setOrderError(null); }}
                    className={cn(
                      "flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
                      isActive
                        ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    {tier} (${price})
                  </button>
                );
              })}
            </div>

            {/* Package Contents */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {gig[`${selectedTier}_title`] || `${selectedTier.slice(0, 1).toUpperCase() + selectedTier.slice(1)} Package`}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    {gig[`${selectedTier}_description`] || "No description provided for this package."}
                  </p>
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  ${gig[`${selectedTier}_price`] || 0}
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-b border-slate-100 dark:border-slate-850 py-3.5">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>{gig[`${selectedTier}_delivery_days`] || 3} Days Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={14} className="text-slate-400" />
                  <span>{gig[`${selectedTier}_revisions`] || 1} Revisions</span>
                </div>
              </div>

              {/* Order Messaging Feedbacks */}
              {orderSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 text-xs font-medium text-emerald-800 dark:text-emerald-400 flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{orderSuccess}</span>
                </div>
              )}

              {orderError && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/30 text-xs font-medium text-rose-800 dark:text-rose-400 flex items-start gap-2">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={() => handleOrderPackage(selectedTier)}
                  disabled={orderLoading || orderSuccess !== null}
                  className="px-8 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/10"
                >
                  {orderLoading ? "Processing Order..." : `Order ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Package`}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {portfolio.length > 0 && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="portfolio-heading">
          <h2 id="portfolio-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            Portfolio ({portfolio.length})
          </h2>
          <div className={cn(commonStyles.portfolioGrid, themed.portfolioGrid)}>
            {portfolio.map((item) => (
              <button
                key={item.id}
                className={cn(commonStyles.portfolioCard, themed.portfolioCard)}
                onClick={() => setSelectedPortfolioItem(item)}
                aria-label={`View portfolio item: ${item.title}`}
                type="button"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={400}
                  height={300}
                  className={commonStyles.portfolioImage}
                />
                <div className={commonStyles.portfolioContent}>
                  <h3 className={cn(commonStyles.portfolioTitle, themed.portfolioTitle)}>
                    {item.title}
                  </h3>
                  <p className={cn(commonStyles.portfolioDesc, themed.portfolioDesc)}>
                    {item.description}
                  </p>
                  <div className={commonStyles.portfolioTags}>
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={cn(commonStyles.portfolioTag, themed.portfolioTag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className={cn(commonStyles.section, themed.section)} aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
            Reviews & Ratings ({reviews.length})
          </h2>
          {reviews.map((review) => (
            <article
              key={review.id}
              className={cn(commonStyles.reviewCard, themed.reviewCard)}
              aria-label={`Review by ${review.reviewerName}`}
            >
              <div className={commonStyles.reviewHeader}>
                <Image
                  src={review.reviewerAvatar}
                  alt={`${review.reviewerName}'s avatar`}
                  width={50}
                  height={50}
                  className={commonStyles.reviewerAvatar}
                />
                <div className={commonStyles.reviewMeta}>
                  <div className={commonStyles.reviewMetaTop}>
                    <div>
                      <p className={cn(commonStyles.reviewerName, themed.reviewerName)}>
                        {review.reviewerName}
                      </p>
                      <p className={cn(commonStyles.reviewProject, themed.reviewProject)}>
                        {review.projectTitle}
                      </p>
                    </div>
                    <div className={commonStyles.reviewRating}>
                      <StarRating rating={review.rating} size="sm" showValue />
                    </div>
                  </div>

                  <div className={cn(commonStyles.criteriaGrid, themed.criteriaGrid)}>
                    <div className={commonStyles.criteriaItem}>
                      <span className={cn(commonStyles.criteriaLabel, themed.criteriaLabel)}>
                        Quality
                      </span>
                      <StarRating rating={review.criteria.quality} size="sm" />
                    </div>
                    <div className={commonStyles.criteriaItem}>
                      <span className={cn(commonStyles.criteriaLabel, themed.criteriaLabel)}>
                        Communication
                      </span>
                      <StarRating rating={review.criteria.communication} size="sm" />
                    </div>
                    <div className={commonStyles.criteriaItem}>
                      <span className={cn(commonStyles.criteriaLabel, themed.criteriaLabel)}>
                        Timeliness
                      </span>
                      <StarRating rating={review.criteria.timeliness} size="sm" />
                    </div>
                    <div className={commonStyles.criteriaItem}>
                      <span className={cn(commonStyles.criteriaLabel, themed.criteriaLabel)}>
                        Professionalism
                      </span>
                      <StarRating rating={review.criteria.professionalism} size="sm" />
                    </div>
                  </div>

                  <p className={cn(commonStyles.reviewComment, themed.reviewComment)}>
                    {review.comment}
                  </p>
                  <time
                    className={cn(commonStyles.reviewDate, themed.reviewDate)}
                    dateTime={review.createdAt}
                  >
                    {new Date(review.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Contact Section */}
      <section className={cn(commonStyles.section, themed.section)} aria-labelledby="contact-heading">
        <h2 id="contact-heading" className={cn(commonStyles.sectionTitle, themed.sectionTitle)}>
          Contact Information
        </h2>
        <div className={cn(commonStyles.contactInfo, themed.contactInfo)}>
          {profile.email && (
            <div className={cn(commonStyles.contactItem, themed.contactItem)}>
              <Mail size={16} aria-hidden="true" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile.phone && (
            <div className={cn(commonStyles.contactItem, themed.contactItem)}>
              <Phone size={16} aria-hidden="true" />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>

        <div className={cn(commonStyles.socialLinks, themed.socialLinks)}>
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(commonStyles.socialLink, themed.socialLink)}
              aria-label="Visit LinkedIn profile"
            >
              <Linkedin size={16} aria-hidden="true" />
              LinkedIn
            </a>
          )}
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(commonStyles.socialLink, themed.socialLink)}
              aria-label="Visit GitHub profile"
            >
              <Github size={16} aria-hidden="true" />
              GitHub
            </a>
          )}
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(commonStyles.socialLink, themed.socialLink)}
              aria-label="Visit personal website"
            >
              <Globe size={16} aria-hidden="true" />
              Website
            </a>
          )}
          {profile.twitterUrl && (
            <a
              href={profile.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(commonStyles.socialLink, themed.socialLink)}
              aria-label="Visit Twitter/X profile"
            >
              <Twitter size={16} aria-hidden="true" />
              Twitter
            </a>
          )}
          {profile.dribbbleUrl && (
            <a
              href={profile.dribbbleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(commonStyles.socialLink, themed.socialLink)}
              aria-label="Visit Dribbble profile"
            >
              <Palette size={16} aria-hidden="true" />
              Dribbble
            </a>
          )}
          {profile.behanceUrl && (
            <a
              href={profile.behanceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(commonStyles.socialLink, themed.socialLink)}
              aria-label="Visit Behance profile"
            >
              <Layers size={16} aria-hidden="true" />
              Behance
            </a>
          )}
          {profile.stackoverflowUrl && (
            <a
              href={profile.stackoverflowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(commonStyles.socialLink, themed.socialLink)}
              aria-label="Visit Stack Overflow profile"
            >
              <ExternalLink size={16} aria-hidden="true" />
              Stack Overflow
            </a>
          )}
        </div>
      </section>
    </div>
  );
};
