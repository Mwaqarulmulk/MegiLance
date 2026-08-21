// @AI-HINT: Single source of truth for platform pricing, status, verified capabilities, and AI tools registry.
// All pages and components MUST consume these constants rather than hardcoding fee numbers, claims, or status.

/**
 * Official Platform Status
 */
export const PLATFORM_STATUS = {
  STAGE: 'Early Access / Public Beta',
  LABEL: 'Public Beta',
  BADGE: 'Early Access',
  DESCRIPTION: 'MegiLance is currently in public beta, continuously expanding its talent network and AI productivity suite.',
} as const;

/**
 * Single Source of Truth for Platform Pricing & Fees
 */
export const PRICING_CONFIG = {
  // Official neutral statement for launch period
  LAUNCH_POLICY_NOTICE:
    'MegiLance is currently offering promotional platform pricing during its launch period. See the Pricing page for current fees and payment-related charges.',
  
  // Platform fee during promotional launch
  COMMISSION_RATE: 0, // 0% platform commission during promotional launch
  COMMISSION_LABEL: '0% Platform Fee (Launch Promotion)',
  CLIENT_SERVICE_FEE: 0, // 0% platform service fee during launch
  CLIENT_FEE_LABEL: '0% Platform Service Fee',
  
  // Standard third-party payment processor notice
  PAYMENT_PROCESSOR_NOTE:
    'MegiLance charges 0% platform commission during the launch promotion. Standard third-party payment gateway processing fees (such as Stripe card processing or blockchain network gas fees) apply directly from the respective payment providers.',
  
  // AI Tools availability
  AI_TOOLS_FEE: '100% Free to Use',
  AI_TOOLS_NOTICE: 'All 11 core AI tools can be used freely without requiring an account for your first results.',
  
  // Pricing tiers
  PLANS: [
    {
      id: 'free-launch',
      tier: '2026 Promotional Launch',
      description: 'Complete access to all marketplace features and AI tools with 0% platform commission during our launch.',
      price: '$0',
      pricePeriod: '/month (Free Launch)',
      status: 'Active for All Users',
      features: [
        '0% client platform service fee',
        '0% freelancer commission on earnings',
        'Unlimited access to all 11 AI freelance tools',
        'Milestone-based escrow payment safety',
        'Real-time workrooms, chat & file sharing',
        'Saved AI tool calculation history & export',
        'Verified skill badge eligibility',
      ],
      ctaText: 'Get Started Free',
      ctaLink: '/signup',
      isPopular: true,
    },
    {
      id: 'enterprise',
      tier: 'Enterprise & Teams',
      description: 'Custom talent sourcing, compliance workflows, and dedicated account support for companies and agencies.',
      price: 'Custom',
      pricePeriod: '',
      status: 'Available On Request',
      features: [
        'Everything in 2026 Promotional Launch',
        'Dedicated talent sourcing assistance',
        'Standard NDA & custom IP transfer agreements',
        'Shared team billing & consolidated invoices',
        'Custom payment routing & escrow SLAs',
        'Priority 24/7 dedicated support',
      ],
      ctaText: 'Contact Enterprise Team',
      ctaLink: '/contact?plan=enterprise',
      isPopular: false,
    },
  ],

  // Comparison items
  COMPARISON_ROWS: [
    { name: 'Access to All 11 Free AI Tools', free: true, pro: true, enterprise: true },
    { name: 'Post & Apply to Projects', free: true, pro: true, enterprise: true },
    { name: 'Milestone Escrow Protection', free: true, pro: true, enterprise: true },
    { name: 'Direct Collaboration Workrooms', free: true, pro: true, enterprise: true },
    { name: 'Saved AI Tool History & PDF Export', free: 'Basic', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Verified Profile Badge Eligibility', free: true, pro: true, enterprise: true },
    { name: 'Regional Market Rate Analytics', free: true, pro: true, enterprise: true },
    { name: 'Platform Commission (Launch)', free: '0%', pro: '0%', enterprise: '0%' },
    { name: 'Dedicated Talent Sourcing Support', free: false, pro: false, enterprise: true },
    { name: 'Custom Contracts & Team Billing', free: false, pro: false, enterprise: true },
  ],
} as const;

/**
 * Factual, Verified Platform Statistics & Capabilities
 * Never invent unverified customer numbers or mock escrow volumes.
 */
export const PLATFORM_FACTS = {
  AI_TOOLS_COUNT: 16,
  COUNTRIES_SUPPORTED: '70+',
  SERVICE_CATEGORIES_COUNT: 10,
  SERVICE_TYPES_COUNT: '100+',
  MATCHING_FACTORS_COUNT: 7,
  ARCHITECTURE: 'FastAPI Microservices + Turso Edge SQL + Next.js 16',
} as const;

/**
 * Core AI Tools Registry with Canonical URLs, Descriptions, and Funnel CTAs
 */
export const AI_TOOLS_REGISTRY = [
  {
    id: 'price-estimator',
    name: 'AI Price Estimator',
    category: 'Price & Rates',
    slug: 'price-estimator',
    href: '/ai/price-estimator',
    shortDescription: 'Estimate realistic project budgets and delivery timelines based on category, complexity, and regional market rates.',
    fullDescription: 'Calculate data-driven cost ranges for web development, design, marketing, content, and engineering projects using regional benchmarks and project scope parameters.',
    badge: 'Popular',
    icon: 'DollarSign',
    conversionCTA: {
      clientHeading: 'Want to hire within this budget?',
      clientSubtext: 'Find freelancers matching your scope and estimated budget.',
      primaryActionLabel: 'Find Matching Freelancers',
      primaryActionHref: '/talent',
      secondaryActionLabel: 'Save & Create Project',
      secondaryActionHref: '/create-project',
    },
    methodologySummary: 'Combines baseline hourly rates across 10 industry categories with experience multipliers, scope complexity points, and country PPP indices.',
    faqs: [
      {
        question: 'How accurate is the AI Price Estimator?',
        answer: 'The price estimator generates benchmark ranges based on global freelance market data across 100+ specialties. It serves as a budgeting guide for clients and freelancers rather than a fixed commercial quote.',
      },
      {
        question: 'Do I need an account to estimate a project price?',
        answer: 'No. You can calculate project estimates immediately as a guest. Creating an account allows you to save calculations, export PDF breakdowns, or turn the estimate directly into a marketplace project.',
      },
      {
        question: 'What factors influence the estimated price?',
        answer: 'Key variables include the primary service category, specific deliverables, estimated hours, experience tier, delivery urgency, quality tier, and client/freelancer location.',
      },
    ],
  },
  {
    id: 'proposal-writer',
    name: 'AI Proposal Writer',
    category: 'Proposals',
    slug: 'proposal-writer',
    href: '/ai/proposal-writer',
    shortDescription: 'Generate tailored, persuasive freelance proposals with structured deliverables, pricing rationale, and timeline estimates.',
    fullDescription: 'Craft tailored proposals addressing client requirements, outlining clear milestones, and justifying competitive rates based on project scope.',
    badge: 'High Conversion',
    icon: 'FileText',
    conversionCTA: {
      clientHeading: 'Your proposal is ready.',
      clientSubtext: 'Save it to your MegiLance profile and discover projects matching your skills.',
      primaryActionLabel: 'Find Matching Projects',
      primaryActionHref: '/explore',
      secondaryActionLabel: 'Create Freelancer Profile',
      secondaryActionHref: '/signup?role=freelancer',
    },
    methodologySummary: 'Analyzes client problem statements, matches required technical skills, and formats persuasive proposals with clear deliverables and milestones.',
    faqs: [
      {
        question: 'Does the AI write unique proposals for each job?',
        answer: 'Yes. The proposal generator tailors the cover letter, deliverable schedule, and value proposition to the specific job title, description, and client requirements provided.',
      },
      {
        question: 'Can I edit the generated proposal before submitting?',
        answer: 'Yes. All generated sections (hook, methodology, milestones, timeline, and closing) can be reviewed, edited, copied, or downloaded directly.',
      },
    ],
  },
  {
    id: 'scope-planner',
    name: 'Project Scope Planner',
    category: 'Project Planning',
    slug: 'scope-planner',
    href: '/ai/scope-planner',
    shortDescription: 'Break complex project ideas into structured milestones, actionable deliverables, timeline estimates, and risk checkpoints.',
    fullDescription: 'Turn high-level requirements into clear work breakdown structures (WBS), milestone schedules, and risk mitigation strategies.',
    badge: 'Essential',
    icon: 'Layers',
    conversionCTA: {
      clientHeading: 'Turn this scope into a real project.',
      clientSubtext: 'Create a project from these milestones and find matching talent.',
      primaryActionLabel: 'Create Project',
      primaryActionHref: '/create-project',
      secondaryActionLabel: 'Browse Available Talent',
      secondaryActionHref: '/talent',
    },
    methodologySummary: 'Deconstructs project briefs into sequential execution phases, estimating hours per deliverable and highlighting common scope risk areas.',
    faqs: [
      {
        question: 'How does milestone planning protect both clients and freelancers?',
        answer: 'Clear milestones provide defined acceptance criteria before funds in escrow are released, ensuring alignment on progress and deliverables at every stage.',
      },
    ],
  },
  {
    id: 'rate-advisor',
    name: 'Freelance Rate Advisor',
    category: 'Price & Rates',
    slug: 'rate-advisor',
    href: '/ai/rate-advisor',
    shortDescription: 'Calculate competitive hourly and project rates based on your skillset, experience level, cost of living, and target annual income.',
    fullDescription: 'Determine healthy hourly and fixed-price billing rates that account for billable hours, non-billable overhead, taxes, and regional market standards.',
    badge: 'Career Tool',
    icon: 'TrendingUp',
    conversionCTA: {
      clientHeading: 'Use your recommended rate in the marketplace.',
      clientSubtext: 'Publish your verified rate on your profile to attract relevant clients.',
      primaryActionLabel: 'Create Freelancer Profile',
      primaryActionHref: '/signup?role=freelancer',
      secondaryActionLabel: 'Explore Open Jobs',
      secondaryActionHref: '/explore',
    },
    methodologySummary: 'Calculates sustainable hourly rates by working backward from net target income, tax liabilities, business overhead, and billable utilization ratios.',
    faqs: [
      {
        question: 'How are rate recommendations determined?',
        answer: 'The rate advisor combines your target income, working hours, business expenses, and local tax assumptions with live market averages for your discipline and location.',
      },
    ],
  },
  {
    id: 'fraud-check',
    name: 'Freelance Risk & Scam Checker',
    category: 'Safety',
    slug: 'fraud-check',
    href: '/ai/fraud-check',
    shortDescription: 'Scan job posts, client messages, and payment requests for scam indicators, suspicious off-platform requests, and fraud patterns.',
    fullDescription: 'Identify red flags in client communications such as requests for free test work, suspicious payment checks, or off-platform payment schemes.',
    badge: 'Safety',
    icon: 'Shield',
    conversionCTA: {
      clientHeading: 'Keep your freelance work secure.',
      clientSubtext: 'All MegiLance contracts include milestone escrow protection and secure messaging.',
      primaryActionLabel: 'Learn About Platform Safety',
      primaryActionHref: '/trust',
      secondaryActionLabel: 'Browse Verified Projects',
      secondaryActionHref: '/explore',
    },
    methodologySummary: 'Evaluates text against established heuristic patterns of freelance scams, off-platform payment solicitations, and deceptive project postings.',
    faqs: [
      {
        question: 'What are common red flags detected by the tool?',
        answer: 'Common patterns include requests for off-platform communication (e.g. Telegram/WhatsApp), requests for security deposits, unverified check payments, and unrealistic pay for generic tasks.',
      },
    ],
  },
  {
    id: 'skill-analyzer',
    name: 'Skill Analyzer & Market Matcher',
    category: 'Career Growth',
    slug: 'skill-analyzer',
    href: '/ai/skill-analyzer',
    shortDescription: 'Analyze your technical and creative skill combinations against real marketplace demand and discover high-value upskilling opportunities.',
    fullDescription: 'Evaluate your skillset against current freelance market demand, identifying complementary skills that command higher market compensation.',
    badge: 'Growth',
    icon: 'Brain',
    conversionCTA: {
      clientHeading: 'Showcase your skills to active clients.',
      clientSubtext: 'Create your profile to receive algorithmic project recommendations matching your stack.',
      primaryActionLabel: 'Build Freelancer Profile',
      primaryActionHref: '/signup?role=freelancer',
      secondaryActionLabel: 'Explore In-Demand Skills',
      secondaryActionHref: '/categories',
    },
    methodologySummary: 'Cross-references entered skill sets against market job requirements to identify skill adjacency, demand velocity, and rate correlations.',
    faqs: [
      {
        question: 'How does skill analysis help me earn more?',
        answer: 'By identifying complementary skills in high demand (e.g., combining Next.js with AI API integration), you can position yourself for higher-budget projects.',
      },
    ],
  },
] as const;

/**
 * Standard Centralized Platform FAQs
 */
export const PLATFORM_FAQS = [
  {
    question: 'What is MegiLance?',
    answer:
      'MegiLance is an AI-assisted freelance platform offering free tools for project pricing, proposals, rate calculation, project planning, and freelance safety, alongside a marketplace for hiring freelancers and finding freelance work.',
  },
  {
    question: 'Do I need an account to use MegiLance AI tools?',
    answer:
      'No. Core AI tools can be used immediately before creating an account. Creating an account unlocks features such as saved calculation history, verified marketplace profiles, project posting, and milestone collaboration.',
  },
  {
    question: 'How do fees and pricing work on MegiLance?',
    answer:
      'MegiLance is currently offering promotional platform pricing during its launch period with 0% platform commission on completed contracts. Standard third-party payment processor fees (such as Stripe or crypto network fees) apply directly from the payment providers.',
  },
  {
    question: 'Are MegiLance AI recommendations guaranteed?',
    answer:
      'No. AI-generated pricing, proposals, matching, and risk assessments are decision-support tools designed to guide planning. They should be reviewed by users before making financial, legal, or hiring commitments.',
  },
  {
    question: 'How does payment and escrow protection work?',
    answer:
      'Clients fund project milestones in advance, and funds are held securely in escrow. When the freelancer completes and submits the milestone deliverable, the client reviews the work and approves release of the payment. If issues arise, our dispute mediation process assists in fair resolution.',
  },
  {
    question: 'How does AI talent matching work?',
    answer:
      'Our multi-factor matching system evaluates skill alignment, project requirements, budget compatibility, verified experience, and responsiveness to suggest relevant freelancers to clients and relevant projects to freelancers.',
  },
] as const;
