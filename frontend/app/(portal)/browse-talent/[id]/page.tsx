// @AI-HINT: Public freelancer profile page — shows avatar, bio, skills, portfolio, reviews, and hire/message CTAs
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { publicProfileApi } from "@/lib/api";
import Button from "@/app/components/atoms/Button/Button";
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  MessageCircle,
  ExternalLink,
  ArrowLeft,
  Globe,
} from "lucide-react";

import commonStyles from "./FreelancerProfile.common.module.css";
import lightStyles from "./FreelancerProfile.light.module.css";
import darkStyles from "./FreelancerProfile.dark.module.css";

interface FreelancerData {
  id: number;
  full_name?: string;
  username?: string;
  title?: string;
  bio?: string;
  location?: string;
  hourly_rate?: number;
  availability_status?: string;
  skills?: { name: string }[] | string[];
  profile_image_url?: string;
  average_rating?: number;
  total_reviews?: number;
  completed_projects?: number;
  experience_level?: string;
  years_of_experience?: number;
  portfolio_url?: string;
  slug?: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  tech_stack?: string[];
  demo_url?: string;
}

interface Review {
  id: number;
  reviewer_name?: string;
  rating: number;
  comment?: string;
  review_text?: string;
  created_at: string;
}

function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(value) ? "#f59e0b" : "none"}
          color={n <= Math.round(value) ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </span>
  );
}

export default function FreelancerProfilePage() {
  const { id } = useParams();
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const [profile, setProfile] = useState<FreelancerData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themeStyles = resolvedTheme === "dark" ? darkStyles : lightStyles;

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [profileData, portfolioData, reviewData, statsData] =
        await Promise.all([
          publicProfileApi.getById(id as string).catch(() => null),
          publicProfileApi.getPortfolio(id as string).catch(() => []),
          publicProfileApi
            .getReviews(id as string, 1, 20)
            .catch(() => ({ items: [], reviews: [] })),
          publicProfileApi.getStats(id as string).catch(() => ({})),
        ]);

      if (!profileData) {
        setError("Freelancer not found.");
        return;
      }

      setProfile(profileData as FreelancerData);
      const portfolioItems =
        (portfolioData as any)?.items ||
        (portfolioData as any)?.portfolio ||
        (Array.isArray(portfolioData) ? portfolioData : []);
      setPortfolio(portfolioItems);
      const reviewItems =
        (reviewData as any)?.items ||
        (reviewData as any)?.reviews ||
        (Array.isArray(reviewData) ? reviewData : []);
      setReviews(reviewItems);
      setStats((statsData as any) || {});
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!resolvedTheme) return null;

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className={cn(commonStyles.page, themeStyles.page)}>
        <div className={commonStyles.inner}>
          <div className={cn(commonStyles.card, themeStyles.card)}>
            <div className={commonStyles.hero}>
              <div
                className={cn(
                  commonStyles.skeletonBlock,
                  commonStyles.skeletonAvatar,
                )}
              />
              <div style={{ flex: 1 }}>
                <div
                  className={cn(
                    commonStyles.skeletonBlock,
                    commonStyles.skeletonName,
                  )}
                  style={{ marginBottom: "0.75rem" }}
                />
                <div
                  className={cn(
                    commonStyles.skeletonBlock,
                    commonStyles.skeletonLine,
                  )}
                  style={{ width: "60%" }}
                />
                <div
                  className={cn(
                    commonStyles.skeletonBlock,
                    commonStyles.skeletonLine,
                  )}
                  style={{ width: "40%" }}
                />
              </div>
            </div>
          </div>
          <div className={cn(commonStyles.card, themeStyles.card)}>
            <div
              className={cn(
                commonStyles.skeletonBlock,
                commonStyles.skeletonName,
              )}
              style={{ marginBottom: "1rem", width: "120px" }}
            />
            {[100, 90, 70].map((w, i) => (
              <div
                key={i}
                className={cn(
                  commonStyles.skeletonBlock,
                  commonStyles.skeletonLine,
                )}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error || !profile) {
    return (
      <div className={cn(commonStyles.page, themeStyles.page)}>
        <div className={cn(commonStyles.errorState, themeStyles.errorState)}>
          <p>{error || "Freelancer not found."}</p>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft size={16} />
            &nbsp;Go back
          </Button>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || "Freelancer";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avgRating = profile.average_rating || (stats.avg_rating as number) || 0;
  const reviewCount =
    profile.total_reviews || (stats.total_reviews as number) || reviews.length;
  const completedProjects =
    profile.completed_projects || (stats.completed_projects as number) || 0;
  const skillList: string[] = (profile.skills || []).map((s: any) =>
    typeof s === "string" ? s : s?.name || "",
  );

  return (
    <div className={cn(commonStyles.page, themeStyles.page)}>
      <div className={commonStyles.inner}>
        {/* Back nav */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft size={14} />
            &nbsp;Back
          </Button>
        </div>

        {/* ── Hero Card ── */}
        <div className={cn(commonStyles.card, themeStyles.card)}>
          <div className={commonStyles.hero}>
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={displayName}
                className={commonStyles.avatar}
              />
            ) : (
              <div
                className={cn(
                  commonStyles.avatarPlaceholder,
                  themeStyles.avatarPlaceholder,
                )}
              >
                {initials}
              </div>
            )}

            <div className={commonStyles.heroInfo}>
              <h1 className={cn(commonStyles.name, themeStyles.name)}>
                {displayName}
              </h1>
              {profile.title && (
                <p className={cn(commonStyles.title, themeStyles.title)}>
                  {profile.title}
                </p>
              )}

              {/* Meta row: location, experience */}
              <div className={commonStyles.metaRow}>
                {profile.location && (
                  <span
                    className={cn(commonStyles.metaItem, themeStyles.metaItem)}
                  >
                    <MapPin size={13} />
                    {profile.location}
                  </span>
                )}
                {profile.experience_level && (
                  <span
                    className={cn(commonStyles.metaItem, themeStyles.metaItem)}
                  >
                    <Briefcase size={13} />
                    {profile.experience_level}
                  </span>
                )}
                {profile.availability_status && (
                  <span
                    className={cn(commonStyles.metaItem, themeStyles.metaItem)}
                  >
                    <Clock size={13} />
                    {profile.availability_status.replace(/_/g, " ")}
                  </span>
                )}
              </div>

              {/* Rating */}
              {avgRating > 0 && (
                <div className={commonStyles.ratingRow}>
                  <StarRating value={avgRating} size={16} />
                  <span
                    className={cn(
                      commonStyles.ratingValue,
                      themeStyles.ratingValue,
                    )}
                  >
                    {avgRating.toFixed(1)}
                  </span>
                  <span
                    className={cn(
                      commonStyles.ratingCount,
                      themeStyles.ratingCount,
                    )}
                  >
                    ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className={commonStyles.heroActions}>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push(`/messages?to=${profile.id}`)}
                >
                  <MessageCircle size={15} />
                  &nbsp;Send Message
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    router.push(`/contracts/direct?freelancer_id=${profile.id}`)
                  }
                >
                  <Briefcase size={15} />
                  &nbsp;Hire Directly
                </Button>
                {profile.portfolio_url && (
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => window.open(profile.portfolio_url, "_blank")}
                  >
                    <Globe size={15} />
                    &nbsp;Portfolio
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className={cn(commonStyles.statsStrip, themeStyles.statsStrip)}>
            <div className={commonStyles.statItem}>
              <div
                className={cn(commonStyles.statValue, themeStyles.statValue)}
              >
                {completedProjects}
              </div>
              <div
                className={cn(commonStyles.statLabel, themeStyles.statLabel)}
              >
                Jobs Done
              </div>
            </div>
            <div className={commonStyles.statItem}>
              <div
                className={cn(commonStyles.statValue, themeStyles.statValue)}
              >
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </div>
              <div
                className={cn(commonStyles.statLabel, themeStyles.statLabel)}
              >
                Avg Rating
              </div>
            </div>
            <div className={commonStyles.statItem}>
              <div
                className={cn(commonStyles.statValue, themeStyles.statValue)}
              >
                {reviewCount}
              </div>
              <div
                className={cn(commonStyles.statLabel, themeStyles.statLabel)}
              >
                Reviews
              </div>
            </div>
          </div>
        </div>

        {/* ── Rate & Availability ── */}
        <div className={cn(commonStyles.card, themeStyles.card)}>
          <h2
            className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}
          >
            <DollarSign size={18} /> Rate &amp; Availability
          </h2>
          <div className={commonStyles.infoGrid}>
            <div className={cn(commonStyles.infoBox, themeStyles.infoBox)}>
              <div
                className={cn(
                  commonStyles.infoBoxLabel,
                  themeStyles.infoBoxLabel,
                )}
              >
                Hourly Rate
              </div>
              <div
                className={cn(
                  commonStyles.infoBoxValue,
                  themeStyles.infoBoxValue,
                )}
              >
                {profile.hourly_rate ? `$${profile.hourly_rate}/hr` : "—"}
              </div>
            </div>
            <div className={cn(commonStyles.infoBox, themeStyles.infoBox)}>
              <div
                className={cn(
                  commonStyles.infoBoxLabel,
                  themeStyles.infoBoxLabel,
                )}
              >
                Availability
              </div>
              <div
                className={cn(
                  commonStyles.infoBoxValue,
                  themeStyles.infoBoxValue,
                )}
              >
                {profile.availability_status
                  ? profile.availability_status.replace(/_/g, " ")
                  : "—"}
              </div>
            </div>
            <div className={cn(commonStyles.infoBox, themeStyles.infoBox)}>
              <div
                className={cn(
                  commonStyles.infoBoxLabel,
                  themeStyles.infoBoxLabel,
                )}
              >
                Experience
              </div>
              <div
                className={cn(
                  commonStyles.infoBoxValue,
                  themeStyles.infoBoxValue,
                )}
              >
                {profile.experience_level || "—"}
              </div>
            </div>
            <div className={cn(commonStyles.infoBox, themeStyles.infoBox)}>
              <div
                className={cn(
                  commonStyles.infoBoxLabel,
                  themeStyles.infoBoxLabel,
                )}
              >
                Years Exp.
              </div>
              <div
                className={cn(
                  commonStyles.infoBoxValue,
                  themeStyles.infoBoxValue,
                )}
              >
                {profile.years_of_experience
                  ? `${profile.years_of_experience} yrs`
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        {skillList.length > 0 && (
          <div className={cn(commonStyles.card, themeStyles.card)}>
            <h2
              className={cn(
                commonStyles.sectionTitle,
                themeStyles.sectionTitle,
              )}
            >
              🛠 Skills
            </h2>
            <div className={commonStyles.skillsWrap}>
              {skillList.map((skill, i) => (
                <span
                  key={i}
                  className={cn(commonStyles.skillTag, themeStyles.skillTag)}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── About / Bio ── */}
        {profile.bio && (
          <div className={cn(commonStyles.card, themeStyles.card)}>
            <h2
              className={cn(
                commonStyles.sectionTitle,
                themeStyles.sectionTitle,
              )}
            >
              👤 About
            </h2>
            <p className={cn(commonStyles.bio, themeStyles.bio)}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* ── Portfolio ── */}
        {portfolio.length > 0 && (
          <div className={cn(commonStyles.card, themeStyles.card)}>
            <h2
              className={cn(
                commonStyles.sectionTitle,
                themeStyles.sectionTitle,
              )}
            >
              🎨 Portfolio
            </h2>
            <div className={commonStyles.portfolioGrid}>
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    commonStyles.portfolioCard,
                    themeStyles.portfolioCard,
                  )}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className={commonStyles.portfolioThumb}
                    />
                  ) : (
                    <div
                      className={cn(
                        commonStyles.portfolioThumbPlaceholder,
                        themeStyles.portfolioThumbPlaceholder,
                      )}
                    >
                      🖼️
                    </div>
                  )}
                  <div
                    className={cn(
                      commonStyles.portfolioInfo,
                      themeStyles.portfolioInfo,
                    )}
                  >
                    <div className={commonStyles.portfolioTitle}>
                      {item.demo_url ? (
                        <a
                          href={item.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {item.title}
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        item.title
                      )}
                    </div>
                    {item.description && (
                      <p className={commonStyles.portfolioDesc}>
                        {item.description}
                      </p>
                    )}
                    {item.tech_stack && item.tech_stack.length > 0 && (
                      <div className={commonStyles.portfolioTags}>
                        {item.tech_stack.map((t, i) => (
                          <span
                            key={i}
                            className={cn(
                              commonStyles.portfolioTag,
                              themeStyles.portfolioTag,
                            )}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews ── */}
        <div className={cn(commonStyles.card, themeStyles.card)}>
          <h2
            className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}
          >
            ⭐ Reviews ({reviewCount})
          </h2>
          {reviews.length === 0 ? (
            <div
              className={cn(commonStyles.emptyState, themeStyles.emptyState)}
            >
              No reviews yet.
            </div>
          ) : (
            <div className={commonStyles.reviewList}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={cn(
                    commonStyles.reviewCard,
                    themeStyles.reviewCard,
                  )}
                >
                  <div className={commonStyles.reviewHeader}>
                    <span
                      className={cn(
                        commonStyles.reviewerName,
                        themeStyles.reviewerName,
                      )}
                    >
                      {review.reviewer_name || "Client"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <StarRating value={review.rating} size={14} />
                      <span
                        className={cn(
                          commonStyles.reviewDate,
                          themeStyles.reviewDate,
                        )}
                      >
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {(review.comment || review.review_text) && (
                    <p
                      className={cn(
                        commonStyles.reviewComment,
                        themeStyles.reviewComment,
                      )}
                    >
                      {review.comment || review.review_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
