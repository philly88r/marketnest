import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ContactSectionContainer = styled.section`
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

const ContactWrapper = styled.div`
  display: flex;
  gap: 50px;
  
  @media (max-width: 992px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const ContactInfo = styled(motion.div)`
  flex: 1;
`;

const ContactTitle = styled(motion.h2)`
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

const ContactDescription = styled(motion.p)`
  color: rgba(255, 255, 255, 0.81);
  font-size: 18px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 30px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 26px;
    margin-bottom: 30px;
  }
`;

const ContactDetails = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const ContactItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

const ContactText = styled.div`
  color: white;
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
`;

const SocialIcon = styled(motion.a)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
    transform: translateY(-3px);
  }
`;

const ContactForm = styled(motion.form)`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const FormTitle = styled.h3`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    font-size: 22px;
    margin-bottom: 24px;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 15px;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  margin-bottom: 20px;
  position: relative;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const FormLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.81);
  font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;

const RequiredStar = styled.span`
  color: #FF43A3;
  margin-left: 4px;
`;

const FormInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.hasError ? '#FF4343' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 14px 16px;
  color: white;
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#FF4343' : 'rgba(255, 255, 255, 0.3)'};
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 12px 14px;
  }
`;

const ErrorMessage = styled(motion.div)`
  color: #FF4343;
  font-size: 12px;
  margin-top: 5px;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const FormTextarea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.hasError ? '#FF4343' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 14px 16px;
  color: white;
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 150px;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#FF4343' : 'rgba(255, 255, 255, 0.3)'};
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    min-height: 120px;
  }
`;

const SubmitButton = styled(motion.button)<{ isSubmitting?: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: ${props => props.isSubmitting ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    opacity: ${props => props.isSubmitting ? '1' : '0.9'};
    transform: ${props => props.isSubmitting ? 'none' : 'translateY(-2px)'};
    box-shadow: 0 8px 20px rgba(31, 83, 255, 0.2);
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

const LoadingSpinner = styled(motion.div)`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  margin-right: 8px;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SuccessMessage = styled(motion.div)`
  background: rgba(39, 174, 96, 0.1);
  border: 1px solid rgba(39, 174, 96, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: #2ECC71;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SuccessIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2ECC71;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

const ContactSection: React.FC = () => {
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formState.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formState.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formState.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // Reset form after submission
        setFormState({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      }, 1500);
    }
  };
  
  return (
    <ContactSectionContainer>
      <ContactWrapper>
        <ContactInfo>
          <ContactTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Get in Touch
          </ContactTitle>
          
          <ContactDescription
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Have questions about our services or ready to start your next project? 
            Contact us today and our team of experts will help you transform your 
            digital marketing strategy.
          </ContactDescription>
          
          <ContactDetails>
            <ContactItem
              as={motion.div}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ x: 5 }}
            >
              <IconWrapper>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 10C20 14.4183 16.4183 18 12 18C10.5937 18 9.27223 17.6372 8.12398 17C7.53381 16.6879 4 18 4 18C4 18 5.3121 14.4662 5 13.876C4.36283 12.7278 4 11.4063 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconWrapper>
              <ContactText>info@marketnest.org</ContactText>
            </ContactItem>
            
            <ContactItem
              as={motion.div}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ x: 5 }}
            >
              <IconWrapper>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconWrapper>
              <ContactText>919-504-1542</ContactText>
            </ContactItem>
            
            <ContactItem
              as={motion.div}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ x: 5 }}
            >
              <IconWrapper>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.6569 16.6569C16.7202 17.5935 14.7616 19.5521 13.4138 20.8999C12.6327 21.681 11.3677 21.6814 10.5866 20.9003C9.26234 19.576 7.34159 17.6553 6.34315 16.6569C3.21895 13.5327 3.21895 8.46734 6.34315 5.34315C9.46734 2.21895 14.5327 2.21895 17.6569 5.34315C20.781 8.46734 20.781 13.5327 17.6569 16.6569Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconWrapper>
              <ContactText>Greensboro, NC</ContactText>
            </ContactItem>
          </ContactDetails>
          
          <SocialLinks>
            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social, index) => (
              <SocialIcon 
                key={social}
                href="#" 
                aria-label={social}
                as={motion.a}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {social === 'Facebook' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {social === 'Twitter' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.95721 14.8821 3.28445C14.0247 3.61169 13.2884 4.1944 12.773 4.95372C12.2575 5.71303 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3V3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {social === 'Instagram' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61991 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7615 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2648 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {social === 'LinkedIn' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8V8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 9H2V21H6V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </SocialIcon>
            ))}
          </SocialLinks>
        </ContactInfo>
        
        <ContactForm
          as={motion.form}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          onSubmit={handleSubmit}
        >
          <AnimatePresence>
            {isSubmitted && (
              <SuccessMessage
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SuccessIcon>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SuccessIcon>
                Thank you! Your message has been sent successfully.
              </SuccessMessage>
            )}
          </AnimatePresence>
          
          <FormTitle>Send us a Message</FormTitle>
          
          <FormRow>
            <FormGroup>
              <FormLabel>
                First Name
                <RequiredStar>*</RequiredStar>
              </FormLabel>
              <FormInput 
                type="text" 
                name="firstName"
                value={formState.firstName}
                onChange={handleChange}
                placeholder="Enter your first name" 
                hasError={!!errors.firstName}
              />
              <AnimatePresence>
                {errors.firstName && (
                  <ErrorMessage
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.firstName}
                  </ErrorMessage>
                )}
              </AnimatePresence>
            </FormGroup>
            
            <FormGroup>
              <FormLabel>
                Last Name
                <RequiredStar>*</RequiredStar>
              </FormLabel>
              <FormInput 
                type="text" 
                name="lastName"
                value={formState.lastName}
                onChange={handleChange}
                placeholder="Enter your last name" 
                hasError={!!errors.lastName}
              />
              <AnimatePresence>
                {errors.lastName && (
                  <ErrorMessage
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.lastName}
                  </ErrorMessage>
                )}
              </AnimatePresence>
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <FormLabel>
              Email
              <RequiredStar>*</RequiredStar>
            </FormLabel>
            <FormInput 
              type="email" 
              name="email"
              value={formState.email}
              onChange={handleChange}
              placeholder="Enter your email address" 
              hasError={!!errors.email}
            />
            <AnimatePresence>
              {errors.email && (
                <ErrorMessage
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.email}
                </ErrorMessage>
              )}
            </AnimatePresence>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Phone (optional)</FormLabel>
            <FormInput 
              type="tel" 
              name="phone"
              value={formState.phone}
              onChange={handleChange}
              placeholder="Enter your phone number" 
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>
              Message
              <RequiredStar>*</RequiredStar>
            </FormLabel>
            <FormTextarea 
              name="message"
              value={formState.message}
              onChange={handleChange}
              placeholder="Tell us about your project or inquiry" 
              hasError={!!errors.message}
            />
            <AnimatePresence>
              {errors.message && (
                <ErrorMessage
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.message}
                </ErrorMessage>
              )}
            </AnimatePresence>
          </FormGroup>
          
          <SubmitButton 
            type="submit"
            isSubmitting={isSubmitting}
            whileHover={!isSubmitting ? { y: -5 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner /> Sending...
              </>
            ) : (
              'Send Message'
            )}
          </SubmitButton>
        </ContactForm>
      </ContactWrapper>
    </ContactSectionContainer>
  );
};

export default ContactSection;
