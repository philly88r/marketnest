import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { questionGroups } from '../data/questionnaireData';
import { Question, QuestionGroup, QuestionnaireData } from '../types/questionnaire';

// Styled Components
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const QuestionnaireContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const QuestionnaireHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled(motion.h1)`
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.81);
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Description = styled(motion.p)`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  max-width: 700px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ProgressContainer = styled.div`
  margin: 30px 0;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressFill = styled(motion.div)<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  border-radius: 3px;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 4px;
  background: ${props => 
    props.$active 
      ? 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)' 
      : props.$completed 
        ? 'rgba(255, 255, 255, 0.5)' 
        : 'rgba(255, 255, 255, 0.1)'
  };
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: ${props => props.$completed ? 'scale(1.2)' : 'none'};
  }
`;

const StepLabel = styled.div<{ $active: boolean; $completed: boolean }>`
  font-size: 12px;
  color: ${props => 
    props.$active 
      ? 'white' 
      : props.$completed 
        ? 'rgba(255, 255, 255, 0.7)' 
        : 'rgba(255, 255, 255, 0.4)'
  };
  margin-top: 6px;
  text-align: center;
  transition: all 0.3s ease;
  white-space: nowrap;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 8px;
  cursor: pointer;
`;

const QuestionContainer = styled(motion.div)`
  margin-bottom: 30px;
`;

const QuestionGroupTitle = styled(motion.h2)`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const QuestionGroupDescription = styled(motion.p)`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const QuestionText = styled(motion.h3)`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 12px;
  color: white;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const RequiredStar = styled.span`
  color: #FF43A3;
  margin-left: 4px;
`;

const QuestionDescription = styled(motion.p)`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$hasError ? '#FF4343' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#FF4343' : '#1F53FF'};
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 14px;
  }
`;

const Textarea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$hasError ? '#FF4343' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: white;
  font-size: 16px;
  min-height: 120px;
  transition: all 0.3s ease;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#FF4343' : '#1F53FF'};
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 14px;
    min-height: 100px;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$hasError ? '#FF4343' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: white;
  font-size: 16px;
  appearance: none;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#FF4343' : '#1F53FF'};
    background: rgba(255, 255, 255, 0.08);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 14px;
  }
`;

const SelectArrow = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(255, 255, 255, 0.6);
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  
  &.selected {
    background: rgba(31, 83, 255, 0.2);
    border-color: rgba(31, 83, 255, 0.5);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 14px;
  }
`;

const CheckboxInput = styled.input`
  margin-right: 8px;
`;

const RadioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  
  &.selected {
    background: rgba(31, 83, 255, 0.2);
    border-color: rgba(31, 83, 255, 0.5);
  }
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 14px;
  }
`;

const RadioInput = styled.input`
  margin-right: 10px;
`;

const ErrorMessage = styled(motion.div)`
  color: #FF4343;
  font-size: 14px;
  margin-top: 6px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const Button = styled(motion.button)<{ $primary?: boolean }>`
  padding: ${props => props.$primary ? '14px 28px' : '12px 24px'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  background: ${props => props.$primary 
    ? 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)' 
    : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  border: ${props => props.$primary 
    ? 'none' 
    : '1px solid rgba(255, 255, 255, 0.2)'};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: ${props => props.$primary ? '12px 24px' : '10px 20px'};
    font-size: 15px;
  }
`;

const SuccessContainer = styled(motion.div)`
  text-align: center;
  padding: 40px 20px;
`;

const SuccessIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 30px;
  color: white;
  font-size: 40px;
`;

const SuccessTitle = styled(motion.h2)`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const SuccessText = styled(motion.p)`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

// Main Component
const ProjectQuestionnaire: React.FC = () => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireData>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const currentGroup = questionGroups[currentGroupIndex];
  const progress = ((currentGroupIndex + 1) / questionGroups.length) * 100;
  
  // Handle input changes
  const handleChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };
  
  // Validate current group questions
  const validateCurrentGroup = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;
    
    currentGroup.questions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id];
        
        if (
          answer === undefined || 
          answer === null || 
          answer === '' || 
          (Array.isArray(answer) && answer.length === 0)
        ) {
          newErrors[question.id] = question.errorMessage || 'This field is required';
          isValid = false;
        } else if (question.validation && typeof answer === 'string') {
          if (!question.validation.test(answer)) {
            newErrors[question.id] = question.errorMessage || 'Invalid input';
            isValid = false;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle next button click
  const handleNext = () => {
    if (validateCurrentGroup()) {
      if (currentGroupIndex < questionGroups.length - 1) {
        setCurrentGroupIndex(currentGroupIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
  
  // Handle previous button click
  const handlePrevious = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateCurrentGroup()) {
      setSubmitting(true);
      
      try {
        // Here you would typically send the data to your backend
        // For now, we'll simulate a successful submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Form submitted with data:', answers);
        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting form:', error);
        // Handle submission error
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  // Handle step click in progress indicator
  const handleStepClick = (index: number) => {
    // Only allow going back to completed steps
    if (index < currentGroupIndex) {
      setCurrentGroupIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Render question based on its type
  const renderQuestion = (question: Question) => {
    const { id, type, placeholder, options } = question;
    const value = answers[id] || '';
    const hasError = !!errors[id];
    
    switch (type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={type === 'email' ? 'email' : 'text'}
            id={id}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder}
            $hasError={hasError}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder}
            $hasError={hasError}
          />
        );
        
      case 'select':
        return (
          <SelectWrapper>
            <Select
              id={id}
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              $hasError={hasError}
            >
              <option value="" disabled>Select an option</option>
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <SelectArrow>▼</SelectArrow>
          </SelectWrapper>
        );
        
      case 'multiselect':
        return (
          <CheckboxContainer>
            {options?.map(option => {
              const isSelected = Array.isArray(value) && value.includes(option.value);
              
              return (
                <CheckboxLabel 
                  key={option.value} 
                  className={isSelected ? 'selected' : ''}
                >
                  <CheckboxInput
                    type="checkbox"
                    id={`${id}-${option.value}`}
                    checked={isSelected}
                    onChange={() => {
                      const currentValues = Array.isArray(value) ? [...value] : [];
                      const newValues = isSelected
                        ? currentValues.filter(v => v !== option.value)
                        : [...currentValues, option.value];
                      
                      handleChange(id, newValues);
                    }}
                  />
                  {option.label}
                </CheckboxLabel>
              );
            })}
          </CheckboxContainer>
        );
        
      case 'radio':
        return (
          <RadioContainer>
            {options?.map(option => (
              <RadioLabel 
                key={option.value} 
                className={value === option.value ? 'selected' : ''}
              >
                <RadioInput
                  type="radio"
                  id={`${id}-${option.value}`}
                  name={id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(id, option.value)}
                />
                {option.label}
              </RadioLabel>
            ))}
          </RadioContainer>
        );
        
      default:
        return null;
    }
  };
  
  // Show success message after submission
  if (submitted) {
    return (
      <QuestionnaireContainer>
        <SuccessContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SuccessIcon
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            ✓
          </SuccessIcon>
          <SuccessTitle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Thank You!
          </SuccessTitle>
          <SuccessText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Your questionnaire has been submitted successfully. Our team will review your information and get back to you within 1-2 business days to discuss your project in detail.
          </SuccessText>
          <Button
            $primary
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </SuccessContainer>
      </QuestionnaireContainer>
    );
  }
  
  return (
    <QuestionnaireContainer>
      <QuestionnaireHeader>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Project Questionnaire
        </Title>
        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Help us understand your business and project needs
        </Subtitle>
        <Description
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          This detailed questionnaire will help us create a tailored proposal for your digital marketing needs. Please take your time to provide thorough answers.
        </Description>
      </QuestionnaireHeader>
      
      <ProgressContainer>
        <ProgressBar>
          <ProgressFill 
            $progress={progress} 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </ProgressBar>
        <ProgressText>
          <span>Step {currentGroupIndex + 1} of {questionGroups.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </ProgressText>
      </ProgressContainer>
      
      <StepIndicator>
        {questionGroups.map((group, index) => (
          <StepItem 
            key={group.id}
            onClick={() => handleStepClick(index)}
          >
            <StepDot 
              $active={index === currentGroupIndex} 
              $completed={index < currentGroupIndex} 
            />
            <StepLabel 
              $active={index === currentGroupIndex} 
              $completed={index < currentGroupIndex}
            >
              {group.title}
            </StepLabel>
          </StepItem>
        ))}
      </StepIndicator>
      
      <AnimatePresence mode="wait">
        <QuestionContainer
          key={currentGroup.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionGroupTitle>{currentGroup.title}</QuestionGroupTitle>
          {currentGroup.description && (
            <QuestionGroupDescription>
              {currentGroup.description}
            </QuestionGroupDescription>
          )}
          
          {currentGroup.questions.map((question) => {
            // Conditionally show industry "other" field
            if (question.id === 'industryOther' && answers['industry'] !== 'other') {
              return null;
            }
            
            // Conditionally show goal "other" field
            if (question.id === 'goalOther' && answers['primaryGoal'] !== 'other') {
              return null;
            }
            
            return (
              <div key={question.id} style={{ marginBottom: '30px' }}>
                <QuestionText>
                  {question.question}
                  {question.required && <RequiredStar>*</RequiredStar>}
                </QuestionText>
                
                {question.description && (
                  <QuestionDescription>
                    {question.description}
                  </QuestionDescription>
                )}
                
                {renderQuestion(question)}
                
                <AnimatePresence>
                  {errors[question.id] && (
                    <ErrorMessage
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {errors[question.id]}
                    </ErrorMessage>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </QuestionContainer>
      </AnimatePresence>
      
      <ButtonContainer>
        {currentGroupIndex > 0 ? (
          <Button
            onClick={handlePrevious}
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>←</span> Previous
          </Button>
        ) : (
          <div></div> // Empty div to maintain layout
        )}
        
        {currentGroupIndex < questionGroups.length - 1 ? (
          <Button
            $primary
            onClick={handleNext}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            Next <span>→</span>
          </Button>
        ) : (
          <Button
            $primary
            onClick={handleSubmit}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    style={{ animation: 'spin 1s linear infinite' }}
                  />
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Questionnaire'
            )}
          </Button>
        )}
      </ButtonContainer>
    </QuestionnaireContainer>
  );
};

export default ProjectQuestionnaire;
