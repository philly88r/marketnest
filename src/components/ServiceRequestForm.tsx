import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiInfo, FiCheckCircle, FiCircle } from 'react-icons/fi';

// Service options based on the agency's offerings
const serviceOptions = [
  { id: 'seo', name: 'SEO Services', description: 'Improve your search engine rankings and visibility' },
  { id: 'ppc', name: 'PPC Advertising', description: 'Targeted paid advertising campaigns' },
  { id: 'social', name: 'Social Media Marketing', description: 'Engage with your audience across social platforms' },
  { id: 'content', name: 'Content Marketing', description: 'Compelling content that drives traffic and conversions' },
  { id: 'email', name: 'Email Marketing', description: 'Personalized email campaigns for your audience' },
  { id: 'web', name: 'Web Design & Development', description: 'Beautiful, functional websites that convert' },
  { id: 'analytics', name: 'Analytics & Reporting', description: 'Data-driven insights to optimize performance' },
  { id: 'cro', name: 'Conversion Rate Optimization', description: 'Turn more visitors into customers' },
];

interface ServiceRequestFormProps {
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
}

interface FormData {
  serviceType: string;
  projectName: string;
  description: string;
  budget: string;
  timeline: string;
  goals: string[];
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    serviceType: '',
    projectName: '',
    description: '',
    budget: '',
    timeline: '',
    goals: []
  });
  
  const [selectedGoals, setSelectedGoals] = useState<Record<string, boolean>>({
    'increase_traffic': false,
    'improve_conversion': false,
    'brand_awareness': false,
    'lead_generation': false,
    'customer_retention': false,
    'competitive_edge': false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle goal selection
  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
    
    // Update goals array in form data
    const updatedGoals = Object.entries({ ...selectedGoals, [goalId]: !selectedGoals[goalId] })
      .filter(([_, selected]) => selected)
      .map(([id, _]) => id);
    
    setFormData(prev => ({
      ...prev,
      goals: updatedGoals
    }));
  };
  
  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.serviceType) newErrors.serviceType = 'Please select a service type';
      if (!formData.projectName.trim()) newErrors.projectName = 'Please enter a project name';
    } else if (currentStep === 2) {
      if (!formData.description.trim()) newErrors.description = 'Please provide a brief description';
      if (formData.goals.length === 0) newErrors.goals = 'Please select at least one goal';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep()) {
      setIsSubmitting(true);
      
      try {
        // In a real app, you would submit this to your backend
        // For now, we'll just simulate a submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (onSubmit) {
          onSubmit(formData);
        }
        
        // Reset form after successful submission
        setFormData({
          serviceType: '',
          projectName: '',
          description: '',
          budget: '',
          timeline: '',
          goals: []
        });
        
        setSelectedGoals({
          'increase_traffic': false,
          'improve_conversion': false,
          'brand_awareness': false,
          'lead_generation': false,
          'customer_retention': false,
          'competitive_edge': false
        });
        
        setCurrentStep(1);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Get the selected service details
  const selectedService = serviceOptions.find(service => service.id === formData.serviceType);
  
  return (
    <FormContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FormHeader>
        <h2>Request a Service</h2>
        <StepIndicator>
          <StepDot $active={currentStep >= 1} $completed={currentStep > 1} />
          <StepLine $completed={currentStep > 1} />
          <StepDot $active={currentStep >= 2} $completed={currentStep > 2} />
          <StepLine $completed={currentStep > 2} />
          <StepDot $active={currentStep >= 3} $completed={currentStep > 3} />
        </StepIndicator>
      </FormHeader>
      
      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <StepContainer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <StepTitle>Service Selection</StepTitle>
            
            <FormGroup>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                $hasError={!!errors.serviceType}
              >
                <option value="">Select a service...</option>
                {serviceOptions.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Select>
              {errors.serviceType && <ErrorMessage>{errors.serviceType}</ErrorMessage>}
            </FormGroup>
            
            {selectedService && (
              <ServiceDescription>
                <span>{FiInfo({ size: 16 })}</span>
                <span>{selectedService.description}</span>
              </ServiceDescription>
            )}
            
            <FormGroup>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Give your project a name"
                $hasError={!!errors.projectName}
              />
              {errors.projectName && <ErrorMessage>{errors.projectName}</ErrorMessage>}
            </FormGroup>
          </StepContainer>
        )}
        
        {currentStep === 2 && (
          <StepContainer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <StepTitle>Project Details</StepTitle>
            
            <FormGroup>
              <Label htmlFor="description">Project Description</Label>
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe what you're looking to achieve"
                rows={4}
                $hasError={!!errors.description}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label>Project Goals</Label>
              <GoalsContainer $hasError={!!errors.goals}>
                <GoalOption
                  $selected={selectedGoals.increase_traffic}
                  onClick={() => handleGoalToggle('increase_traffic')}
                >
                  {selectedGoals.increase_traffic ? <span>{FiCheckCircle({ size: 16 })}</span> : <span>{FiCircle({ size: 16 })}</span>}
                  <span>Increase Website Traffic</span>
                </GoalOption>
                <GoalOption
                  $selected={selectedGoals.improve_conversion}
                  onClick={() => handleGoalToggle('improve_conversion')}
                >
                  {selectedGoals.improve_conversion ? <span>{FiCheckCircle({ size: 16 })}</span> : <span>{FiCircle({ size: 16 })}</span>}
                  <span>Improve Conversion Rate</span>
                </GoalOption>
                <GoalOption
                  $selected={selectedGoals.brand_awareness}
                  onClick={() => handleGoalToggle('brand_awareness')}
                >
                  {selectedGoals.brand_awareness ? <span>{FiCheckCircle({ size: 16 })}</span> : <span>{FiCircle({ size: 16 })}</span>}
                  <span>Increase Brand Awareness</span>
                </GoalOption>
                <GoalOption
                  $selected={selectedGoals.lead_generation}
                  onClick={() => handleGoalToggle('lead_generation')}
                >
                  {selectedGoals.lead_generation ? <span>{FiCheckCircle({ size: 16 })}</span> : <span>{FiCircle({ size: 16 })}</span>}
                  <span>Generate More Leads</span>
                </GoalOption>
                <GoalOption
                  $selected={selectedGoals.customer_retention}
                  onClick={() => handleGoalToggle('customer_retention')}
                >
                  {selectedGoals.customer_retention ? <span>{FiCheckCircle({ size: 16 })}</span> : <span>{FiCircle({ size: 16 })}</span>}
                  <span>Improve Customer Retention</span>
                </GoalOption>
                <GoalOption
                  $selected={selectedGoals.competitive_edge}
                  onClick={() => handleGoalToggle('competitive_edge')}
                >
                  {selectedGoals.competitive_edge ? <span>{FiCheckCircle({ size: 16 })}</span> : <span>{FiCircle({ size: 16 })}</span>}
                  <span>Gain Competitive Edge</span>
                </GoalOption>
              </GoalsContainer>
              {errors.goals && <ErrorMessage>{errors.goals}</ErrorMessage>}
            </FormGroup>
          </StepContainer>
        )}
        
        {currentStep === 3 && (
          <StepContainer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <StepTitle>Budget & Timeline</StepTitle>
            
            <FormGroup>
              <Label htmlFor="budget">Estimated Budget</Label>
              <Select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
              >
                <option value="">Select a budget range...</option>
                <option value="under_5k">Under $5,000</option>
                <option value="5k_10k">$5,000 - $10,000</option>
                <option value="10k_25k">$10,000 - $25,000</option>
                <option value="25k_50k">$25,000 - $50,000</option>
                <option value="over_50k">Over $50,000</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="timeline">Desired Timeline</Label>
              <Select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
              >
                <option value="">Select a timeline...</option>
                <option value="asap">As soon as possible</option>
                <option value="1_month">Within 1 month</option>
                <option value="3_months">Within 3 months</option>
                <option value="6_months">Within 6 months</option>
                <option value="flexible">Flexible</option>
              </Select>
            </FormGroup>
            
            <SummaryContainer>
              <SummaryTitle>Request Summary</SummaryTitle>
              <SummaryItem>
                <SummaryLabel>Service:</SummaryLabel>
                <SummaryValue>
                  {selectedService?.name || 'Not selected'}
                </SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Project:</SummaryLabel>
                <SummaryValue>{formData.projectName || 'Not provided'}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Goals:</SummaryLabel>
                <SummaryValue>
                  {formData.goals.length > 0 
                    ? formData.goals.map(goal => goal.replace('_', ' ')).join(', ') 
                    : 'None selected'}
                </SummaryValue>
              </SummaryItem>
            </SummaryContainer>
          </StepContainer>
        )}
        
        <FormActions>
          {currentStep > 1 && (
            <SecondaryButton 
              type="button" 
              onClick={handlePrevStep}
              disabled={isSubmitting}
            >
              Back
            </SecondaryButton>
          )}
          
          {currentStep < 3 ? (
            <PrimaryButton 
              type="button" 
              onClick={handleNextStep}
            >
              Next
            </PrimaryButton>
          ) : (
            <PrimaryButton 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Request'
              )}
            </PrimaryButton>
          )}
        </FormActions>
      </form>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  margin-bottom: 24px;
`;

const FormHeader = styled.div`
  margin-bottom: 24px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 16px 0;
    background: linear-gradient(90deg, #0df9b6, #0db8f9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    if (props.$completed) return 'linear-gradient(90deg, #0df9b6, #0db8f9)';
    if (props.$active) return '#0df9b6';
    return 'rgba(255, 255, 255, 0.2)';
  }};
  transition: all 0.3s ease;
`;

const StepLine = styled.div<{ $completed: boolean }>`
  height: 2px;
  flex: 1;
  background: ${props => props.$completed ? 'linear-gradient(90deg, #0df9b6, #0db8f9)' : 'rgba(255, 255, 255, 0.2)'};
  margin: 0 8px;
  transition: all 0.3s ease;
`;

const StepContainer = styled.div`
  margin-bottom: 24px;
`;

const StepTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 20px 0;
  color: #fff;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$hasError ? '#ff3b30' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #0df9b6;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$hasError ? '#ff3b30' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #0df9b6;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$hasError ? '#ff3b30' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #0df9b6;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.2);
  }
  
  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const ServiceDescription = styled.div`
  display: flex;
  align-items: flex-start;
  background: rgba(13, 249, 182, 0.05);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  
  svg {
    color: #0df9b6;
    margin-right: 12px;
    margin-top: 2px;
  }
  
  span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const GoalsContainer = styled.div<{ $hasError?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  border: 1px solid ${props => props.$hasError ? '#ff3b30' : 'transparent'};
  border-radius: 8px;
  padding: ${props => props.$hasError ? '12px' : '0'};
`;

const GoalOption = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px;
  background: ${props => props.$selected ? 'rgba(13, 249, 182, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(13, 249, 182, 0.05);
  }
  
  svg {
    color: ${props => props.$selected ? '#0df9b6' : 'rgba(255, 255, 255, 0.5)'};
    margin-right: 12px;
  }
  
  span {
    font-size: 14px;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3b30;
  font-size: 12px;
  margin-top: 6px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(90deg, #0df9b6, #0db8f9);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: 600;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: #fff;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SummaryContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
`;

const SummaryTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: #fff;
`;

const SummaryItem = styled.div`
  display: flex;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  width: 80px;
`;

const SummaryValue = styled.div`
  font-size: 14px;
  flex: 1;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(26, 26, 46, 0.3);
  border-top: 2px solid #1a1a2e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default ServiceRequestForm;
