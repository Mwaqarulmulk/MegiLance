// @AI-HINT: Client Profile editing page — company info, preferences, payment methods
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Button from "@/app/components/atoms/Button/Button";
import Input from "@/app/components/atoms/Input/Input";
import Textarea from "@/app/components/atoms/Textarea/Textarea";
import { useToaster } from "@/app/components/molecules/Toast/ToasterProvider";
import { PageTransition } from "@/app/components/Animations/PageTransition";
import { ProfileHeaderSkeleton, FormSkeleton } from "@/app/components/Animations/Skeleton/SkeletonPresets";
import { apiFetch } from "@/lib/api/core";
import {
  Building2,
  Globe,
  Users,
  Mail,
  Phone,
  MapPin,
  Link2,
  CreditCard,
  Shield,
  Save,
  User,
  Briefcase,
  Settings,
} from "lucide-react";
import commonStyles from "./ClientProfile.common.module.css";
import lightStyles from "./ClientProfile.light.module.css";
import darkStyles from "./ClientProfile.dark.module.css";

interface ClientProfile {
  name: string;
  company_name: string;
  industry: string;
  company_size: string;
  bio: string;
  headline: string;
  location: string;
  website: string;
  phone: string;
  linkedin_url: string;
  twitter_url: string;
  profile_image_url: string;
  cover_image_url: string;
}

const industryOptions = [
  { value: "", label: "Select industry" },
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & Banking" },
  { value: "ecommerce", label: "E-commerce & Retail" },
  { value: "education", label: "Education" },
  { value: "media", label: "Media & Entertainment" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "real-estate", label: "Real Estate" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

const companySizeOptions = [
  { value: "", label: "Select size" },
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export default function ClientProfilePage() {
  const { resolvedTheme } = useTheme();
  const { showToast } = useToaster();
  const themeStyles = resolvedTheme === "dark" ? darkStyles : lightStyles;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ClientProfile>({
    name: "",
    company_name: "",
    industry: "",
    company_size: "",
    bio: "",
    headline: "",
    location: "",
    website: "",
    phone: "",
    linkedin_url: "",
    twitter_url: "",
    profile_image_url: "",
    cover_image_url: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>("/users/me");
      setProfile({
        name: data.name || "",
        company_name: data.company_name || "",
        industry: data.industry || "",
        company_size: data.company_size || "",
        bio: data.bio || "",
        headline: data.headline || "",
        location: data.location || "",
        website: data.website_url || "",
        phone: data.phone || "",
        linkedin_url: data.linkedin_url || "",
        twitter_url: data.twitter_url || "",
        profile_image_url: data.profile_image_url || "",
        cover_image_url: data.cover_image_url || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          full_name: profile.name,
          bio: profile.bio,
          headline: profile.headline,
          location: profile.location,
          linkedin_url: profile.linkedin_url,
          twitter_url: profile.twitter_url,
          company_name: profile.company_name,
          industry: profile.industry,
          company_size: profile.company_size,
          website_url: profile.website,
          phone_number: profile.phone,
          profile_image_url: profile.profile_image_url || null,
          cover_image_url: profile.cover_image_url || null,
        }),
      });
      showToast("Profile saved successfully");
    } catch (error) {
      showToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof ClientProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_type", "avatar");

      const response = await fetch("/api/v1/uploads/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(await import("@/lib/api/core")).getAuthToken() || ""}`,
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const url = data.url || data.file_url || data.path;
        if (url) update("profile_image_url", url);
      } else {
        showToast("Failed to upload image. Please try again.", "error");
      }
    } catch {
      showToast("Failed to upload image. Please try again.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Cover image must be under 10MB", "error");
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_type", "cover");

      const response = await fetch("/api/v1/uploads/cover", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(await import("@/lib/api/core")).getAuthToken() || ""}`,
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const url = data.url || data.file_url || data.path;
        if (url) update("cover_image_url", url);
      } else {
        showToast("Failed to upload cover image. Please try again.", "error");
      }
    } catch {
      showToast("Failed to upload cover image. Please try again.", "error");
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className={cn(commonStyles.container, themeStyles.container, "space-y-6 max-w-4xl mx-auto py-6 animate-pulse")}>
        <ProfileHeaderSkeleton />
        <FormSkeleton fields={4} />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container)}>
        <div className={commonStyles.header}>
          <h1>Company Profile</h1>
          <p>Manage your company information and preferences</p>
        </div>

        {/* Profile Photo & Cover */}
        <section className={cn(commonStyles.card, themeStyles.card)}>
          <div className={commonStyles.sectionHeader}>
            <User size={20} />
            <h2>Profile Photo</h2>
          </div>
          {profile.cover_image_url && (
            <div style={{ width: "100%", height: 160, borderRadius: 8, overflow: "hidden", marginBottom: 16, position: "relative" }}>
              <img src={profile.cover_image_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => coverFileInputRef.current?.click()}
                disabled={uploadingCover}
                style={{
                  position: "absolute", bottom: 8, right: 8, padding: "6px 12px",
                  background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 6,
                  fontSize: 12, cursor: uploadingCover ? "not-allowed" : "pointer",
                  opacity: uploadingCover ? 0.6 : 1,
                }}
              >
                {uploadingCover ? "Uploading…" : "Change Cover"}
              </button>
            </div>
          )}
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverImageUpload}
            style={{ display: "none" }}
            aria-label="Upload cover image"
          />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
              background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 700, color: "#64748b", flexShrink: 0,
            }}>
              {profile.profile_image_url ? (
                <img src={profile.profile_image_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (profile.name || "U")[0].toUpperCase()
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                aria-label="Upload profile photo"
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploadingImage}
              >
                {uploadingImage ? "Uploading…" : "Change Photo"}
              </Button>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>JPG, PNG or GIF · Max 5 MB</p>
              {!profile.cover_image_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  isLoading={uploadingCover}
                  style={{ marginTop: 4 }}
                >
                  {uploadingCover ? "Uploading…" : "Upload Cover"}
                </Button>
              )}
            </div>
          </div>
        </section>

        <div className={commonStyles.grid}>
          {/* Company Information */}
          <section className={cn(commonStyles.card, themeStyles.card)}>
            <div className={commonStyles.sectionHeader}>
              <Building2 size={20} />
              <h2>Company Information</h2>
            </div>
            <div className={commonStyles.formGrid}>
              <div className={commonStyles.field}>
                <label>Company Name</label>
                <Input
                  value={profile.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  placeholder="Your company name"
                />
              </div>
              <div className={commonStyles.field}>
                <label>Industry</label>
                <select
                  value={profile.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  className={cn(commonStyles.select, themeStyles.select)}
                >
                  {industryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={commonStyles.field}>
                <label>Company Size</label>
                <select
                  value={profile.company_size}
                  onChange={(e) => update("company_size", e.target.value)}
                  className={cn(commonStyles.select, themeStyles.select)}
                >
                  {companySizeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={commonStyles.field}>
                <label>Website</label>
                <Input
                  value={profile.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          </section>

          {/* Personal Information */}
          <section className={cn(commonStyles.card, themeStyles.card)}>
            <div className={commonStyles.sectionHeader}>
              <User size={20} />
              <h2>Personal Information</h2>
            </div>
            <div className={commonStyles.formGrid}>
              <div className={commonStyles.field}>
                <label>Full Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className={commonStyles.field}>
                <label>Headline</label>
                <Input
                  value={profile.headline}
                  onChange={(e) => update("headline", e.target.value)}
                  placeholder="e.g., CEO at Acme Corp"
                />
              </div>
              <div className={commonStyles.field}>
                <label>Location</label>
                <Input
                  value={profile.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="City, Country"
                />
              </div>
              <div className={commonStyles.field}>
                <label>Phone</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className={commonStyles.field}>
              <label>Bio</label>
              <Textarea
                value={profile.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="Tell freelancers about yourself and your company..."
                rows={4}
              />
            </div>
          </section>

          {/* Social Links */}
          <section className={cn(commonStyles.card, themeStyles.card)}>
            <div className={commonStyles.sectionHeader}>
              <Globe size={20} />
              <h2>Social Links</h2>
            </div>
            <div className={commonStyles.formGrid}>
              <div className={commonStyles.field}>
                <label>LinkedIn</label>
                <Input
                  value={profile.linkedin_url}
                  onChange={(e) => update("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className={commonStyles.field}>
                <label>Twitter/X</label>
                <Input
                  value={profile.twitter_url}
                  onChange={(e) => update("twitter_url", e.target.value)}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className={commonStyles.actions}>
          <Button variant="primary" onClick={handleSave} isLoading={saving}>
            <Save size={16} /> Save Profile
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
