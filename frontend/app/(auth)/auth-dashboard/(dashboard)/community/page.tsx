// @AI-HINT: This is the Community page, designed as a premium forum/social hub. It features a main discussion feed, sorting/filtering controls, and a sidebar with community stats and popular tags to encourage user interaction.

import React from 'react';
import Image from 'next/image';
import { Plus, Search, ThumbsUp, MessageCircle, Eye, ChevronDown } from 'lucide-react';
import styles from './Community.module.css';

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
  },
];

// AI-HINT: Mock data for the sidebar.
const communityStats = {
  members: '12,458',
  discussions: '3,892',
  online: '312',
};

const popularTags = ['freelancing', 'marketing', 'design', 'development', 'business', 'productivity'];

const CommunityPage = () => {
  return (
    <div className={styles.communityContainer}>
      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1>Community Hub</h1>
          <button className={styles.newPostButton}>
            <Plus size={20} />
            <span>Create Post</span>
          </button>
        </div>

        <div className={styles.feedControls}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search discussions..." />
          </div>
          <div className={styles.sortDropdown}>
            <span>Sort by: Latest</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className={styles.postFeed}>
          {communityPosts.map((post) => (
            <article key={post.id} className={styles.postCard}>
              <div className={styles.postAuthor}>
                <Image src={post.authorAvatar} alt={post.author} className={styles.authorAvatar} width={40} height={40} />
                <div>
                  <span className={styles.authorName}>{post.author}</span>
                  <span className={styles.authorTitle}>{post.authorTitle}</span>
                </div>
              </div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
              <div className={styles.postTags}>
                {post.tags.map(tag => <span key={tag} className={styles.tag}>#{tag}</span>)}
              </div>
              <footer className={styles.postFooter}>
                <div className={styles.postStats}>
                  <span title="Likes"><ThumbsUp size={16} /> {post.likes}</span>
                  <span title="Comments"><MessageCircle size={16} /> {post.comments}</span>
                  <span title="Views"><Eye size={16} /> {post.views}</span>
                </div>
                <span className={styles.postTimestamp}>{post.timestamp}</span>
              </footer>
            </article>
          ))}
        </div>
      </main>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={`${styles.sidebarWidget} ${styles.statsWidget}`}>
          <h3>Community Stats</h3>
          <div className={styles.statsGrid}>
            <div><span>{communityStats.members}</span><span>Members</span></div>
            <div><span>{communityStats.discussions}</span><span>Discussions</span></div>
            <div><span>{communityStats.online}</span><span>Online</span></div>
          </div>
        </div>

        <div className={styles.sidebarWidget}>
          <h3>Popular Tags</h3>
          <div className={styles.popularTags}>
            {popularTags.map(tag => <span key={tag} className={styles.tag}>#{tag}</span>)}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CommunityPage;
