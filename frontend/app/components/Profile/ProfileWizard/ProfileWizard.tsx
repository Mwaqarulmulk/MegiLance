// @AI-HINT: Profile completion wizard - guides users through completing their profile
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  FaUser, FaBriefcase, FaCertificate, FaFileAlt, 
  FaCheckCircle, FaArrowRight, FaArrowLeft 
} from 'react-icons/fa';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import Textarea from '@/app/components/Textarea/Textarea';
import Select from '@/app/components/Select/Select';
import TagsInput from '@/app/components/TagsInput/TagsInput';
import FileUpload from '@/app/components/FileUpload/FileUpload';

import commonStyles from './ProfileWizard.common.module.css';
import lightStyles from './ProfileWizard.light.module.css';
import darkStyles from './ProfileWizard.dark.module.css';

interface ProfileData {
  // Basic Info
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  avatarUrl: string;
  
  // Professional Info
  skills: string[];
  hourlyRate: string;
  experienceLevel: string;
  availability: string;
  languages: string[];
  
  // Portfolio
  portfolioItems: PortfolioItem[];
  
  // Verification
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

const steps = [
  { id: 1, title: 'Basic Info', icon: FaUser },
  { id: 2, title: 'Professional', icon: FaBriefcase },
  { id: 3, title: 'Portfolio', icon: FaFileAlt },
  { id: 4, title: 'Verification', icon: FaCertificate },
];

const ProfileWizard: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    title: '',
    bio: '',
    location: '',
    timezone: 'Asia/Karachi',
    avatarUrl: '',
    skills: [],
    hourlyRate: '',
    experienceLevel: '',
    availability: '',
    languages: ['English'],
    portfolioItems: [],
    phoneNumber: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
  });

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = {
    container: cn(commonStyles.container, themeStyles.container),
    header: cn(commonStyles.header, themeStyles.header),
    title: cn(commonStyles.title, themeStyles.title),
    subtitle: cn(commonStyles.subtitle, themeStyles.subtitle),
    progressBar: cn(commonStyles.progressBar, themeStyles.progressBar),
    progressFill: cn(commonStyles.progressFill, themeStyles.progressFill),
    stepsIndicator: cn(commonStyles.stepsIndicator, themeStyles.stepsIndicator),
    step: cn(commonStyles.step, themeStyles.step),
    stepActive: cn(commonStyles.stepActive, themeStyles.stepActive),
    stepCompleted: cn(commonStyles.stepCompleted, themeStyles.stepCompleted),
    stepIcon: cn(commonStyles.stepIcon, themeStyles.stepIcon),
    stepTitle: cn(commonStyles.stepTitle, themeStyles.stepTitle),
    content: cn(commonStyles.content, themeStyles.content),
    formGrid: cn(commonStyles.formGrid, themeStyles.formGrid),
    actions: cn(commonStyles.actions, themeStyles.actions),
  };

  const progress = (currentStep / steps.length) * 100;

  const handleNext = async () => {
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Basic Info
        if (!profileData.firstName) newErrors.firstName = 'First name is required';
        if (!profileData.lastName) newErrors.lastName = 'Last name is required';
        if (!profileData.title) newErrors.title = 'Professional title is required';
        if (!profileData.bio || profileData.bio.length < 50) {
          newErrors.bio = 'Bio must be at least 50 characters';
        }
        break;
      
      case 2: // Professional
        if (profileData.skills.length === 0) {
          newErrors.skills = 'Add at least 3 skills';
        }
        if (!profileData.hourlyRate || parseFloat(profileData.hourlyRate) <= 0) {
          newErrors.hourlyRate = 'Hourly rate must be greater than 0';
        }
        if (!profileData.experienceLevel) {
          newErrors.experienceLevel = 'Select your experience level';
        }
        break;
      
      case 3: // Portfolio
        if (profileData.portfolioItems.length === 0) {
          newErrors.portfolio = 'Add at least one portfolio item';
        }
        break;
      
      case 4: // Verification
        if (!profileData.phoneNumber) {
          newErrors.phoneNumber = 'Phone number is required for verification';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/users/me/complete-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        router.push('/dashboard?onboarding=complete');
      } else {
        const error = await response.json();
        setErrors({ general: error.detail || 'Failed to save profile' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioItem = () => {
    setProfileData({
      ...profileData,
      portfolioItems: [
        ...profileData.portfolioItems,
        {
          title: '',
          description: '',
          url: '',
          imageUrl: '',
          tags: [],
        },
      ],
    });
  };

  const removePortfolioItem = (index: number) => {
    setProfileData({
      ...profileData,
      portfolioItems: profileData.portfolioItems.filter((_, i) => i !== index),
    });
  };

  const updatePortfolioItem = (index: number, field: string, value: any) => {
    const updated = [...profileData.portfolioItems];
    updated[index] = { ...updated[index], [field]: value };
    setProfileData({ ...profileData, portfolioItems: updated });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Complete Your Profile</h1>
        <p className={styles.subtitle}>
          Let's set up your professional profile to start winning projects
        </p>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Steps Indicator */}
      <div className={styles.stepsIndicator}>
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              styles.step,
              currentStep === step.id && styles.stepActive,
              currentStep > step.id && styles.stepCompleted
            )}
          >
            <div className={styles.stepIcon}>
              {currentStep > step.id ? (
                <FaCheckCircle size={24} />
              ) : (
                <step.icon size={24} />
              )}
            </div>
            <div className={styles.stepTitle}>{step.title}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className={styles.content}>
        {currentStep === 1 && (
          <div className={styles.formGrid}>
            <div className="col-span-2">
              <FileUpload
                label="Profile Picture"
                accept="image/*"
                maxSize={5}
                uploadType="avatar"
                onUploadComplete={(url) => setProfileData({ ...profileData, avatarUrl: url })}
              />
            </div>
            <Input
              name="firstName"
              label="First Name"
              placeholder="John"
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              error={errors.firstName}
            />
            <Input
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              error={errors.lastName}
            />
            <Input
              name="title"
              label="Professional Title"
              placeholder="Full Stack Developer"
              value={profileData.title}
              onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
              error={errors.title}
              className="col-span-2"
            />
            <Textarea
              name="bio"
              label="Professional Bio"
              placeholder="Tell clients about your experience, skills, and what makes you unique..."
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              error={errors.bio}
              rows={6}
              className="col-span-2"
              helpText={`${profileData.bio.length}/500 characters (minimum 50)`}
            />
            <Input
              name="location"
              label="Location"
              placeholder="Karachi, Pakistan"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            />
            <Select
              id="timezone"
              label="Timezone"
              value={profileData.timezone}
              onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
              options={[
                { value: 'Asia/Karachi', label: 'Pakistan (GMT+5)' },
                { value: 'Asia/Dubai', label: 'UAE (GMT+4)' },
                { value: 'Europe/London', label: 'UK (GMT+0)' },
                { value: 'America/New_York', label: 'US East (GMT-5)' },
              ]}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.formGrid}>
            <div className="col-span-2">
              <TagsInput
                id="skills"
                label="Skills (Add at least 3)"
                placeholder="e.g., React, Node.js, Python"
                tags={profileData.skills}
                onTagsChange={(skills) => setProfileData({ ...profileData, skills })}
                error={errors.skills}
              />
            </div>
            <Input
              name="hourlyRate"
              type="number"
              label="Hourly Rate (PKR)"
              placeholder="2000"
              value={profileData.hourlyRate}
              onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
              error={errors.hourlyRate}
            />
            <Select
              id="experienceLevel"
              label="Experience Level"
              value={profileData.experienceLevel}
              onChange={(e) => setProfileData({ ...profileData, experienceLevel: e.target.value })}
              options={[
                { value: '', label: 'Select level' },
                { value: 'entry', label: 'Entry Level (0-2 years)' },
                { value: 'intermediate', label: 'Intermediate (2-5 years)' },
                { value: 'expert', label: 'Expert (5+ years)' },
              ]}
            />
            <Select
              id="availability"
              label="Availability"
              value={profileData.availability}
              onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
              options={[
                { value: '', label: 'Select availability' },
                { value: 'full-time', label: 'Full-time (40+ hrs/week)' },
                { value: 'part-time', label: 'Part-time (20-40 hrs/week)' },
                { value: 'as-needed', label: 'As Needed (<20 hrs/week)' },
              ]}
            />
            <div className="col-span-2">
              <TagsInput
                id="languages"
                label="Languages"
                placeholder="e.g., English, Urdu"
                tags={profileData.languages}
                onTagsChange={(languages) => setProfileData({ ...profileData, languages })}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Portfolio Items</h3>
              <Button variant="secondary" onClick={addPortfolioItem}>
                Add Portfolio Item
              </Button>
            </div>
            
            {profileData.portfolioItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No portfolio items yet. Add your best work to showcase your skills!
              </div>
            )}
            
            {profileData.portfolioItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Portfolio Item #{index + 1}</h4>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => removePortfolioItem(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="mb-4">
                  <FileUpload
                    label="Portfolio Image"
                    accept="image/*"
                    maxSize={10}
                    uploadType="portfolio"
                    onUploadComplete={(url) => updatePortfolioItem(index, 'imageUrl', url)}
                  />
                </div>
                  <div className={styles.formGrid}>
                    <Input
                      name={`portfolio-title-${index}`}
                      label="Project Title"
                      placeholder="E-commerce Website"
                      value={item.title}
                      onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                    />
                    <Input
                      name={`portfolio-url-${index}`}
                      label="Project URL"
                      placeholder="https://example.com"
                      value={item.url}
                      onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                    />
                    <Textarea
                      name={`portfolio-description-${index}`}
                      label="Description"
                      placeholder="Describe the project, your role, and technologies used..."
                      value={item.description}
                      onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                      rows={4}
                      className="col-span-2"
                    />
                    <div className="col-span-2">
                      <TagsInput
                        id={`portfolio-tags-${index}`}
                        label="Technologies"
                        placeholder="e.g., React, Node.js"
                        tags={item.tags}
                        onTagsChange={(tags) => updatePortfolioItem(index, 'tags', tags)}
                      />
                    </div>
                  </div>
              </div>
            ))}
            
            {errors.portfolio && (
              <div className="text-red-500 text-sm mt-2">{errors.portfolio}</div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className={styles.formGrid}>
            <Input
              name="phoneNumber"
              label="Phone Number"
              placeholder="+92 300 1234567"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
              error={errors.phoneNumber}
              helpText="Required for verification and important notifications"
              className="col-span-2"
            />
            <Input
              name="linkedinUrl"
              label="LinkedIn Profile (Optional)"
              placeholder="https://linkedin.com/in/yourprofile"
              value={profileData.linkedinUrl}
              onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
            />
            <Input
              name="githubUrl"
              label="GitHub Profile (Optional)"
              placeholder="https://github.com/yourusername"
              value={profileData.githubUrl}
              onChange={(e) => setProfileData({ ...profileData, githubUrl: e.target.value })}
            />
            <Input
              name="websiteUrl"
              label="Personal Website (Optional)"
              placeholder="https://yourwebsite.com"
              value={profileData.websiteUrl}
              onChange={(e) => setProfileData({ ...profileData, websiteUrl: e.target.value })}
              className="col-span-2"
            />
          </div>
        )}

        {errors.general && (
          <div className="text-red-500 text-center mt-4">{errors.general}</div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {currentStep > 1 && (
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={loading}
          >
            <FaArrowLeft className="mr-2" />
            Back
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          isLoading={loading}
          disabled={loading}
        >
          {currentStep < steps.length ? (
            <>
              Next
              <FaArrowRight className="ml-2" />
            </>
          ) : (
            <>
              Complete Profile
              <FaCheckCircle className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileWizard;
