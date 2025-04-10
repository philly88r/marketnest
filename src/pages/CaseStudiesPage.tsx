import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Case study data
const caseStudies = [
  {
    id: 1,
    title: 'E-commerce Revenue Growth',
    client: 'FashionRetailer.com',
    industry: 'E-commerce',
    services: ['SEO', 'PPC', 'CRO'],
    challenge: 'FashionRetailer.com was struggling with low conversion rates and high cart abandonment despite steady traffic.',
    solution: 'We implemented a comprehensive strategy including technical SEO improvements, targeted PPC campaigns, and conversion rate optimization focused on the checkout process.',
    results: [
      '143% increase in organic traffic within 6 months',
      '67% improvement in conversion rate',
      '89% reduction in cart abandonment',
      '212% increase in revenue year-over-year'
    ],
    testimonial: {
      quote: "The team's data-driven approach transformed our online business. They didn't just drive more traffic – they made sure that traffic converted into actual sales.",
      author: "Sarah Johnson, E-commerce Director at FashionRetailer.com"
    },
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    color: 'linear-gradient(90deg, rgba(103,58,183,1) 0%, rgba(81,45,168,1) 100%)'
  },
  {
    id: 2,
    title: 'B2B Lead Generation Campaign',
    client: 'TechSolutions Inc.',
    industry: 'B2B SaaS',
    services: ['Content Marketing', 'Email Marketing', 'Social Media'],
    challenge: 'TechSolutions Inc. needed to establish thought leadership in the competitive SaaS industry while generating quality leads for their sales team.',
    solution: 'We created a content marketing strategy centered around industry research reports, supported by email nurture campaigns and targeted LinkedIn advertising.',
    results: [
      '315% increase in marketing qualified leads',
      '27% higher engagement rate on LinkedIn',
      '42% increase in email open rates',
      '18 new enterprise clients acquired'
    ],
    testimonial: {
      quote: "Their strategic approach to content marketing completely transformed our lead generation process. We're now seen as thought leaders in our space and our sales team has a consistent pipeline of qualified leads.",
      author: "Michael Chen, CMO at TechSolutions Inc."
    },
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    color: 'linear-gradient(90deg, rgba(0,176,255,1) 0%, rgba(0,132,255,1) 100%)'
  },
  {
    id: 3,
    title: 'Local Business Digital Transformation',
    client: 'Metro Dental Clinic',
    industry: 'Healthcare',
    services: ['Web Design', 'Local SEO', 'PPC'],
    challenge: 'Metro Dental Clinic was losing potential patients to competitors with stronger online presence in a competitive urban market.',
    solution: 'We redesigned their website with a focus on patient experience, implemented a local SEO strategy, and created targeted Google Ads campaigns for specific dental services.',
    results: [
      '267% increase in website appointment bookings',
      '89% improvement in Google Business Profile conversions',
      'First page rankings for 28 local dental keywords',
      '156% ROI on Google Ads spend'
    ],
    testimonial: {
      quote: "Our patient acquisition has completely transformed since working with this team. The new website makes scheduling easy, and we're consistently booked weeks in advance now.",
      author: "Dr. Lisa Patel, Owner at Metro Dental Clinic"
    },
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    color: 'linear-gradient(90deg, rgba(76,175,80,1) 0%, rgba(56,142,60,1) 100%)'
  },
  {
    id: 4,
    title: 'E-commerce Platform Migration & SEO',
    client: 'HomeGoods Direct',
    industry: 'E-commerce',
    services: ['Technical SEO', 'Web Development', 'Analytics'],
    challenge: 'HomeGoods Direct needed to migrate from an outdated e-commerce platform while preserving their strong organic search rankings and performance.',
    solution: 'We managed a comprehensive platform migration with detailed URL mapping, redirects, and technical SEO implementation, followed by performance optimization.',
    results: [
      'Zero loss in organic traffic post-migration',
      '23% improvement in page load speed',
      '18% increase in organic conversions',
      '42% reduction in bounce rate'
    ],
    testimonial: {
      quote: "The migration was seamless from an SEO perspective - we actually saw our traffic increase within weeks of launch. Their technical expertise saved us from what could have been a disaster.",
      author: "Robert Miller, CEO at HomeGoods Direct"
    },
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    color: 'linear-gradient(90deg, rgba(255,87,34,1) 0%, rgba(230,74,25,1) 100%)'
  },
  {
    id: 5,
    title: 'SaaS Product Launch Campaign',
    client: 'CloudManage',
    industry: 'SaaS',
    services: ['Content Marketing', 'Social Media', 'PPC'],
    challenge: 'CloudManage was launching a new cloud management platform in a crowded market and needed to build awareness and generate initial users.',
    solution: 'We developed an integrated launch campaign including thought leadership content, social media strategy, and targeted advertising across multiple platforms.',
    results: [
      '12,500+ beta signups within first month',
      '376% increase in brand search volume',
      '28% conversion rate from free trial to paid',
      'Featured in 5 major industry publications'
    ],
    testimonial: {
      quote: "The launch exceeded all our expectations. Their strategic approach to positioning our product and reaching our target audience was exactly what we needed to stand out in a competitive space.",
      author: "Jennifer Lopez, Product Marketing Director at CloudManage"
    },
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    color: 'linear-gradient(90deg, rgba(156,39,176,1) 0%, rgba(123,31,162,1) 100%)'
  },
  {
    id: 6,
    title: 'Nonprofit Donation Campaign',
    client: 'Ocean Conservation Alliance',
    industry: 'Nonprofit',
    services: ['Social Media', 'Email Marketing', 'Content Strategy'],
    challenge: 'Ocean Conservation Alliance needed to increase donations and awareness for their annual fundraising campaign with limited marketing budget.',
    solution: 'We created an emotional storytelling campaign across social media and email, with optimized donation pages and retargeting strategies.',
    results: [
      '189% increase in online donations year-over-year',
      '43,000+ new email subscribers',
      '267% increase in social media engagement',
      '12 new corporate sponsors acquired'
    ],
    testimonial: {
      quote: "Their team understood our mission and translated it into a digital strategy that resonated with our audience. The results speak for themselves - our most successful fundraising campaign ever.",
      author: "Mark Williams, Executive Director at Ocean Conservation Alliance"
    },
    image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    color: 'linear-gradient(90deg, rgba(3,169,244,1) 0%, rgba(2,136,209,1) 100%)'
  }
];

// Filter options
const industries = ['All', 'E-commerce', 'B2B SaaS', 'SaaS', 'Healthcare', 'Nonprofit'];
const serviceOptions = ['All', 'SEO', 'PPC', 'CRO', 'Content Marketing', 'Email Marketing', 'Social Media', 'Web Design', 'Technical SEO', 'Web Development', 'Analytics', 'Local SEO'];

const CaseStudiesPage: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [activeCase, setActiveCase] = useState<number | null>(null);

  // Filter case studies based on selected filters
  const filteredCaseStudies = caseStudies.filter(study => {
    const industryMatch = selectedIndustry === 'All' || study.industry === selectedIndustry;
    const serviceMatch = selectedService === 'All' || study.services.includes(selectedService);
    return industryMatch && serviceMatch;
  });

  return (
    <>
      <Header />
      <PageContainer>
        <HeroSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GradientTitle>Case Studies</GradientTitle>
            <HeroDescription>
              Real results for real businesses. Explore how we've helped our clients achieve their digital marketing goals.
            </HeroDescription>
          </motion.div>
        </HeroSection>

        <FiltersSection>
          <FilterContainer>
            <FilterLabel>Filter by Industry:</FilterLabel>
            <FilterOptions>
              {industries.map(industry => (
                <FilterButton
                  key={industry}
                  isActive={selectedIndustry === industry}
                  onClick={() => setSelectedIndustry(industry)}
                >
                  {industry}
                </FilterButton>
              ))}
            </FilterOptions>
          </FilterContainer>

          <FilterContainer>
            <FilterLabel>Filter by Service:</FilterLabel>
            <FilterOptions>
              {serviceOptions.map(service => (
                <FilterButton
                  key={service}
                  isActive={selectedService === service}
                  onClick={() => setSelectedService(service)}
                >
                  {service}
                </FilterButton>
              ))}
            </FilterOptions>
          </FilterContainer>
        </FiltersSection>

        <CaseStudiesGrid>
          {filteredCaseStudies.length > 0 ? (
            filteredCaseStudies.map(study => (
              <CaseStudyCard
                key={study.id}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                onClick={() => setActiveCase(study.id)}
              >
                <CaseStudyImage style={{ backgroundImage: `url(${study.image})` }}>
                  <CaseStudyOverlay style={{ background: study.color }} />
                  <CaseStudyIndustry>{study.industry}</CaseStudyIndustry>
                </CaseStudyImage>
                <CaseStudyContent>
                  <CaseStudyTitle>{study.title}</CaseStudyTitle>
                  <CaseStudyClient>{study.client}</CaseStudyClient>
                  <CaseStudyServices>
                    {study.services.map((service, index) => (
                      <CaseStudyServiceTag key={index}>{service}</CaseStudyServiceTag>
                    ))}
                  </CaseStudyServices>
                  <CaseStudyHighlight>
                    {study.results[0]}
                  </CaseStudyHighlight>
                  <ViewCaseStudyButton>View Case Study</ViewCaseStudyButton>
                </CaseStudyContent>
              </CaseStudyCard>
            ))
          ) : (
            <NoResultsMessage>
              No case studies match your current filters. Please try different filter options.
            </NoResultsMessage>
          )}
        </CaseStudiesGrid>

        {activeCase && (
          <CaseStudyModal
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CaseStudyModalContent
              as={motion.div}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CloseButton onClick={() => setActiveCase(null)}>×</CloseButton>
              {(() => {
                const study = caseStudies.find(s => s.id === activeCase);
                if (!study) return null;
                
                return (
                  <>
                    <CaseStudyModalHeader style={{ background: study.color }}>
                      <CaseStudyModalTitle>{study.title}</CaseStudyModalTitle>
                      <CaseStudyModalSubtitle>{study.client} | {study.industry}</CaseStudyModalSubtitle>
                    </CaseStudyModalHeader>
                    
                    <CaseStudyModalBody>
                      <CaseStudySection>
                        <CaseStudySectionTitle>Challenge</CaseStudySectionTitle>
                        <CaseStudySectionContent>{study.challenge}</CaseStudySectionContent>
                      </CaseStudySection>
                      
                      <CaseStudySection>
                        <CaseStudySectionTitle>Solution</CaseStudySectionTitle>
                        <CaseStudySectionContent>{study.solution}</CaseStudySectionContent>
                      </CaseStudySection>
                      
                      <CaseStudySection>
                        <CaseStudySectionTitle>Results</CaseStudySectionTitle>
                        <ResultsList>
                          {study.results.map((result, index) => (
                            <ResultItem key={index}>{result}</ResultItem>
                          ))}
                        </ResultsList>
                      </CaseStudySection>
                      
                      <TestimonialSection>
                        <TestimonialQuote>"{study.testimonial.quote}"</TestimonialQuote>
                        <TestimonialAuthor>— {study.testimonial.author}</TestimonialAuthor>
                      </TestimonialSection>
                      
                      <ServicesUsedSection>
                        <CaseStudySectionTitle>Services Used</CaseStudySectionTitle>
                        <ServicesList>
                          {study.services.map((service, index) => (
                            <ServiceItem key={index}>
                              <Link to={`/services/${getServiceSlug(service)}`}>
                                {service}
                              </Link>
                            </ServiceItem>
                          ))}
                        </ServicesList>
                      </ServicesUsedSection>
                      
                      <CTASection>
                        <CTAText>Ready to achieve similar results for your business?</CTAText>
                        <CTAButton as={Link} to="/contact">Get in Touch</CTAButton>
                      </CTASection>
                    </CaseStudyModalBody>
                  </>
                );
              })()}
            </CaseStudyModalContent>
          </CaseStudyModal>
        )}

        <CTAContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CTAHeading>Ready to be our next success story?</CTAHeading>
            <CTADescription>
              Let's discuss how we can help you achieve your digital marketing goals and drive measurable results for your business.
            </CTADescription>
            <CTAButtonLarge as={Link} to="/contact">Schedule a Free Consultation</CTAButtonLarge>
          </motion.div>
        </CTAContainer>
      </PageContainer>
      <Footer />
    </>
  );
};

// Helper function to convert service name to URL slug
const getServiceSlug = (service: string): string => {
  const serviceMap: {[key: string]: string} = {
    'SEO': 'seo',
    'PPC': 'ppc',
    'CRO': 'conversion-optimization',
    'Content Marketing': 'content-marketing',
    'Email Marketing': 'email-marketing',
    'Social Media': 'social-media',
    'Web Design': 'web-design',
    'Technical SEO': 'seo',
    'Web Development': 'web-design',
    'Analytics': 'analytics-reporting',
    'Local SEO': 'seo'
  };
  
  return serviceMap[service] || '';
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  padding-top: 80px; /* Add padding to account for fixed header */
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 60px 0 60px;
`;

const GradientTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #673AB7 0%, #03A9F4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
  color: #B0B7C3;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FiltersSection = styled.section`
  margin: 40px 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.h3`
  font-size: 1rem;
  margin-bottom: 10px;
  color: #E0E0E0;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 30px;
  border: none;
  background: ${props => props.isActive ? 'linear-gradient(90deg, #673AB7 0%, #03A9F4 100%)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.isActive ? '#FFFFFF' : '#B0B7C3'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.isActive ? 'linear-gradient(90deg, #673AB7 0%, #03A9F4 100%)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const CaseStudiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin: 50px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
`;

const CaseStudyCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const CaseStudyImage = styled.div`
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
`;

const CaseStudyOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.8;
`;

const CaseStudyIndustry = styled.span`
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CaseStudyContent = styled.div`
  padding: 20px;
`;

const CaseStudyTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #FFFFFF;
`;

const CaseStudyClient = styled.p`
  font-size: 0.9rem;
  color: #B0B7C3;
  margin-bottom: 15px;
`;

const CaseStudyServices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
`;

const CaseStudyServiceTag = styled.span`
  background: rgba(255, 255, 255, 0.05);
  color: #B0B7C3;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
`;

const CaseStudyHighlight = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #03A9F4;
  margin-bottom: 20px;
`;

const ViewCaseStudyButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const NoResultsMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px 0;
  color: #B0B7C3;
  font-size: 1.1rem;
`;

const CaseStudyModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const CaseStudyModalContent = styled.div`
  background: #121826;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const CaseStudyModalHeader = styled.div`
  padding: 40px 30px;
  color: white;
`;

const CaseStudyModalTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CaseStudyModalSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.8;
`;

const CaseStudyModalBody = styled.div`
  padding: 30px;
`;

const CaseStudySection = styled.div`
  margin-bottom: 30px;
`;

const CaseStudySectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #FFFFFF;
`;

const CaseStudySectionContent = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #B0B7C3;
`;

const ResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ResultItem = styled.li`
  position: relative;
  padding-left: 25px;
  margin-bottom: 10px;
  color: #B0B7C3;
  
  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #4CAF50;
    font-weight: bold;
  }
`;

const TestimonialSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-left: 4px solid #03A9F4;
  padding: 20px;
  margin: 30px 0;
  border-radius: 0 8px 8px 0;
`;

const TestimonialQuote = styled.p`
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.6;
  color: #E0E0E0;
  margin-bottom: 15px;
`;

const TestimonialAuthor = styled.p`
  font-size: 0.9rem;
  color: #B0B7C3;
`;

const ServicesUsedSection = styled.div`
  margin-bottom: 30px;
`;

const ServicesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ServiceItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 16px;
  border-radius: 30px;
  transition: all 0.3s ease;
  
  a {
    color: #B0B7C3;
    text-decoration: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    
    a {
      color: #FFFFFF;
    }
  }
`;

const CTASection = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const CTAText = styled.p`
  font-size: 1.1rem;
  color: #E0E0E0;
  margin-bottom: 20px;
`;

const CTAButton = styled.button`
  background: linear-gradient(90deg, #673AB7 0%, #03A9F4 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const CTAContainer = styled.section`
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 60px 30px;
  margin: 80px 0 60px;
`;

const CTAHeading = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #FFFFFF;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto 30px;
  color: #B0B7C3;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButtonLarge = styled(CTAButton)`
  padding: 12px 30px;
  font-size: 1.1rem;
`;

export default CaseStudiesPage;
