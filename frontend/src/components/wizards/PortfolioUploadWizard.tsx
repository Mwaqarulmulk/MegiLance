// @AI-HINT: Portfolio upload wizard for freelancers to showcase work with images and case studies
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import WizardContainer from '@/app/components/Wizard/WizardContainer/WizardContainer';
import commonStyles from './PortfolioUploadWizard.common.module.css';
import lightStyles from './PortfolioUploadWizard.light.module.css';
import darkStyles from './PortfolioUploadWizard.dark.module.css';
import { FaBriefcase, FaImage, FaCode, FaFileAlt, FaEye } from 'react-icons/fa';

interface ProjectImage {
  id: string;
  file: File;
  preview: string;
  caption: string;
  isCover: boolean;
}

interface PortfolioData {
  title: string;
  category: string;
  clientName: string;
  projectDate: string;
  projectUrl: string;
  shortDescription: string;
  images: ProjectImage[];
  technologies: string[];
  customTech: string;
  detailedCaseStudy: {
    challenge: string;
    solution: string;
    results: string;
    myRole: string;
  };
  featured: boolean;
  visibility: 'public' | 'private';
}

interface PortfolioUploadWizardProps {
  userId: string;
}

const CATEGORIES = [
  'Web Development',
  'Mobile Apps',
  'UI/UX Design',
  'Graphic Design',
  'Data Science',
  'DevOps',
  'Content Writing',
  'Marketing',
  'Other'
];

const COMMON_TECHNOLOGIES = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'Angular', 'Vue.js', 'Django', 'Flask', 'PostgreSQL', 'MongoDB',
  'AWS', 'Docker', 'Kubernetes', 'Figma', 'Photoshop', 'Illustrator'
];

export default function PortfolioUploadWizard({ userId }: PortfolioUploadWizardProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    title: '',
    category: '',
    clientName: '',
    projectDate: '',
    projectUrl: '',
    shortDescription: '',
    images: [],
    technologies: [],
    customTech: '',
    detailedCaseStudy: {
      challenge: '',
      solution: '',
      results: '',
      myRole: ''
    },
    featured: false,
    visibility: 'public'
  });

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    const newImages: ProjectImage[] = await Promise.all(
      validFiles.map(async file => {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        return {
          id: `${Date.now()}-${file.name}`,
          file,
          preview,
          caption: '',
          isCover: portfolioData.images.length === 0
        };
      })
    );

    setPortfolioData({
      ...portfolioData,
      images: [...portfolioData.images, ...newImages]
    });
  };

  const updateImage = (id: string, field: string, value: any) => {
    setPortfolioData({
      ...portfolioData,
      images: portfolioData.images.map(img => {
        if (img.id === id) {
          if (field === 'isCover' && value) {
            return { ...img, isCover: true };
          }
          return { ...img, [field]: value };
        }
        if (field === 'isCover' && value) {
          return { ...img, isCover: false };
        }
        return img;
      })
    });
  };

  const removeImage = (id: string) => {
    const filtered = portfolioData.images.filter(img => img.id !== id);
    if (filtered.length > 0 && !filtered.some(img => img.isCover)) {
      filtered[0].isCover = true;
    }
    setPortfolioData({ ...portfolioData, images: filtered });
  };

  const toggleTechnology = (tech: string) => {
    if (portfolioData.technologies.includes(tech)) {
      setPortfolioData({
        ...portfolioData,
        technologies: portfolioData.technologies.filter(t => t !== tech)
      });
    } else {
      setPortfolioData({
        ...portfolioData,
        technologies: [...portfolioData.technologies, tech]
      });
    }
  };

  const addCustomTech = () => {
    if (portfolioData.customTech.trim()) {
      setPortfolioData({
        ...portfolioData,
        technologies: [...portfolioData.technologies, portfolioData.customTech.trim()],
        customTech: ''
      });
    }
  };

  // STEP 1: Project Details
  const Step1Details = () => (
    <div className={commonStyles.stepContent}>
      <div className={commonStyles.header}>
        <FaBriefcase className={commonStyles.icon} />
        <div>
          <h2>Project Details</h2>
          <p>Tell us about this portfolio piece</p>
        </div>
      </div>

      <div className={commonStyles.formRow}>
        <div className={commonStyles.formGroup}>
          <label>Project Title *</label>
          <input
            type="text"
            value={portfolioData.title}
            onChange={(e) => setPortfolioData({ ...portfolioData, title: e.target.value })}
            placeholder="E-commerce Platform Redesign"
            maxLength={100}
            className={cn(commonStyles.input, themeStyles.input)}
          />
        </div>

        <div className={commonStyles.formGroup}>
          <label>Category *</label>
          <select
            value={portfolioData.category}
            onChange={(e) => setPortfolioData({ ...portfolioData, category: e.target.value })}
            className={cn(commonStyles.select, themeStyles.select)}
            aria-label="Select portfolio category"
          >
            <option value="">Select category...</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={commonStyles.formRow}>
        <div className={commonStyles.formGroup}>
          <label>Client/Company Name</label>
          <input
            type="text"
            value={portfolioData.clientName}
            onChange={(e) => setPortfolioData({ ...portfolioData, clientName: e.target.value })}
            placeholder="Acme Corporation (or leave blank)"
            className={cn(commonStyles.input, themeStyles.input)}
          />
        </div>

        <div className={commonStyles.formGroup}>
          <label>Completion Date *</label>
          <input
            type="month"
            value={portfolioData.projectDate}
            onChange={(e) => setPortfolioData({ ...portfolioData, projectDate: e.target.value })}
            className={cn(commonStyles.input, themeStyles.input)}
            aria-label="Project completion date"
          />
        </div>
      </div>

      <div className={commonStyles.formGroup}>
        <label>Project URL (if live)</label>
        <input
          type="url"
          value={portfolioData.projectUrl}
          onChange={(e) => setPortfolioData({ ...portfolioData, projectUrl: e.target.value })}
          placeholder="https://project-demo.com"
          className={cn(commonStyles.input, themeStyles.input)}
        />
      </div>

      <div className={commonStyles.formGroup}>
        <label>Short Description *</label>
        <textarea
          value={portfolioData.shortDescription}
          onChange={(e) => setPortfolioData({ ...portfolioData, shortDescription: e.target.value })}
          placeholder="A brief 2-3 sentence overview of the project..."
          rows={3}
          maxLength={300}
          className={cn(commonStyles.textarea, themeStyles.textarea)}
        />
        <div className={commonStyles.charCount}>{portfolioData.shortDescription.length}/300</div>
      </div>
    </div>
  );

  // STEP 2: Images Upload
  const Step2Images = () => (
    <div className={commonStyles.stepContent}>
      <div className={commonStyles.header}>
        <FaImage className={commonStyles.icon} />
        <div>
          <h2>Project Images</h2>
          <p>Upload screenshots or photos of your work</p>
        </div>
      </div>

      <div className={cn(commonStyles.uploadBox, themeStyles.uploadBox)}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => addImages(e.target.files)}
          id="portfolio-images"
          style={{ display: 'none' }}
        />
        <label htmlFor="portfolio-images" className={cn(commonStyles.uploadButton, themeStyles.uploadButton)}>
          <FaImage />
          Select Images
        </label>
        <p className={commonStyles.uploadHint}>
          PNG, JPG, GIF • Max 5MB per image • Minimum 3 images recommended
        </p>
      </div>

      {portfolioData.images.length > 0 && (
        <div className={commonStyles.imageGrid}>
          {portfolioData.images.map(image => (
            <div key={image.id} className={cn(commonStyles.imageCard, themeStyles.imageCard)}>
              <img src={image.preview} alt="Preview" className={commonStyles.imagePreview} />
              {image.isCover && <div className={commonStyles.coverBadge}>Cover Photo</div>}
              <div className={commonStyles.imageControls}>
                <input
                  type="text"
                  value={image.caption}
                  onChange={(e) => updateImage(image.id, 'caption', e.target.value)}
                  placeholder="Add caption..."
                  className={cn(commonStyles.input, themeStyles.input)}
                />
                <div className={commonStyles.imageActions}>
                  <button
                    onClick={() => updateImage(image.id, 'isCover', true)}
                    disabled={image.isCover}
                    className={cn(commonStyles.coverButton, image.isCover && commonStyles.coverActive)}
                  >
                    Set as Cover
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className={commonStyles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {portfolioData.images.length > 0 && (
        <div className={cn(commonStyles.infoBox, themeStyles.infoBox)}>
          <strong>💡 Tip:</strong> Use high-quality images. The first image or your selected cover will appear in portfolio previews.
        </div>
      )}
    </div>
  );

  // STEP 3: Technologies
  const Step3Technologies = () => (
    <div className={commonStyles.stepContent}>
      <div className={commonStyles.header}>
        <FaCode className={commonStyles.icon} />
        <div>
          <h2>Technologies Used</h2>
          <p>Select or add the tools and technologies</p>
        </div>
      </div>

      <div className={commonStyles.techGrid}>
        {COMMON_TECHNOLOGIES.map(tech => (
          <div
            key={tech}
            className={cn(
              commonStyles.techTag,
              themeStyles.techTag,
              portfolioData.technologies.includes(tech) && commonStyles.techSelected,
              portfolioData.technologies.includes(tech) && themeStyles.techSelected
            )}
            onClick={() => toggleTechnology(tech)}
          >
            {tech}
          </div>
        ))}
      </div>

      <div className={commonStyles.customTechBox}>
        <div className={commonStyles.formGroup}>
          <label>Add Custom Technology</label>
          <div className={commonStyles.customTechInput}>
            <input
              type="text"
              value={portfolioData.customTech}
              onChange={(e) => setPortfolioData({ ...portfolioData, customTech: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addCustomTech()}
              placeholder="Type technology name..."
              className={cn(commonStyles.input, themeStyles.input)}
            />
            <button
              onClick={addCustomTech}
              className={cn(commonStyles.addButton, themeStyles.addButton)}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {portfolioData.technologies.length > 0 && (
        <div className={cn(commonStyles.selectedTechBox, themeStyles.selectedTechBox)}>
          <h4>Selected Technologies ({portfolioData.technologies.length})</h4>
          <div className={commonStyles.selectedTechList}>
            {portfolioData.technologies.map(tech => (
              <div key={tech} className={cn(commonStyles.selectedTechTag, themeStyles.selectedTechTag)}>
                {tech}
                <button onClick={() => toggleTechnology(tech)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // STEP 4: Case Study
  const Step4CaseStudy = () => (
    <div className={commonStyles.stepContent}>
      <div className={commonStyles.header}>
        <FaFileAlt className={commonStyles.icon} />
        <div>
          <h2>Detailed Case Study</h2>
          <p>Provide context about your work (optional but recommended)</p>
        </div>
      </div>

      <div className={commonStyles.formGroup}>
        <label>Challenge / Problem</label>
        <textarea
          value={portfolioData.detailedCaseStudy.challenge}
          onChange={(e) => setPortfolioData({
            ...portfolioData,
            detailedCaseStudy: { ...portfolioData.detailedCaseStudy, challenge: e.target.value }
          })}
          placeholder="What problem were you solving? What were the client's needs?"
          rows={4}
          className={cn(commonStyles.textarea, themeStyles.textarea)}
        />
      </div>

      <div className={commonStyles.formGroup}>
        <label>Solution / Approach</label>
        <textarea
          value={portfolioData.detailedCaseStudy.solution}
          onChange={(e) => setPortfolioData({
            ...portfolioData,
            detailedCaseStudy: { ...portfolioData.detailedCaseStudy, solution: e.target.value }
          })}
          placeholder="How did you approach the problem? What was your strategy?"
          rows={4}
          className={cn(commonStyles.textarea, themeStyles.textarea)}
        />
      </div>

      <div className={commonStyles.formGroup}>
        <label>Results / Impact</label>
        <textarea
          value={portfolioData.detailedCaseStudy.results}
          onChange={(e) => setPortfolioData({
            ...portfolioData,
            detailedCaseStudy: { ...portfolioData.detailedCaseStudy, results: e.target.value }
          })}
          placeholder="What were the outcomes? Metrics, feedback, impact..."
          rows={4}
          className={cn(commonStyles.textarea, themeStyles.textarea)}
        />
      </div>

      <div className={commonStyles.formGroup}>
        <label>Your Role</label>
        <textarea
          value={portfolioData.detailedCaseStudy.myRole}
          onChange={(e) => setPortfolioData({
            ...portfolioData,
            detailedCaseStudy: { ...portfolioData.detailedCaseStudy, myRole: e.target.value }
          })}
          placeholder="What was your specific contribution? Team collaboration?"
          rows={3}
          className={cn(commonStyles.textarea, themeStyles.textarea)}
        />
      </div>

      <div className={cn(commonStyles.infoBox, themeStyles.infoBox)}>
        <strong>💡 Pro Tip:</strong> A detailed case study helps clients understand your process and expertise, increasing your chances of getting hired.
      </div>
    </div>
  );

  // STEP 5: Preview & Publish
  const Step5Preview = () => (
    <div className={commonStyles.stepContent}>
      <div className={commonStyles.previewHeader}>
        <FaEye className={commonStyles.icon} />
        <h2>Preview & Publish</h2>
      </div>

      <div className={cn(commonStyles.previewCard, themeStyles.previewCard)}>
        {portfolioData.images.find(img => img.isCover) && (
          <img
            src={portfolioData.images.find(img => img.isCover)?.preview}
            alt="Cover"
            className={commonStyles.previewCover}
          />
        )}
        
        <div className={commonStyles.previewContent}>
          <h3>{portfolioData.title}</h3>
          <div className={commonStyles.previewMeta}>
            <span className={commonStyles.categoryBadge}>{portfolioData.category}</span>
            {portfolioData.projectDate && <span>📅 {portfolioData.projectDate}</span>}
            {portfolioData.clientName && <span>👤 {portfolioData.clientName}</span>}
          </div>
          
          <p className={commonStyles.previewDescription}>{portfolioData.shortDescription}</p>
          
          {portfolioData.technologies.length > 0 && (
            <div className={commonStyles.previewTech}>
              {portfolioData.technologies.map(tech => (
                <span key={tech} className={commonStyles.techBadge}>{tech}</span>
              ))}
            </div>
          )}

          {portfolioData.projectUrl && (
            <a href={portfolioData.projectUrl} target="_blank" rel="noopener noreferrer" className={commonStyles.previewLink}>
              🔗 View Live Project
            </a>
          )}
        </div>
      </div>

      <div className={commonStyles.settingsGrid}>
        <div className={cn(commonStyles.settingCard, themeStyles.settingCard)}>
          <label className={commonStyles.checkboxLabel}>
            <input
              type="checkbox"
              checked={portfolioData.featured}
              onChange={(e) => setPortfolioData({ ...portfolioData, featured: e.target.checked })}
            />
            <div>
              <strong>Featured Project</strong>
              <span>Highlight this on your profile</span>
            </div>
          </label>
        </div>

        <div className={cn(commonStyles.settingCard, themeStyles.settingCard)}>
          <label>Visibility</label>
          <select
            value={portfolioData.visibility}
            onChange={(e) => setPortfolioData({ ...portfolioData, visibility: e.target.value as any })}
            className={cn(commonStyles.select, themeStyles.select)}
            aria-label="Select portfolio visibility"
          >
            <option value="public">Public (visible to everyone)</option>
            <option value="private">Private (only you can see)</option>
          </select>
        </div>
      </div>

      <div className={cn(commonStyles.publishInfo, themeStyles.publishInfo)}>
        <h4>Ready to Publish?</h4>
        <p>This portfolio piece will be added to your profile and can be viewed by potential clients.</p>
      </div>
    </div>
  );

  const validateStep1 = async () => {
    if (!portfolioData.title || portfolioData.title.length < 5) {
      alert('Project title must be at least 5 characters');
      return false;
    }
    if (!portfolioData.category) {
      alert('Please select a category');
      return false;
    }
    if (!portfolioData.projectDate) {
      alert('Please select completion date');
      return false;
    }
    if (!portfolioData.shortDescription || portfolioData.shortDescription.length < 50) {
      alert('Short description must be at least 50 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = async () => {
    if (portfolioData.images.length === 0) {
      alert('Please upload at least one image');
      return false;
    }
    return true;
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('title', portfolioData.title);
      formData.append('category', portfolioData.category);
      formData.append('client_name', portfolioData.clientName);
      formData.append('project_date', portfolioData.projectDate);
      formData.append('project_url', portfolioData.projectUrl);
      formData.append('short_description', portfolioData.shortDescription);
      formData.append('technologies', JSON.stringify(portfolioData.technologies));
      formData.append('case_study', JSON.stringify(portfolioData.detailedCaseStudy));
      formData.append('featured', portfolioData.featured.toString());
      formData.append('visibility', portfolioData.visibility);

      portfolioData.images.forEach((image, index) => {
        formData.append(`image_${index}`, image.file);
        formData.append(`image_${index}_caption`, image.caption);
        formData.append(`image_${index}_is_cover`, image.isCover.toString());
      });

      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/portfolio/items', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        router.push('/freelancer/portfolio');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      id: 'details',
      title: 'Details',
      description: 'Project info',
      component: <Step1Details />,
      validate: validateStep1
    },
    {
      id: 'images',
      title: 'Images',
      description: 'Upload photos',
      component: <Step2Images />,
      validate: validateStep2
    },
    {
      id: 'technologies',
      title: 'Tech Stack',
      description: 'Technologies used',
      component: <Step3Technologies />
    },
    {
      id: 'case-study',
      title: 'Case Study',
      description: 'Detailed overview',
      component: <Step4CaseStudy />
    },
    {
      id: 'preview',
      title: 'Publish',
      description: 'Preview & publish',
      component: <Step5Preview />
    }
  ];

  return (
    <WizardContainer
      title="Add Portfolio Project"
      subtitle="Showcase your best work"
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onComplete={handleComplete}
      isLoading={isSubmitting}
      completeBtnText="Publish Portfolio Item"
    />
  );
}
