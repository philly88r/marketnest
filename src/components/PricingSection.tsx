import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const PricingSectionContainer = styled.section`
  padding: 100px 200px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    padding: 80px 100px;
  }
  
  @media (max-width: 992px) {
    padding: 60px 60px;
  }
  
  @media (max-width: 768px) {
    padding: 50px 20px;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const SectionTitle = styled(motion.h2)`
  color: white;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  
  @media (max-width: 992px) {
    font-size: 40px;
  }
  
  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 16px;
  }
`;

const SectionDescription = styled(motion.p)`
  color: rgba(255, 255, 255, 0.81);
  font-size: 18px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 30px;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 26px;
  }
`;

const BillingToggle = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px auto;
  gap: 16px;
`;

const BillingOption = styled.span<{ $active: boolean }>`
  font-size: 16px;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: white;
  }
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 60px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 4px;
  cursor: pointer;
`;

const ToggleButton = styled(motion.div)`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
`;

const SaveBadge = styled(motion.span)`
  position: absolute;
  top: -10px;
  right: -40px;
  background: linear-gradient(90deg, #FF43A3 0%, #1F53FF 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
`;

const PricingCardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  
  @media (max-width: 992px) {
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }
`;

const PricingCard = styled(motion.div)<{ $featured?: boolean }>`
  width: 350px;
  background: ${props => props.$featured ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 16px;
  padding: 40px;
  border: ${props => props.$featured ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'};
  position: relative;
  box-shadow: ${props => props.$featured ? '0 10px 30px rgba(31, 83, 255, 0.1)' : 'none'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(31, 83, 255, 0.15);
  }
  
  @media (max-width: 1200px) {
    width: 320px;
  }
  
  @media (max-width: 992px) {
    width: 100%;
    max-width: 500px;
  }
  
  @media (max-width: 768px) {
    padding: 30px;
  }
  
  ${props => props.$featured && `
    &:before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
      z-index: -1;
      border-radius: 18px;
    }
  `}
`;

const PlanLabel = styled.div<{ $featured?: boolean }>`
  display: ${props => props.$featured ? 'flex' : 'none'};
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 16px;
  border-radius: 20px;
`;

const PlanName = styled.h3`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const PlanPrice = styled.div`
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Price = styled(motion.span)`
  color: white;
  font-size: 48px;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const OldPrice = styled(motion.span)`
  color: rgba(255, 255, 255, 0.4);
  font-size: 24px;
  font-weight: 400;
  text-decoration: line-through;
  position: absolute;
  right: 50px;
  top: 10px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    right: 40px;
  }
`;

const PriceUnit = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const PlanFeatures = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 40px 0;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const FeatureItem = styled.li`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 0;
  }
`;

const CheckIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

const ActionButton = styled(motion.button)<{ $featured?: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.$featured ? 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: ${props => props.$featured ? '0 8px 20px rgba(255, 67, 163, 0.3)' : '0 8px 20px rgba(255, 255, 255, 0.1)'};
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }
  
  &:hover:before {
    left: 100%;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
  }
`;

// Pricing data with monthly and annual options
interface PricingPlan {
  name: string;
  price: string;
  oldPrice?: string;
  featured?: boolean;
  features: string[];
  buttonText: string;
}

interface PricingData {
  monthly: PricingPlan[];
  annual: PricingPlan[];
}

const pricingData: PricingData = {
  monthly: [
    {
      name: "Starter",
      price: "$499",
      features: [
        "Social Media Management",
        "Basic SEO Optimization",
        "Monthly Performance Reports",
        "Email Support"
      ],
      buttonText: "Get Started"
    },
    {
      name: "Professional",
      price: "$999",
      featured: true,
      features: [
        "Everything in Starter",
        "Advanced SEO Strategies",
        "Content Marketing",
        "Weekly Performance Reports",
        "Priority Support"
      ],
      buttonText: "Get Started"
    },
    {
      name: "Enterprise",
      price: "$1999",
      features: [
        "Everything in Professional",
        "Custom Strategy Development",
        "Dedicated Account Manager",
        "Advanced Analytics & Reporting",
        "24/7 Premium Support"
      ],
      buttonText: "Contact Us"
    }
  ],
  annual: [
    {
      name: "Starter",
      price: "$449",
      oldPrice: "$499",
      features: [
        "Social Media Management",
        "Basic SEO Optimization",
        "Monthly Performance Reports",
        "Email Support"
      ],
      buttonText: "Get Started"
    },
    {
      name: "Professional",
      price: "$899",
      oldPrice: "$999",
      featured: true,
      features: [
        "Everything in Starter",
        "Advanced SEO Strategies",
        "Content Marketing",
        "Weekly Performance Reports",
        "Priority Support"
      ],
      buttonText: "Get Started"
    },
    {
      name: "Enterprise",
      price: "$1799",
      oldPrice: "$1999",
      features: [
        "Everything in Professional",
        "Custom Strategy Development",
        "Dedicated Account Manager",
        "Advanced Analytics & Reporting",
        "24/7 Premium Support"
      ],
      buttonText: "Contact Us"
    }
  ]
};

const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  return (
    <PricingSectionContainer>
      <SectionHeader>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Transparent Pricing Plans
        </SectionTitle>
        
        <SectionDescription
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Choose the perfect plan for your business needs. All plans include our core analytics features and dedicated support.
        </SectionDescription>
        
        <BillingToggle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <BillingOption 
            $active={billingCycle === 'monthly'} 
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </BillingOption>
          
          <ToggleSwitch onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}>
            <ToggleButton 
              animate={{ x: billingCycle === 'monthly' ? 0 : 30 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            {billingCycle === 'annual' && (
              <SaveBadge
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                Save 10%
              </SaveBadge>
            )}
          </ToggleSwitch>
          
          <BillingOption 
            $active={billingCycle === 'annual'} 
            onClick={() => setBillingCycle('annual')}
          >
            Annual
          </BillingOption>
        </BillingToggle>
      </SectionHeader>
      
      <PricingCardsContainer>
        <AnimatePresence mode="wait">
          {pricingData[billingCycle].map((plan, index) => (
            <PricingCard
              key={`${billingCycle}-${plan.name}`}
              $featured={plan.featured}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 + (index * 0.1) }}
              whileHover={{ y: -10 }}
            >
              {plan.featured && <PlanLabel $featured>Most Popular</PlanLabel>}
              <PlanName>{plan.name}</PlanName>
              <PlanPrice>
                {plan.oldPrice && (
                  <OldPrice
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {plan.oldPrice}
                  </OldPrice>
                )}
                <Price
                  key={`price-${billingCycle}-${plan.name}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {plan.price}
                </Price>
                <PriceUnit>/{billingCycle === 'monthly' ? 'month' : 'year'}</PriceUnit>
              </PlanPrice>
              
              <PlanFeatures>
                {plan.features.map((feature, featureIndex) => (
                  <FeatureItem key={featureIndex}>
                    <CheckIcon>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </CheckIcon>
                    {feature}
                  </FeatureItem>
                ))}
              </PlanFeatures>
              
              <ActionButton 
                $featured={plan.featured}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {plan.buttonText}
              </ActionButton>
            </PricingCard>
          ))}
        </AnimatePresence>
      </PricingCardsContainer>
    </PricingSectionContainer>
  );
};

export default PricingSection;
