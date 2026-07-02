import { CategoriesData } from './PriceEstimatorPro';

export const DEFAULT_CATEGORIES_DATA: CategoriesData = {
  categories: [
    {
      key: 'software_development',
      label: 'Software Development',
      description: 'Web, mobile & backend engineering',
      services: [
        { key: 'web_application', label: 'Web Application', avg_rate: '$45–117/hr', demand: 'Very High' },
        { key: 'website', label: 'Website / Landing', avg_rate: '$31–81/hr', demand: 'High' },
        { key: 'mobile_app', label: 'Mobile App', avg_rate: '$49–126/hr', demand: 'Very High' },
        { key: 'api_backend', label: 'API / Backend', avg_rate: '$47–122/hr', demand: 'High' },
        { key: 'ecommerce', label: 'E-commerce Store', avg_rate: '$42–108/hr', demand: 'High' }
      ]
    },
    {
      key: 'ai_ml',
      label: 'AI & Machine Learning',
      description: 'Models, LLMs, data pipelines',
      services: [
        { key: 'ml_model', label: 'ML Model / Pipeline', avg_rate: '$70–180/hr', demand: 'Very High' },
        { key: 'llm_integration', label: 'LLM / GenAI Integration', avg_rate: '$77–198/hr', demand: 'Very High' },
        { key: 'data_analysis', label: 'Data Analysis', avg_rate: '$49–126/hr', demand: 'High' },
        { key: 'computer_vision', label: 'Computer Vision', avg_rate: '$73–189/hr', demand: 'High' }
      ]
    },
    {
      key: 'design',
      label: 'Design & Creative',
      description: 'UI/UX, branding, graphics',
      services: [
        { key: 'ui_ux', label: 'UI/UX Design', avg_rate: '$38–99/hr', demand: 'Very High' },
        { key: 'branding', label: 'Brand Identity', avg_rate: '$35–90/hr', demand: 'High' },
        { key: 'graphic_design', label: 'Graphic Design', avg_rate: '$28–72/hr', demand: 'Medium' },
        { key: 'design_system', label: 'Design System', avg_rate: '$45–117/hr', demand: 'High' }
      ]
    },
    {
      key: 'data',
      label: 'Data & Analytics',
      description: 'BI, dashboards, engineering',
      services: [
        { key: 'dashboard', label: 'Analytics Dashboard', avg_rate: '$49–126/hr', demand: 'High' },
        { key: 'data_engineering', label: 'Data Engineering', avg_rate: '$59–153/hr', demand: 'High' },
        { key: 'data_viz', label: 'Data Visualization', avg_rate: '$42–108/hr', demand: 'Medium' }
      ]
    },
    {
      key: 'devops',
      label: 'DevOps & Cloud',
      description: 'Infra, CI/CD, reliability',
      services: [
        { key: 'cloud_setup', label: 'Cloud Architecture', avg_rate: '$66–171/hr', demand: 'Very High' },
        { key: 'cicd', label: 'CI/CD Pipeline', avg_rate: '$59–153/hr', demand: 'High' },
        { key: 'k8s', label: 'Kubernetes / Containers', avg_rate: '$70–180/hr', demand: 'High' }
      ]
    },
    {
      key: 'marketing',
      label: 'Marketing & Growth',
      description: 'SEO, ads, growth',
      services: [
        { key: 'seo', label: 'SEO Strategy', avg_rate: '$31–81/hr', demand: 'High' },
        { key: 'paid_ads', label: 'Paid Ads Management', avg_rate: '$35–90/hr', demand: 'High' },
        { key: 'growth', label: 'Growth Strategy', avg_rate: '$45–117/hr', demand: 'Medium' }
      ]
    },
    {
      key: 'writing',
      label: 'Writing & Content',
      description: 'Copy, technical & content',
      services: [
        { key: 'content_writing', label: 'Content Writing', avg_rate: '$21–54/hr', demand: 'High' },
        { key: 'copywriting', label: 'Copywriting', avg_rate: '$28–72/hr', demand: 'High' },
        { key: 'technical_writing', label: 'Technical Writing', avg_rate: '$35–90/hr', demand: 'Medium' }
      ]
    },
    {
      key: 'video',
      label: 'Video & Animation',
      description: 'Editing, motion, 3D',
      services: [
        { key: 'video_editing', label: 'Video Editing', avg_rate: '$28–72/hr', demand: 'High' },
        { key: 'motion_graphics', label: 'Motion Graphics', avg_rate: '$38–99/hr', demand: 'Medium' },
        { key: 'animation_3d', label: '3D Animation', avg_rate: '$49–126/hr', demand: 'Medium' }
      ]
    },
    {
      key: 'blockchain',
      label: 'Blockchain & Web3',
      description: 'Smart contracts, dApps',
      services: [
        { key: 'smart_contract', label: 'Smart Contracts', avg_rate: '$91–234/hr', demand: 'High' },
        { key: 'dapp', label: 'dApp Development', avg_rate: '$84–216/hr', demand: 'Medium' },
        { key: 'tokenomics', label: 'Tokenomics / Audit', avg_rate: '$98–252/hr', demand: 'Medium' }
      ]
    },
    {
      key: 'consulting',
      label: 'Consulting & Strategy',
      description: 'Product, technical, business',
      services: [
        { key: 'product_strategy', label: 'Product Strategy', avg_rate: '$63–162/hr', demand: 'Medium' },
        { key: 'technical_audit', label: 'Technical Audit', avg_rate: '$66–171/hr', demand: 'Medium' },
        { key: 'business_consulting', label: 'Business Consulting', avg_rate: '$59–153/hr', demand: 'Medium' }
      ]
    }
  ],
  experience_levels: ['entry', 'intermediate', 'expert', 'specialist'],
  regions: [
    {
      key: 'north_america',
      label: 'North America',
      icon: '🇺🇸',
      multiplier: 1.0,
      countries: [
        { code: 'US', name: 'United States', flag: '🇺🇸', rate_multiplier: 1.0, client_budget_multiplier: 1.0, currency: 'USD', cost_of_living: 100 },
        { code: 'CA', name: 'Canada', flag: '🇨🇦', rate_multiplier: 0.88, client_budget_multiplier: 0.9, currency: 'CAD', cost_of_living: 88 }
      ]
    },
    {
      key: 'europe',
      label: 'Europe',
      icon: '🇪🇺',
      multiplier: 0.88,
      countries: [
        { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', rate_multiplier: 0.92, client_budget_multiplier: 0.95, currency: 'GBP', cost_of_living: 90 },
        { code: 'DE', name: 'Germany', flag: '🇩🇪', rate_multiplier: 0.9, client_budget_multiplier: 0.92, currency: 'EUR', cost_of_living: 85 },
        { code: 'UA', name: 'Ukraine', flag: '🇺🇦', rate_multiplier: 0.5, client_budget_multiplier: 0.55, currency: 'UAH', cost_of_living: 35 }
      ]
    },
    {
      key: 'oceania',
      label: 'Oceania',
      icon: '🇦🇺',
      multiplier: 0.9,
      countries: [
        { code: 'AU', name: 'Australia', flag: '🇦🇺', rate_multiplier: 0.9, client_budget_multiplier: 0.93, currency: 'AUD', cost_of_living: 92 }
      ]
    },
    {
      key: 'middle_east',
      label: 'Middle East',
      icon: '🐪',
      multiplier: 0.82,
      countries: [
        { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', rate_multiplier: 0.85, client_budget_multiplier: 0.95, currency: 'AED', cost_of_living: 78 }
      ]
    },
    {
      key: 'south_asia',
      label: 'South Asia',
      icon: '🇮🇳',
      multiplier: 0.42,
      countries: [
        { code: 'IN', name: 'India', flag: '🇮🇳', rate_multiplier: 0.45, client_budget_multiplier: 0.5, currency: 'INR', cost_of_living: 30 },
        { code: 'PK', name: 'Pakistan', flag: '🇵🇰', rate_multiplier: 0.4, client_budget_multiplier: 0.45, currency: 'PKR', cost_of_living: 26 }
      ]
    },
    {
      key: 'southeast_asia',
      label: 'Southeast Asia',
      icon: '🌴',
      multiplier: 0.45,
      countries: [
        { code: 'PH', name: 'Philippines', flag: '🇵🇭', rate_multiplier: 0.42, client_budget_multiplier: 0.48, currency: 'PHP', cost_of_living: 35 }
      ]
    },
    {
      key: 'south_america',
      label: 'Latin America',
      icon: '🌎',
      multiplier: 0.52,
      countries: [
        { code: 'BR', name: 'Brazil', flag: '🇧🇷', rate_multiplier: 0.5, client_budget_multiplier: 0.55, currency: 'BRL', cost_of_living: 42 }
      ]
    },
    {
      key: 'africa',
      label: 'Africa',
      icon: '🌍',
      multiplier: 0.4,
      countries: [
        { code: 'NG', name: 'Nigeria', flag: '🇳🇬', rate_multiplier: 0.38, client_budget_multiplier: 0.42, currency: 'NGN', cost_of_living: 28 }
      ]
    },
    {
      key: 'global_remote',
      label: 'Global / Remote',
      icon: '🌐',
      multiplier: 0.85,
      countries: []
    }
  ],
  countries: [
    { code: 'US', name: 'United States', region: 'north_america', flag: '🇺🇸', rate_multiplier: 1.0, client_budget_multiplier: 1.0, currency: 'USD', ppp_index: 1.0, cost_of_living: 100 },
    { code: 'CA', name: 'Canada', region: 'north_america', flag: '🇨🇦', rate_multiplier: 0.88, client_budget_multiplier: 0.9, currency: 'CAD', ppp_index: 0.84, cost_of_living: 88 },
    { code: 'GB', name: 'United Kingdom', region: 'europe', flag: '🇬🇧', rate_multiplier: 0.92, client_budget_multiplier: 0.95, currency: 'GBP', ppp_index: 0.72, cost_of_living: 90 },
    { code: 'DE', name: 'Germany', region: 'europe', flag: '🇩🇪', rate_multiplier: 0.9, client_budget_multiplier: 0.92, currency: 'EUR', ppp_index: 0.75, cost_of_living: 85 },
    { code: 'AU', name: 'Australia', region: 'oceania', flag: '🇦🇺', rate_multiplier: 0.9, client_budget_multiplier: 0.93, currency: 'AUD', ppp_index: 0.68, cost_of_living: 92 },
    { code: 'AE', name: 'United Arab Emirates', region: 'middle_east', flag: '🇦🇪', rate_multiplier: 0.85, client_budget_multiplier: 0.95, currency: 'AED', ppp_index: 0.6, cost_of_living: 78 },
    { code: 'IN', name: 'India', region: 'south_asia', flag: '🇮🇳', rate_multiplier: 0.45, client_budget_multiplier: 0.5, currency: 'INR', ppp_index: 0.27, cost_of_living: 30 },
    { code: 'PK', name: 'Pakistan', region: 'south_asia', flag: '🇵🇰', rate_multiplier: 0.4, client_budget_multiplier: 0.45, currency: 'PKR', ppp_index: 0.25, cost_of_living: 26 },
    { code: 'PH', name: 'Philippines', region: 'southeast_asia', flag: '🇵🇭', rate_multiplier: 0.42, client_budget_multiplier: 0.48, currency: 'PHP', ppp_index: 0.32, cost_of_living: 35 },
    { code: 'BR', name: 'Brazil', region: 'south_america', flag: '🇧🇷', rate_multiplier: 0.5, client_budget_multiplier: 0.55, currency: 'BRL', ppp_index: 0.36, cost_of_living: 42 },
    { code: 'UA', name: 'Ukraine', region: 'europe', flag: '🇺🇦', rate_multiplier: 0.5, client_budget_multiplier: 0.55, currency: 'UAH', ppp_index: 0.3, cost_of_living: 35 },
    { code: 'NG', name: 'Nigeria', region: 'africa', flag: '🇳🇬', rate_multiplier: 0.38, client_budget_multiplier: 0.42, currency: 'NGN', ppp_index: 0.22, cost_of_living: 28 }
  ],
  urgency_options: ['flexible', 'standard', 'urgent', 'rush'],
  quality_tiers: ['budget', 'standard', 'premium', 'enterprise'],
  scope_options: ['small', 'medium', 'large', 'enterprise']
};
