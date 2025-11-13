// @AI-HINT: Public user profile - portfolio showcase, reviews, contact
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  FaStar, FaMapMarkerAlt, FaClock, FaCheckCircle, FaDollarSign,
  FaLinkedin, FaGithub, FaGlobe, FaEnvelope, FaPhone,
  FaCalendar, FaAward, FaThumbsUp, FaComments
} from 'react-icons/fa';
import Button from '@/app/components/Button/Button';
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
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = {
    container: cn(commonStyles.container, themeStyles.container),
    header: cn(commonStyles.header, themeStyles.header),
    avatar: cn(commonStyles.avatar, themeStyles.avatar),
    nameSection: cn(commonStyles.nameSection, themeStyles.nameSection),
    title: cn(commonStyles.title, themeStyles.title),
    badge: cn(commonStyles.badge, themeStyles.badge),
    stats: cn(commonStyles.stats, themeStyles.stats),
    statItem: cn(commonStyles.statItem, themeStyles.statItem),
    actions: cn(commonStyles.actions, themeStyles.actions),
    section: cn(commonStyles.section, themeStyles.section),
    sectionTitle: cn(commonStyles.sectionTitle, themeStyles.sectionTitle),
    aboutText: cn(commonStyles.aboutText, themeStyles.aboutText),
    skillsGrid: cn(commonStyles.skillsGrid, themeStyles.skillsGrid),
    skillTag: cn(commonStyles.skillTag, themeStyles.skillTag),
    portfolioGrid: cn(commonStyles.portfolioGrid, themeStyles.portfolioGrid),
    portfolioCard: cn(commonStyles.portfolioCard, themeStyles.portfolioCard),
    reviewCard: cn(commonStyles.reviewCard, themeStyles.reviewCard),
    criteriaGrid: cn(commonStyles.criteriaGrid, themeStyles.criteriaGrid),
    contactInfo: cn(commonStyles.contactInfo, themeStyles.contactInfo),
    socialLinks: cn(commonStyles.socialLinks, themeStyles.socialLinks),
    availability: cn(commonStyles.availability, themeStyles.availability),
  };

  useEffect(() => {
    loadProfile();
    loadPortfolio();
    loadReviews();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/backend/api/users/${userId}/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const response = await fetch(`/backend/api/users/${userId}/portfolio`);
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`/backend/api/users/${userId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="text-center py-12">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className="text-center py-12">Profile not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <Image
            src={profile.avatarUrl || '/default-avatar.png'}
            alt={profile.name}
            width={120}
            height={120}
            className="rounded-full"
          />
          {profile.verified && (
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
              <FaCheckCircle className="text-white" />
            </div>
          )}
        </div>

        <div className={styles.nameSection}>
          <div className="flex items-center gap-3">
            <h1 className={styles.title}>{profile.name}</h1>
            {profile.topRated && (
              <span className={styles.badge}>
                <FaAward className="mr-1" />
                Top Rated
              </span>
            )}
          </div>
          <p className="text-xl opacity-90">{profile.title}</p>
          
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaClock />
              <span>{profile.timezone}</span>
            </div>
            {profile.hourlyRate && (
              <div className="flex items-center gap-1">
                <FaDollarSign />
                <span>${profile.hourlyRate}/hr</span>
              </div>
            )}
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className="flex items-center gap-1">
                {renderStars(parseFloat(calculateAverageRating() || '0'))}
              </div>
              <span>{calculateAverageRating()} ({reviews.length} reviews)</span>
            </div>
            <div className={styles.statItem}>
              <FaThumbsUp className="text-green-500" />
              <span>{profile.projectsCompleted || 0} projects completed</span>
            </div>
            <div className={styles.statItem}>
              <FaCalendar />
              <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={styles.availability}>
            <FaClock className="mr-2" />
            {profile.availability === 'immediate' ? 'Available Now' : 
             profile.availability === 'within-week' ? 'Available Within a Week' :
             'Available Within a Month'}
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" size="lg">
            <FaEnvelope className="mr-2" />
            Contact
          </Button>
          <Button variant="secondary" size="lg">
            Hire Now
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <p className={styles.aboutText}>{profile.bio}</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <div className={styles.skillsGrid}>
          {profile.skills?.map((skill: string, index: number) => (
            <span key={index} className={styles.skillTag}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Portfolio ({portfolio.length})</h2>
        <div className={styles.portfolioGrid}>
          {portfolio.map(item => (
            <div
              key={item.id}
              className={styles.portfolioCard}
              onClick={() => setSelectedPortfolioItem(item)}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={400}
                height={300}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm opacity-75 mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Reviews & Ratings ({reviews.length})
        </h2>
        {reviews.map(review => (
          <div key={review.id} className={styles.reviewCard}>
            <div className="flex items-start gap-4">
              <Image
                src={review.reviewerAvatar}
                alt={review.reviewerName}
                width={50}
                height={50}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.reviewerName}</p>
                    <p className="text-sm opacity-75">{review.projectTitle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 font-semibold">{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className={styles.criteriaGrid}>
                  <div>Quality: {renderStars(review.criteria.quality)}</div>
                  <div>Communication: {renderStars(review.criteria.communication)}</div>
                  <div>Timeliness: {renderStars(review.criteria.timeliness)}</div>
                  <div>Professionalism: {renderStars(review.criteria.professionalism)}</div>
                </div>

                <p className="mt-3">{review.comment}</p>
                <p className="text-sm opacity-50 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Information</h2>
        <div className={styles.contactInfo}>
          {profile.email && (
            <div className="flex items-center gap-2">
              <FaEnvelope />
              <span>{profile.email}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex items-center gap-2">
              <FaPhone />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>

        <div className={styles.socialLinks}>
          {profile.linkedinUrl && (
            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
              <FaLinkedin /> LinkedIn
            </a>
          )}
          {profile.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
              <FaGithub /> GitHub
            </a>
          )}
          {profile.websiteUrl && (
            <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
              <FaGlobe /> Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
