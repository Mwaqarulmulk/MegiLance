"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import {
  User,
  Briefcase,
  FileText,
  Link2,
  Camera,
  CheckCircle,
  ChevronRight,
  Save,
  X,
  Rocket,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Button from "@/app/components/atoms/Button/Button";
import Input from "@/app/components/atoms/Input/Input";
import Textarea from "@/app/components/atoms/Textarea/Textarea";
import Select from "@/app/components/molecules/Select/Select";
import TagsInput from "@/app/components/atoms/TagsInput/TagsInput";
import FileUpload from "@/app/components/molecules/FileUpload/FileUpload";

import commonStyles from "./ProfileCompletion.common.module.css";
import lightStyles from "./ProfileCompletion.light.module.css";
import darkStyles from "./ProfileCompletion.dark.module.css";

interface ProfileData {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  avatarUrl: string;
  skills: string[];
  hourlyRate: string;
  experienceLevel: string;
  availability: string;
  languages: string[];
  portfolioItems: PortfolioItem[];
  phoneNumber: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
}

interface PortfolioItem {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  tags: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  required: boolean;
  fields: string[];
}

const sections: Section[] = [
  {
    id: "basic",
    title: "Basic Info",
    description: "Your name, title & photo",
    icon: User,
    required: true,
    fields: ["firstName", "lastName", "title", "avatarUrl"],
  },
  {
    id: "skills",
    title: "Skills & Experience",
    description: "Your expertise & rates",
    icon: Briefcase,
    required: true,
    fields: ["skills", "experienceLevel", "hourlyRate"],
  },
  {
    id: "portfolio",
    title: "Portfolio",
    description: "Showcase your best work",
    icon: FileText,
    required: false,
    fields: ["portfolioItems"],
  },
  {
    id: "links",
    title: "Links & Contact",
    description: "Connect your profiles",
    icon: Link2,
    required: false,
    fields: ["linkedinUrl", "githubUrl", "websiteUrl", "phoneNumber"],
  },
];

const timezoneOptions = [
  { value: "Pacific/Honolulu", label: "Hawaii (GMT-10)" },
  { value: "America/Los_Angeles", label: "US Pacific (GMT-8)" },
  { value: "America/Denver", label: "US Mountain (GMT-7)" },
  { value: "America/Chicago", label: "US Central (GMT-6)" },
  { value: "America/New_York", label: "US East (GMT-5)" },
  { value: "America/Sao_Paulo", label: "Brazil (GMT-3)" },
  { value: "Europe/London", label: "UK (GMT+0)" },
  { value: "Europe/Paris", label: "Central Europe (GMT+1)" },
  { value: "Europe/Istanbul", label: "Turkey (GMT+3)" },
  { value: "Asia/Dubai", label: "UAE (GMT+4)" },
  { value: "Asia/Karachi", label: "Pakistan (GMT+5)" },
  { value: "Asia/Kolkata", label: "India (GMT+5:30)" },
  { value: "Asia/Bangkok", label: "Thailand (GMT+7)" },
  { value: "Asia/Shanghai", label: "China (GMT+8)" },
  { value: "Asia/Tokyo", label: "Japan (GMT+9)" },
  { value: "Australia/Sydney", label: "Australia (GMT+11)" },
];

export default function ProfileCompletion() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    title: "",
    bio: "",
    location: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi",
    avatarUrl: "",
    skills: [],
    hourlyRate: "",
    experienceLevel: "",
    availability: "",
    languages: ["English"],
    portfolioItems: [],
    phoneNumber: "",
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data: any = await api.auth.me();
        if (data) {
          const nameParts = (data.full_name || "").split(" ");
          setProfileData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            title: data.title || "",
            bio: data.bio || "",
            location: data.location || "",
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi",
            avatarUrl: data.profile_image_url || "",
            skills: Array.isArray(data.skills) ? data.skills : [],
            hourlyRate: data.hourly_rate ? String(data.hourly_rate) : "",
            experienceLevel: data.experience_level || "",
            availability: data.availability_status || "",
            languages: Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : ["English"],
            portfolioItems: [],
            phoneNumber: data.phone_number || "",
            linkedinUrl: data.linkedin_url || "",
            githubUrl: data.github_url || "",
            websiteUrl: data.website_url || "",
          });
        }
      } catch {
        /* first visit */
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const themeStyles = resolvedTheme === "dark" ? darkStyles : lightStyles;
  const s = useMemo(() => {
    const merge = (key: string) =>
      cn((commonStyles as any)[key], (themeStyles as any)[key]);
    return {
      container: merge("container"),
      header: merge("header"),
      title: merge("title"),
      subtitle: merge("subtitle"),
      progressSection: merge("progressSection"),
      progressRing: merge("progressRing"),
      progressText: merge("progressText"),
      progressLabel: merge("progressLabel"),
      sectionsGrid: merge("sectionsGrid"),
      sectionCard: merge("sectionCard"),
      sectionCardActive: merge("sectionCardActive"),
      sectionHeader: merge("sectionHeader"),
      sectionIcon: merge("sectionIcon"),
      sectionIconComplete: merge("sectionIconComplete"),
      sectionTitle: merge("sectionTitle"),
      sectionDescription: merge("sectionDescription"),
      sectionBadge: merge("sectionBadge"),
      sectionBadgeComplete: merge("sectionBadgeComplete"),
      sectionBadgeRequired: merge("sectionBadgeRequired"),
      sectionArrow: merge("sectionArrow"),
      editorPanel: merge("editorPanel"),
      editorHeader: merge("editorHeader"),
      editorTitle: merge("editorTitle"),
      editorActions: merge("editorActions"),
      formGrid: merge("formGrid"),
      saveBar: merge("saveBar"),
      successMessage: merge("successMessage"),
      errorMessage: merge("errorMessage"),
      portfolioHeader: merge("portfolioHeader"),
      portfolioCard: merge("portfolioCard"),
      portfolioCardHeader: merge("portfolioCardHeader"),
      completionFooter: merge("completionFooter"),
    };
  }, [resolvedTheme, themeStyles]);

  const profileScore = useMemo(() => {
    let score = 0;
    if (profileData.firstName && profileData.lastName) score += 10;
    if (profileData.title) score += 10;
    if (profileData.bio.length >= 50) score += 15;
    if (profileData.avatarUrl) score += 10;
    if (profileData.location) score += 5;
    if (profileData.skills.length >= 3) score += 15;
    if (profileData.hourlyRate && parseFloat(profileData.hourlyRate) > 0) score += 10;
    if (profileData.experienceLevel) score += 5;
    if (profileData.availability) score += 5;
    if (profileData.portfolioItems.length > 0) score += 5;
    if (profileData.phoneNumber) score += 5;
    if (profileData.linkedinUrl || profileData.githubUrl || profileData.websiteUrl) score += 5;
    return score;
  }, [profileData]);

  const sectionProgress = useMemo(() => {
    const result: Record<string, { complete: number; total: number; percent: number }> = {};

    // Basic Info
    const basicFields = [
      !!(profileData.firstName && profileData.lastName),
      !!profileData.title,
      !!profileData.avatarUrl,
    ];
    result.basic = {
      complete: basicFields.filter(Boolean).length,
      total: basicFields.length,
      percent: Math.round((basicFields.filter(Boolean).length / basicFields.length) * 100),
    };

    // Skills
    const skillsFields = [
      profileData.skills.length >= 3,
      !!profileData.experienceLevel,
      profileData.hourlyRate ? parseFloat(profileData.hourlyRate) > 0 : false,
    ];
    result.skills = {
      complete: skillsFields.filter(Boolean).length,
      total: skillsFields.length,
      percent: Math.round((skillsFields.filter(Boolean).length / skillsFields.length) * 100),
    };

    // Portfolio
    result.portfolio = {
      complete: profileData.portfolioItems.length > 0 ? 1 : 0,
      total: 1,
      percent: profileData.portfolioItems.length > 0 ? 100 : 0,
    };

    // Links
    const linksFields = [
      !!profileData.linkedinUrl,
      !!profileData.githubUrl,
      !!profileData.websiteUrl,
      !!profileData.phoneNumber,
    ];
    result.links = {
      complete: linksFields.filter(Boolean).length,
      total: linksFields.length,
      percent: Math.round((linksFields.filter(Boolean).length / linksFields.length) * 100),
    };

    return result;
  }, [profileData]);

  const handleSaveSection = async () => {
    setSaving(true);
    setErrors({});
    setSaveSuccess(false);

    try {
      await api.users.completeProfile({
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        title: profileData.title.trim(),
        headline: profileData.title.trim(),
        bio: profileData.bio.trim() || undefined,
        location: profileData.location.trim() || undefined,
        timezone: profileData.timezone || undefined,
        profile_image_url: profileData.avatarUrl || undefined,
        skills: profileData.skills.length > 0 ? profileData.skills.join(", ") : undefined,
        hourly_rate: profileData.hourlyRate ? parseFloat(profileData.hourlyRate) : undefined,
        experience_level: profileData.experienceLevel || undefined,
        availability_status: profileData.availability || undefined,
        languages: profileData.languages.length > 0 ? profileData.languages.join(", ") : undefined,
        phone_number: profileData.phoneNumber.trim() || undefined,
        linkedin_url: profileData.linkedinUrl.trim() || undefined,
        github_url: profileData.githubUrl.trim() || undefined,
        website_url: profileData.websiteUrl.trim() || undefined,
      } as unknown as Record<string, unknown>);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  };

  const addPortfolioItem = () => {
    setProfileData({
      ...profileData,
      portfolioItems: [
        ...profileData.portfolioItems,
        { title: "", description: "", url: "", imageUrl: "", tags: [] },
      ],
    });
  };

  const removePortfolioItem = (index: number) => {
    setProfileData({
      ...profileData,
      portfolioItems: profileData.portfolioItems.filter((_, i) => i !== index),
    });
  };

  const updatePortfolioItem = (index: number, field: string, value: string | string[]) => {
    const updated = [...profileData.portfolioItems];
    updated[index] = { ...updated[index], [field]: value };
    setProfileData({ ...profileData, portfolioItems: updated });
  };

  const handleFinish = async () => {
    await handleSaveSection();
    try {
      localStorage.setItem("onboarding_complete", "true");
    } catch (e) {
      // Ignore storage errors
    }
    const role = localStorage.getItem("portal_area") || "freelancer";
    router.push(role === "client" ? "/client/dashboard" : "/freelancer/dashboard");
  };

  if (loading) {
    return (
      <div className={s.container}>
        <div className={s.header}>
          <div className={cn(s.title, "animate-pulse")}>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h1 className={s.title}>Complete Your Profile</h1>
        <p className={s.subtitle}>
          Fill in your details to stand out and start winning projects
        </p>
      </div>

      {/* Progress Ring */}
      <div className={s.progressSection}>
        <div className={s.progressRing}>
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              opacity="0.1"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${profileScore * 3.267} 326.7`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          </svg>
          <div className={s.progressText}>
            <span>{profileScore}%</span>
          </div>
        </div>
        <div className={s.progressLabel}>
          {profileScore >= 80 ? (
            <>
              <Sparkles size={16} />
              Profile looks great!
            </>
          ) : profileScore >= 50 ? (
            "Good progress, keep going!"
          ) : (
            "Complete your profile to get started"
          )}
        </div>
      </div>

      {/* Section Cards */}
      <div className={s.sectionsGrid}>
        {sections.map((section) => {
          const progress = sectionProgress[section.id];
          const isActive = activeSection === section.id;
          const isComplete = progress.percent === 100;

          return (
            <button
              key={section.id}
              type="button"
              className={cn(
                s.sectionCard,
                isActive && s.sectionCardActive,
              )}
              onClick={() => setActiveSection(isActive ? null : section.id)}
            >
              <div className={s.sectionHeader}>
                <div
                  className={cn(
                    s.sectionIcon,
                    isComplete && s.sectionIconComplete,
                  )}
                >
                  {isComplete ? (
                    <CheckCircle size={24} />
                  ) : (
                    <section.icon size={24} />
                  )}
                </div>
                <div>
                  <div className={s.sectionTitle}>{section.title}</div>
                  <div className={s.sectionDescription}>{section.description}</div>
                </div>
                <div
                  className={cn(
                    s.sectionBadge,
                    isComplete ? s.sectionBadgeComplete : s.sectionBadgeRequired,
                  )}
                >
                  {isComplete ? "Done" : section.required ? "Required" : "Optional"}
                </div>
                <ChevronRight
                  size={20}
                  className={cn(s.sectionArrow, isActive && "rotate-90")}
                />
              </div>
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.percent}%`,
                    backgroundColor: isComplete
                      ? "var(--color-success, #10b981)"
                      : "var(--color-primary, #3b82f6)",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Inline Editor Panel */}
      {activeSection && (
        <div className={s.editorPanel}>
          <div className={s.editorHeader}>
            <h2 className={s.editorTitle}>
              {sections.find((s) => s.id === activeSection)?.title}
            </h2>
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className={s.editorActions}
            >
              <X size={20} />
            </button>
          </div>

          {/* Basic Info Editor */}
          {activeSection === "basic" && (
            <div className={s.formGrid}>
              <div className="col-span-2">
                <FileUpload
                  label="Profile Picture"
                  accept="image/*"
                  maxSize={5}
                  uploadType="avatar"
                  onUploadComplete={(url) =>
                    setProfileData({ ...profileData, avatarUrl: url })
                  }
                />
              </div>
              <Input
                name="firstName"
                label="First Name *"
                placeholder="John"
                value={profileData.firstName}
                onChange={(e) =>
                  setProfileData({ ...profileData, firstName: e.target.value })
                }
              />
              <Input
                name="lastName"
                label="Last Name *"
                placeholder="Doe"
                value={profileData.lastName}
                onChange={(e) =>
                  setProfileData({ ...profileData, lastName: e.target.value })
                }
              />
              <div className="col-span-2">
                <Input
                  name="title"
                  label="Professional Title *"
                  placeholder="Full Stack Developer | UI/UX Designer"
                  value={profileData.title}
                  onChange={(e) =>
                    setProfileData({ ...profileData, title: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Textarea
                  name="bio"
                  label="Professional Bio"
                  placeholder="Tell clients about your experience, skills, and what makes you unique..."
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  rows={5}
                />
              </div>
              <Input
                name="location"
                label="Location"
                placeholder="Karachi, Pakistan"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
              />
              <Select
                id="timezone"
                label="Timezone"
                value={profileData.timezone}
                onChange={(e) =>
                  setProfileData({ ...profileData, timezone: e.target.value })
                }
                options={timezoneOptions}
              />
            </div>
          )}

          {/* Skills Editor */}
          {activeSection === "skills" && (
            <div className={s.formGrid}>
              <div className="col-span-2">
                <TagsInput
                  id="skills"
                  label="Skills * (add at least 3)"
                  placeholder="e.g., React, Node.js, Python, UI Design"
                  tags={profileData.skills}
                  onTagsChange={(skills) =>
                    setProfileData({ ...profileData, skills })
                  }
                />
              </div>
              <Input
                name="hourlyRate"
                type="number"
                label="Hourly Rate ($)"
                placeholder="25"
                value={profileData.hourlyRate}
                onChange={(e) =>
                  setProfileData({ ...profileData, hourlyRate: e.target.value })
                }
              />
              <Select
                id="experienceLevel"
                label="Experience Level"
                value={profileData.experienceLevel}
                onChange={(e) =>
                  setProfileData({ ...profileData, experienceLevel: e.target.value })
                }
                options={[
                  { value: "", label: "Select level" },
                  { value: "entry", label: "Entry Level (0-2 years)" },
                  { value: "intermediate", label: "Intermediate (2-5 years)" },
                  { value: "expert", label: "Expert (5+ years)" },
                ]}
              />
              <Select
                id="availability"
                label="Availability"
                value={profileData.availability}
                onChange={(e) =>
                  setProfileData({ ...profileData, availability: e.target.value })
                }
                options={[
                  { value: "", label: "Select availability" },
                  { value: "full-time", label: "Full-time (40+ hrs/week)" },
                  { value: "part-time", label: "Part-time (20-40 hrs/week)" },
                  { value: "as-needed", label: "As Needed (<20 hrs/week)" },
                ]}
              />
              <div className="col-span-2">
                <TagsInput
                  id="languages"
                  label="Languages"
                  placeholder="e.g., English, Urdu, Arabic"
                  tags={profileData.languages}
                  onTagsChange={(languages) =>
                    setProfileData({ ...profileData, languages })
                  }
                />
              </div>
            </div>
          )}

          {/* Portfolio Editor */}
          {activeSection === "portfolio" && (
            <div>
              <div className={s.portfolioHeader}>
                <p className="text-sm opacity-70">
                  Profiles with portfolio items get 3x more invitations
                </p>
                <Button variant="secondary" size="sm" onClick={addPortfolioItem}>
                  Add Project
                </Button>
              </div>

              {profileData.portfolioItems.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 opacity-60">
                  <FileText size={40} />
                  <p>No portfolio items yet</p>
                  <Button variant="outline" size="sm" onClick={addPortfolioItem}>
                    Add Your First Project
                  </Button>
                </div>
              )}

              {profileData.portfolioItems.map((item, index) => (
                <div key={index} className={s.portfolioCard}>
                  <div className={s.portfolioCardHeader}>
                    <span>Project #{index + 1}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removePortfolioItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className={s.formGrid}>
                    <Input
                      name={`portfolio-title-${index}`}
                      label="Project Title"
                      placeholder="E-commerce Website"
                      value={item.title}
                      onChange={(e) =>
                        updatePortfolioItem(index, "title", e.target.value)
                      }
                    />
                    <Input
                      name={`portfolio-url-${index}`}
                      label="Project URL"
                      placeholder="https://example.com"
                      value={item.url}
                      onChange={(e) =>
                        updatePortfolioItem(index, "url", e.target.value)
                      }
                    />
                    <div className="col-span-2">
                      <Textarea
                        name={`portfolio-desc-${index}`}
                        label="Description"
                        placeholder="Describe the project, your role, and technologies used..."
                        value={item.description}
                        onChange={(e) =>
                          updatePortfolioItem(index, "description", e.target.value)
                        }
                        rows={3}
                      />
                    </div>
                    <div className="col-span-2">
                      <TagsInput
                        id={`portfolio-tags-${index}`}
                        label="Technologies"
                        placeholder="e.g., React, Node.js"
                        tags={item.tags}
                        onTagsChange={(tags) =>
                          updatePortfolioItem(index, "tags", tags)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Links Editor */}
          {activeSection === "links" && (
            <div className={s.formGrid}>
              <div className="col-span-2">
                <Input
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="+92 300 1234567"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phoneNumber: e.target.value })
                  }
                />
              </div>
              <Input
                name="linkedinUrl"
                label="LinkedIn Profile"
                placeholder="https://linkedin.com/in/yourprofile"
                value={profileData.linkedinUrl}
                onChange={(e) =>
                  setProfileData({ ...profileData, linkedinUrl: e.target.value })
                }
              />
              <Input
                name="githubUrl"
                label="GitHub Profile"
                placeholder="https://github.com/yourusername"
                value={profileData.githubUrl}
                onChange={(e) =>
                  setProfileData({ ...profileData, githubUrl: e.target.value })
                }
              />
              <div className="col-span-2">
                <Input
                  name="websiteUrl"
                  label="Personal Website"
                  placeholder="https://yourwebsite.com"
                  value={profileData.websiteUrl}
                  onChange={(e) =>
                    setProfileData({ ...profileData, websiteUrl: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Save Bar */}
          <div className={s.saveBar}>
            {errors.general && (
              <div className={s.errorMessage}>
                <AlertCircle size={16} />
                {errors.general}
              </div>
            )}
            {saveSuccess && (
              <div className={s.successMessage}>
                <CheckCircle size={16} />
                Saved successfully!
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleSaveSection}
              isLoading={saving}
              disabled={saving}
            >
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Finish Footer */}
      <div className={s.completionFooter}>
        <p className="text-sm opacity-70 mb-3">
          {profileScore >= 50
            ? "Your profile is looking good! You can continue to the dashboard."
            : "Complete at least Basic Info and Skills to get started."}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/freelancer/dashboard")}>
            Skip for now
          </Button>
          <Button
            variant="primary"
            onClick={handleFinish}
            disabled={profileScore < 20}
          >
            <Rocket size={16} />
            Finish & Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
