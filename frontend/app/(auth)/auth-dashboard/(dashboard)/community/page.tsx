// @AI-HINT: This is the Community page, designed as a premium forum/social hub. It features a main discussion feed, sorting/filtering controls, and a sidebar with community stats and popular tags to encourage user interaction.

'use client'

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Plus, Search, ThumbsUp, MessageCircle, Eye, ChevronDown, TrendingUp, Users, MessageSquare } from 'lucide-react';
import styles from './Community.module.css';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

// AI-HINT: Mock data for community posts. In a real app, this would be fetched from a database via an API.
const communityPosts = [
  {
    id: 1,
    author: 'Elena Rodriguez',
    authorAvatar: '/avatars/avatar-3.png',
    authorTitle: 'Marketing Guru',
    title: 'Best strategies for landing high-ticket clients in Q3?',
    excerpt: 'I&apos;ve been focusing on cold outreach, but I&apos;m curious to hear what other channels are working for you all. SEO? Content marketing? Referrals?',
    tags: ['marketing', 'client-acquisition', 'strategy'],
    likes: 128,
    comments: 42,
    views: 1200,
    timestamp: '2 hours ago',
    isTrending: true,
  },
  {
    id: 2,
    author: 'Ben Carter',
    authorAvatar: '/avatars/avatar-4.png',
    authorTitle: 'Full-Stack Developer',
    title: 'How do you handle scope creep without damaging client relationships?',
    excerpt: 'Just had a project where the client kept adding &apos;small&apos; features. It really derailed the timeline. Looking for advice on setting boundaries politely but firmly.',
    tags: ['project-management', 'client-relations', 'freelancing'],
    likes: 97,
    comments: 61,
    views: 2500,
    timestamp: '1 day ago',
    isTrending: false,
  },
  {
    id: 3,
    author: 'Sophie Chen',
    authorAvatar: '/avatars/avatar-5.png',
    authorTitle: 'UI/UX Designer',
    title: 'Showcase: My latest branding project for a SaaS startup.',
    excerpt: 'Excited to share the final designs for &apos;InnovateAI&apos;. It was a challenging but rewarding project. Feedback is welcome!',
    tags: ['design', 'showcase', 'ui-ux', 'branding'],
    likes: 256,
    comments: 88,
    views: 4800,
    timestamp: '3 days ago',
    isTrending: true,
  },
  {
    id: 4,
    author: 'Marcus Johnson',
    authorAvatar: '/avatars/avatar-1.png',
    authorTitle: 'Content Strategist',
    title: 'The rise of AI writing tools: Friend or foe?',
    excerpt: 'With tools like ChatGPT and Jasper becoming more sophisticated, how are content creators adapting their workflows? Are we seeing quality improvements or declines?',
    tags: ['content', 'ai', 'writing'],
    likes: 76,
    comments: 34,
    views: 1800,
    timestamp: '5 days ago',
    isTrending: false,
  },
];

// AI-HINT: Mock data for the sidebar.
const communityStats = {
  members: '12,458',
  discussions: '3,892',
  online: '312',
};

const popularTags = ['freelancing', 'marketing', 'design', 'development', 'business', 'productivity', 'ai', 'crypto'];

const CommunityPage = () => {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'mostLiked' | 'mostCommented' | 'mostViewed'>('latest');
  const [activeTag, setActiveTag] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AI-HINT: Demo loading to showcase Skeleton placeholders.
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = communityPosts.filter(p => {
      const matchesQuery = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
    switch (sortBy) {
      case 'mostLiked':
        items = [...items].sort((a,b) => b.likes - a.likes);
        break;
      case 'mostCommented':
        items = [...items].sort((a,b) => b.comments - a.comments);
        break;
      case 'mostViewed':
        items = [...items].sort((a,b) => b.views - a.views);
        break;
      default:
        // latest: keep original order (mock assumes latest first)
        break;
    }
    return items;
  }, [query, sortBy, activeTag]);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className={styles.communityContainer} aria-busy={loading || undefined}>
      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          {loading ? (
            <div className={styles.pageHeader}>
              <Skeleton height={32} width={'40%'} />
              <Skeleton height={44} width={160} />
            </div>
          ) : (
            <>
              <h1>Community Hub</h1>
              <button className={styles.newPostButton}>
                <Plus size={20} />
                <span>Create Post</span>
              </button>
            </>
          )}
        </div>

        <div className={styles.feedControls}>
          {loading ? (
            <div className={styles.feedControls}>
              <Skeleton height={44} width={'70%'} />
              <Skeleton height={44} width={180} />
            </div>
          ) : (
            <>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search discussions"
                />
              </div>
              <div className={styles.sortDropdown}>
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort discussions"
                >
                  <option value="latest">Latest</option>
                  <option value="mostLiked">Most Liked</option>
                  <option value="mostCommented">Most Commented</option>
                  <option value="mostViewed">Most Viewed</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className={styles.postFeed}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className={styles.postCard}>
                <div className={styles.postAuthor}>
                  <Skeleton width={48} height={48} radius={'50%'} />
                  <div>
                    <Skeleton height={16} width={160} />
                    <div className={styles.skeletonSpacerXs}>
                      <Skeleton height={14} width={140} />
                    </div>
                  </div>
                </div>
                <div className={styles.skeletonSpacerSm}>
                  <Skeleton height={24} width={'80%'} />
                </div>
                <div className={styles.skeletonSpacerSm}>
                  <Skeleton height={16} width={'95%'} />
                  <div className={styles.skeletonSpacerXs}>
                    <Skeleton height={16} width={'90%'} />
                  </div>
                </div>
                <div className={styles.postTags}>
                  <Skeleton height={28} width={90} />
                  <Skeleton height={28} width={110} />
                  <Skeleton height={28} width={100} />
                </div>
                <footer className={styles.postFooter}>
                  <Skeleton height={20} width={240} />
                  <Skeleton height={16} width={120} />
                </footer>
              </article>
            ))
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <h4>No discussions found</h4>
              <p>Try adjusting your search, sort, or tags.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className={styles.postCard}>
                <div className={styles.postAuthor}>
                  <Image src={post.authorAvatar} alt={post.author} className={styles.authorAvatar} width={48} height={48} />
                  <div>
                    <span className={styles.authorName}>{post.author}</span>
                    <span className={styles.authorTitle}>{post.authorTitle}</span>
                  </div>
                  {post.isTrending && (
                    <div className={styles.trendingBadge}>
                      <TrendingUp size={16} />
                      <span>Trending</span>
                    </div>
                  )}
                </div>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <div className={styles.postTags}>
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className={`${styles.tag} ${activeTag === tag ? styles.tagActive : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTag(activeTag === tag ? '' : tag); } }}
                      aria-label={activeTag === tag ? `Remove tag filter ${tag}` : `Filter by tag ${tag}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <footer className={styles.postFooter}>
                  <div className={styles.postStats}>
                    <span title="Likes"><ThumbsUp size={16} /> {formatNumber(post.likes)}</span>
                    <span title="Comments"><MessageCircle size={16} /> {formatNumber(post.comments)}</span>
                    <span title="Views"><Eye size={16} /> {formatNumber(post.views)}</span>
                  </div>
                  <span className={styles.postTimestamp}>{post.timestamp}</span>
                </footer>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={`${styles.sidebarWidget} ${styles.statsWidget}`}>
          <h3>Community Stats</h3>
          {loading ? (
            <div className={styles.statsGrid}>
              <div>
                <Skeleton height={24} width={70} />
                <div className={styles.skeletonSpacerXs}>
                  <Skeleton height={14} width={80} />
                </div>
              </div>
              <div>
                <Skeleton height={24} width={70} />
                <div className={styles.skeletonSpacerXs}>
                  <Skeleton height={14} width={100} />
                </div>
              </div>
              <div>
                <Skeleton height={24} width={70} />
                <div className={styles.skeletonSpacerXs}>
                  <Skeleton height={14} width={70} />
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.statsGrid}>
              <div>
                <span>{communityStats.members}</span>
                <span>Members</span>
              </div>
              <div>
                <span>{communityStats.discussions}</span>
                <span>Discussions</span>
              </div>
              <div>
                <span>{communityStats.online}</span>
                <span>Online</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.sidebarWidget}>
          <h3>Popular Tags</h3>
          {loading ? (
            <div className={styles.popularTags}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={32} width={100} />
              ))}
            </div>
          ) : (
            <div className={styles.popularTags}>
              {popularTags.map(tag => (
                <span
                  key={tag}
                  className={`${styles.tag} ${activeTag === tag ? styles.tagActive : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTag(activeTag === tag ? '' : tag); } }}
                  aria-label={activeTag === tag ? `Remove tag filter ${tag}` : `Filter by tag ${tag}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.sidebarWidget}>
          <h3>Community Leaders</h3>
          {loading ? (
            <div className={styles.leaderList}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.leaderItem}>
                  <Skeleton width={40} height={40} radius={'50%'} />
                  <div>
                    <Skeleton height={16} width={140} />
                    <div className={styles.skeletonSpacerXs}>
                      <Skeleton height={14} width={100} />
                    </div>
                  </div>
                  <Skeleton height={24} width={60} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.leaderList}>
              <div className={styles.leaderItem}>
                <Image src="/avatars/avatar-1.png" alt="Alex Morgan" width={40} height={40} className={styles.leaderAvatar} />
                <div>
                  <span className={styles.leaderName}>Alex Morgan</span>
                  <span className={styles.leaderRole}>Top Contributor</span>
                </div>
                <span className={styles.leaderPoints}>1.2K</span>
              </div>
              <div className={styles.leaderItem}>
                <Image src="/avatars/avatar-2.png" alt="Jamie Smith" width={40} height={40} className={styles.leaderAvatar} />
                <div>
                  <span className={styles.leaderName}>Jamie Smith</span>
                  <span className={styles.leaderRole}>Helpful Mentor</span>
                </div>
                <span className={styles.leaderPoints}>980</span>
              </div>
              <div className={styles.leaderItem}>
                <Image src="/avatars/avatar-3.png" alt="Taylor Kim" width={40} height={40} className={styles.leaderAvatar} />
                <div>
                  <span className={styles.leaderName}>Taylor Kim</span>
                  <span className={styles.leaderRole}>Discussion Starter</span>
                </div>
                <span className={styles.leaderPoints}>870</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CommunityPage;