import { QuestionGroup } from '../types/questionnaire';

export const questionGroups: QuestionGroup[] = [
  {
    id: 'basics',
    title: 'Getting Started',
    description: 'Let\'s start with some basic information about your business and project.',
    questions: [
      {
        id: 'company',
        type: 'text',
        question: 'What is your company name?',
        placeholder: 'e.g., Acme Corporation',
        required: true,
        errorMessage: 'Please enter your company name'
      },
      {
        id: 'website',
        type: 'text',
        question: 'What is your current website URL (if any)?',
        placeholder: 'e.g., https://www.example.com',
        required: false
      },
      {
        id: 'industry',
        type: 'select',
        question: 'What industry are you in?',
        required: true,
        options: [
          { value: 'ecommerce', label: 'E-commerce' },
          { value: 'b2b', label: 'B2B Services' },
          { value: 'b2c', label: 'B2C Services' },
          { value: 'saas', label: 'SaaS / Technology' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'finance', label: 'Finance / Banking' },
          { value: 'education', label: 'Education' },
          { value: 'nonprofit', label: 'Non-profit' },
          { value: 'real-estate', label: 'Real Estate' },
          { value: 'hospitality', label: 'Hospitality / Travel' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'other', label: 'Other' }
        ],
        errorMessage: 'Please select your industry'
      },
      {
        id: 'industryOther',
        type: 'text',
        question: 'Please specify your industry',
        placeholder: 'e.g., Aerospace Manufacturing',
        required: false
      },
      {
        id: 'companySize',
        type: 'radio',
        question: 'What is the size of your company?',
        required: true,
        options: [
          { value: 'solo', label: 'Solo Entrepreneur' },
          { value: 'small', label: 'Small (2-10 employees)' },
          { value: 'medium', label: 'Medium (11-50 employees)' },
          { value: 'large', label: 'Large (51-200 employees)' },
          { value: 'enterprise', label: 'Enterprise (201+ employees)' }
        ],
        errorMessage: 'Please select your company size'
      }
    ]
  },
  {
    id: 'project',
    title: 'Project Goals',
    description: 'Tell us about your specific project goals and objectives.',
    questions: [
      {
        id: 'projectType',
        type: 'multiselect',
        question: 'What type of digital marketing services are you interested in?',
        required: true,
        options: [
          { value: 'seo', label: 'Search Engine Optimization (SEO)' },
          { value: 'ppc', label: 'Pay-Per-Click Advertising (PPC)' },
          { value: 'social', label: 'Social Media Marketing' },
          { value: 'content', label: 'Content Marketing' },
          { value: 'email', label: 'Email Marketing' },
          { value: 'web', label: 'Web Design & Development' },
          { value: 'analytics', label: 'Analytics & Reporting' },
          { value: 'cro', label: 'Conversion Rate Optimization' }
        ],
        errorMessage: 'Please select at least one service you\'re interested in'
      },
      {
        id: 'primaryGoal',
        type: 'select',
        question: 'What is your primary business goal?',
        required: true,
        options: [
          { value: 'brand', label: 'Increase Brand Awareness' },
          { value: 'leads', label: 'Generate More Leads' },
          { value: 'sales', label: 'Increase Sales/Revenue' },
          { value: 'retention', label: 'Improve Customer Retention' },
          { value: 'engagement', label: 'Boost Customer Engagement' },
          { value: 'traffic', label: 'Drive More Website Traffic' },
          { value: 'authority', label: 'Establish Industry Authority' },
          { value: 'other', label: 'Other' }
        ],
        errorMessage: 'Please select your primary business goal'
      },
      {
        id: 'goalOther',
        type: 'text',
        question: 'Please specify your primary business goal',
        placeholder: 'e.g., Enter new market segment',
        required: false
      },
      {
        id: 'timeline',
        type: 'radio',
        question: 'What is your expected timeline for this project?',
        required: true,
        options: [
          { value: 'immediate', label: 'Immediate (ASAP)' },
          { value: 'month', label: 'Within 1 month' },
          { value: 'quarter', label: 'Within 3 months' },
          { value: 'sixmonths', label: 'Within 6 months' },
          { value: 'year', label: 'Within a year' },
          { value: 'flexible', label: 'Flexible / Not sure yet' }
        ],
        errorMessage: 'Please select your expected timeline'
      },
      {
        id: 'budget',
        type: 'select',
        question: 'What is your approximate monthly budget for digital marketing?',
        required: true,
        options: [
          { value: 'under1k', label: 'Under $1,000' },
          { value: '1k-3k', label: '$1,000 - $3,000' },
          { value: '3k-5k', label: '$3,000 - $5,000' },
          { value: '5k-10k', label: '$5,000 - $10,000' },
          { value: '10k-20k', label: '$10,000 - $20,000' },
          { value: 'over20k', label: 'Over $20,000' },
          { value: 'notdecided', label: 'Not decided yet' }
        ],
        errorMessage: 'Please select your approximate budget'
      }
    ]
  },
  {
    id: 'audience',
    title: 'Target Audience',
    description: 'Help us understand who your ideal customers are.',
    questions: [
      {
        id: 'targetAudience',
        type: 'textarea',
        question: 'Describe your ideal customer or target audience',
        placeholder: 'e.g., Small business owners aged 35-50 in the healthcare industry who are looking to improve their online presence',
        required: true,
        errorMessage: 'Please describe your target audience'
      },
      {
        id: 'geographicFocus',
        type: 'multiselect',
        question: 'What is your geographic focus?',
        required: true,
        options: [
          { value: 'local', label: 'Local (specific city or region)' },
          { value: 'state', label: 'State/Provincial' },
          { value: 'national', label: 'National' },
          { value: 'international', label: 'International' },
          { value: 'global', label: 'Global' }
        ],
        errorMessage: 'Please select your geographic focus'
      },
      {
        id: 'specificLocations',
        type: 'textarea',
        question: 'If you selected specific geographic areas, please list them',
        placeholder: 'e.g., Greater Boston area, New York City, Los Angeles County',
        required: false
      },
      {
        id: 'audienceAge',
        type: 'multiselect',
        question: 'What age groups are you targeting?',
        required: true,
        options: [
          { value: 'under18', label: 'Under 18' },
          { value: '18-24', label: '18-24' },
          { value: '25-34', label: '25-34' },
          { value: '35-44', label: '35-44' },
          { value: '45-54', label: '45-54' },
          { value: '55-64', label: '55-64' },
          { value: '65plus', label: '65+' },
          { value: 'all', label: 'All age groups' }
        ],
        errorMessage: 'Please select your target age groups'
      },
      {
        id: 'painPoints',
        type: 'textarea',
        question: 'What are the main pain points or challenges your customers face?',
        placeholder: 'e.g., Difficulty finding reliable service providers, lack of technical knowledge, budget constraints',
        required: true,
        errorMessage: 'Please describe your customers\' pain points'
      }
    ]
  },
  {
    id: 'competition',
    title: 'Competitive Landscape',
    description: 'Let\'s understand your competition and market position.',
    questions: [
      {
        id: 'topCompetitors',
        type: 'textarea',
        question: 'Who are your top 3-5 competitors? (Include their websites if possible)',
        placeholder: 'e.g., Competitor A (www.competitora.com), Competitor B (www.competitorb.com)',
        required: true,
        errorMessage: 'Please list your top competitors'
      },
      {
        id: 'competitiveAdvantage',
        type: 'textarea',
        question: 'What is your unique selling proposition or competitive advantage?',
        placeholder: 'e.g., Proprietary technology, superior customer service, specialized expertise in a niche area',
        required: true,
        errorMessage: 'Please describe your competitive advantage'
      },
      {
        id: 'marketPosition',
        type: 'radio',
        question: 'How would you describe your current market position?',
        required: true,
        options: [
          { value: 'leader', label: 'Market Leader' },
          { value: 'challenger', label: 'Challenger Brand' },
          { value: 'niche', label: 'Niche Specialist' },
          { value: 'new', label: 'New Entrant' },
          { value: 'disruptor', label: 'Industry Disruptor' },
          { value: 'unsure', label: 'Not Sure' }
        ],
        errorMessage: 'Please select your market position'
      },
      {
        id: 'competitorStrengths',
        type: 'textarea',
        question: 'What do your competitors do well that you admire or want to improve upon?',
        placeholder: 'e.g., Strong social media presence, excellent content marketing, effective SEO strategy',
        required: false
      }
    ]
  },
  {
    id: 'current',
    title: 'Current Marketing Efforts',
    description: 'Tell us about your existing marketing strategies and channels.',
    questions: [
      {
        id: 'currentChannels',
        type: 'multiselect',
        question: 'Which marketing channels are you currently using?',
        required: true,
        options: [
          { value: 'seo', label: 'SEO / Organic Search' },
          { value: 'ppc', label: 'Paid Search (Google Ads, Bing Ads)' },
          { value: 'social', label: 'Social Media Marketing' },
          { value: 'email', label: 'Email Marketing' },
          { value: 'content', label: 'Content Marketing / Blogging' },
          { value: 'video', label: 'Video Marketing' },
          { value: 'influencer', label: 'Influencer Marketing' },
          { value: 'traditional', label: 'Traditional Advertising (TV, Radio, Print)' },
          { value: 'events', label: 'Events / Trade Shows' },
          { value: 'pr', label: 'PR / Media Relations' },
          { value: 'affiliate', label: 'Affiliate Marketing' },
          { value: 'none', label: 'None / Just getting started' }
        ],
        errorMessage: 'Please select your current marketing channels'
      },
      {
        id: 'socialPlatforms',
        type: 'multiselect',
        question: 'Which social media platforms do you actively use for business?',
        required: false,
        options: [
          { value: 'facebook', label: 'Facebook' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'twitter', label: 'Twitter / X' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'pinterest', label: 'Pinterest' },
          { value: 'reddit', label: 'Reddit' },
          { value: 'snapchat', label: 'Snapchat' },
          { value: 'other', label: 'Other' },
          { value: 'none', label: 'None' }
        ]
      },
      {
        id: 'marketingChallenges',
        type: 'textarea',
        question: 'What challenges or limitations have you faced with your current marketing efforts?',
        placeholder: 'e.g., Limited budget, lack of expertise, difficulty measuring ROI, inconsistent results',
        required: true,
        errorMessage: 'Please describe your marketing challenges'
      },
      {
        id: 'successMetrics',
        type: 'textarea',
        question: 'How do you currently measure marketing success? What KPIs or metrics do you track?',
        placeholder: 'e.g., Website traffic, conversion rate, cost per acquisition, social media engagement',
        required: false
      }
    ]
  },
  {
    id: 'website',
    title: 'Website & Digital Assets',
    description: 'Let\'s discuss your current website and digital presence.',
    questions: [
      {
        id: 'websiteAge',
        type: 'radio',
        question: 'How old is your current website?',
        required: false,
        options: [
          { value: 'new', label: 'Brand new / In development' },
          { value: 'under1', label: 'Less than 1 year' },
          { value: '1-2', label: '1-2 years' },
          { value: '3-5', label: '3-5 years' },
          { value: 'over5', label: 'Over 5 years' },
          { value: 'none', label: 'Don\'t have a website yet' }
        ]
      },
      {
        id: 'websitePlatform',
        type: 'select',
        question: 'What platform is your website built on?',
        required: false,
        options: [
          { value: 'wordpress', label: 'WordPress' },
          { value: 'shopify', label: 'Shopify' },
          { value: 'wix', label: 'Wix' },
          { value: 'squarespace', label: 'Squarespace' },
          { value: 'webflow', label: 'Webflow' },
          { value: 'custom', label: 'Custom-built' },
          { value: 'other', label: 'Other' },
          { value: 'unknown', label: 'Not sure' },
          { value: 'none', label: 'Don\'t have a website yet' }
        ]
      },
      {
        id: 'websiteIssues',
        type: 'multiselect',
        question: 'What issues (if any) do you have with your current website?',
        required: false,
        options: [
          { value: 'outdated', label: 'Outdated design' },
          { value: 'slow', label: 'Slow loading speed' },
          { value: 'mobile', label: 'Not mobile-friendly' },
          { value: 'navigation', label: 'Poor navigation/UX' },
          { value: 'content', label: 'Outdated or thin content' },
          { value: 'conversion', label: 'Low conversion rate' },
          { value: 'seo', label: 'Poor SEO performance' },
          { value: 'security', label: 'Security concerns' },
          { value: 'management', label: 'Difficult to update/manage' },
          { value: 'none', label: 'No issues' }
        ]
      },
      {
        id: 'analytics',
        type: 'multiselect',
        question: 'Which analytics or tracking tools do you currently use?',
        required: false,
        options: [
          { value: 'ga4', label: 'Google Analytics 4' },
          { value: 'ga', label: 'Universal Analytics (older Google Analytics)' },
          { value: 'gtm', label: 'Google Tag Manager' },
          { value: 'search-console', label: 'Google Search Console' },
          { value: 'hotjar', label: 'Hotjar' },
          { value: 'meta-pixel', label: 'Meta Pixel (Facebook Pixel)' },
          { value: 'linkedin', label: 'LinkedIn Insight Tag' },
          { value: 'other', label: 'Other analytics tools' },
          { value: 'none', label: 'None / Not sure' }
        ]
      }
    ]
  },
  {
    id: 'content',
    title: 'Content & Branding',
    description: 'Tell us about your content strategy and brand identity.',
    questions: [
      {
        id: 'contentTypes',
        type: 'multiselect',
        question: 'What types of content do you currently produce or plan to create?',
        required: false,
        options: [
          { value: 'blog', label: 'Blog posts / Articles' },
          { value: 'case-studies', label: 'Case studies' },
          { value: 'whitepapers', label: 'Whitepapers / Ebooks' },
          { value: 'videos', label: 'Videos' },
          { value: 'podcasts', label: 'Podcasts' },
          { value: 'infographics', label: 'Infographics' },
          { value: 'social', label: 'Social media content' },
          { value: 'email', label: 'Email newsletters' },
          { value: 'webinars', label: 'Webinars / Live streams' },
          { value: 'user-generated', label: 'User-generated content' },
          { value: 'other', label: 'Other' },
          { value: 'none', label: 'None currently' }
        ]
      },
      {
        id: 'brandValues',
        type: 'textarea',
        question: 'What are your core brand values or personality traits?',
        placeholder: 'e.g., Innovative, trustworthy, approachable, premium, sustainable',
        required: true,
        errorMessage: 'Please describe your brand values'
      },
      {
        id: 'brandVoice',
        type: 'radio',
        question: 'How would you describe your brand voice?',
        required: true,
        options: [
          { value: 'professional', label: 'Professional & Formal' },
          { value: 'conversational', label: 'Conversational & Friendly' },
          { value: 'authoritative', label: 'Authoritative & Educational' },
          { value: 'witty', label: 'Witty & Humorous' },
          { value: 'inspirational', label: 'Inspirational & Motivational' },
          { value: 'technical', label: 'Technical & Detailed' },
          { value: 'undefined', label: 'Not clearly defined yet' }
        ],
        errorMessage: 'Please select your brand voice'
      },
      {
        id: 'contentChallenges',
        type: 'textarea',
        question: 'What challenges do you face with content creation or management?',
        placeholder: 'e.g., Lack of time, limited resources, difficulty creating engaging content',
        required: false
      }
    ]
  },
  {
    id: 'additional',
    title: 'Additional Information',
    description: 'Any other details that would help us understand your needs better.',
    questions: [
      {
        id: 'successDefinition',
        type: 'textarea',
        question: 'How will you define success for this marketing project? What specific outcomes are you hoping to achieve?',
        placeholder: 'e.g., 30% increase in qualified leads, 20% growth in organic traffic, 15% improvement in conversion rate',
        required: true,
        errorMessage: 'Please describe how you\'ll define success'
      },
      {
        id: 'decisionProcess',
        type: 'textarea',
        question: 'What is your decision-making process and timeline for selecting a marketing partner?',
        placeholder: 'e.g., Reviewing proposals by June 1, conducting interviews by June 15, making final decision by July 1',
        required: false
      },
      {
        id: 'additionalInfo',
        type: 'textarea',
        question: 'Is there anything else you\'d like to share about your business or project needs?',
        placeholder: 'Any additional context, requirements, or questions',
        required: false
      },
      {
        id: 'referralSource',
        type: 'select',
        question: 'How did you hear about us?',
        required: false,
        options: [
          { value: 'search', label: 'Search Engine (Google, Bing, etc.)' },
          { value: 'social', label: 'Social Media' },
          { value: 'referral', label: 'Referral from a friend/colleague' },
          { value: 'email', label: 'Email Newsletter' },
          { value: 'blog', label: 'Blog Post or Article' },
          { value: 'ad', label: 'Online Advertisement' },
          { value: 'event', label: 'Event or Conference' },
          { value: 'other', label: 'Other' }
        ]
      }
    ]
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'How can we get in touch with you?',
    questions: [
      {
        id: 'name',
        type: 'text',
        question: 'Your Full Name',
        placeholder: 'e.g., John Smith',
        required: true,
        errorMessage: 'Please enter your full name'
      },
      {
        id: 'jobTitle',
        type: 'text',
        question: 'Your Job Title',
        placeholder: 'e.g., Marketing Director',
        required: true,
        errorMessage: 'Please enter your job title'
      },
      {
        id: 'email',
        type: 'email',
        question: 'Your Email Address',
        placeholder: 'e.g., john@example.com',
        required: true,
        validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: 'Please enter a valid email address'
      },
      {
        id: 'phone',
        type: 'phone',
        question: 'Your Phone Number',
        placeholder: 'e.g., (555) 123-4567',
        required: true,
        errorMessage: 'Please enter your phone number'
      },
      {
        id: 'preferredContact',
        type: 'radio',
        question: 'Preferred Contact Method',
        required: true,
        options: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'either', label: 'Either is fine' }
        ],
        errorMessage: 'Please select your preferred contact method'
      },
      {
        id: 'bestTime',
        type: 'multiselect',
        question: 'Best time to contact you',
        required: false,
        options: [
          { value: 'morning', label: 'Morning (9am-12pm)' },
          { value: 'afternoon', label: 'Afternoon (12pm-5pm)' },
          { value: 'evening', label: 'Evening (5pm-8pm)' },
          { value: 'anytime', label: 'Anytime during business hours' }
        ]
      }
    ]
  }
];
