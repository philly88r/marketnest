import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FooterContainer = styled.footer`
  padding: 80px 200px 40px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    padding: 80px 100px 40px;
  }
  
  @media (max-width: 992px) {
    padding: 70px 60px 40px;
  }
  
  @media (max-width: 768px) {
    padding: 60px 20px 30px;
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 60px;
  
  @media (max-width: 992px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const FooterColumn = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 992px) {
    min-width: 100%;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 20px;
`;

const Logo = styled.div`
  width: 87px;
  height: 68px;
  position: relative;
  overflow: hidden;
`;

const LogoBlue = styled.div`
  width: 63.65px;
  height: 40.06px;
  left: 1.74px;
  top: 3.49px;
  position: absolute;
  background: #1F53FF;
`;

const LogoPink = styled.div`
  width: 65.39px;
  height: 40.06px;
  left: 19.87px;
  top: 22.71px;
  position: absolute;
  background: #FF43A3;
`;

const CompanyDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 26px;
  max-width: 300px;
`;

const ColumnTitle = styled.h3`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const LinksList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const LinkItem = styled.li`
  margin-bottom: 12px;
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #FF43A3;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ContactIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContactText = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
`;

const SocialContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const SocialIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
    transform: translateY(-5px);
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 30px;
`;

const BottomFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Copyright = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 30px;
`;

const BottomLink = styled.a`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #FF43A3;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterColumn>
          <LogoContainer>
            <Logo>
              <LogoBlue />
              <LogoPink />
            </Logo>
          </LogoContainer>
          <CompanyDescription>
            We help businesses grow through data-driven marketing strategies and innovative digital solutions.
          </CompanyDescription>
          <SocialContainer>
            <SocialIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SocialIcon>
            <SocialIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.95721 14.8821 3.28445C14.0247 3.61169 13.2884 4.1944 12.773 4.95372C12.2575 5.71303 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3V3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SocialIcon>
            <SocialIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61991 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7615 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2648 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SocialIcon>
            <SocialIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8V8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 9H2V21H6V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SocialIcon>
          </SocialContainer>
        </FooterColumn>
        
        <FooterColumn>
          <ColumnTitle>Company</ColumnTitle>
          <LinksList>
            <LinkItem><FooterLink href="#">About Us</FooterLink></LinkItem>
            <LinkItem><FooterLink href="#">Services</FooterLink></LinkItem>
            <LinkItem><FooterLink href="#">Case Studies</FooterLink></LinkItem>
            <LinkItem><FooterLink href="#">Testimonials</FooterLink></LinkItem>
            <LinkItem><FooterLink href="#">Careers</FooterLink></LinkItem>
          </LinksList>
        </FooterColumn>
        
        <FooterColumn>
          <ColumnTitle>Support</ColumnTitle>
          <LinksList>
            <LinkItem><FooterLink href="#">Help Center</FooterLink></LinkItem>
            <LinkItem><FooterLink href="#">FAQ</FooterLink></LinkItem>
            <LinkItem><FooterLink href="#">Contact Us</FooterLink></LinkItem>
            <LinkItem><FooterLink href="#">Privacy Policy</FooterLink></LinkItem>
            <LinkItem><FooterLink href="#">Terms of Service</FooterLink></LinkItem>
          </LinksList>
        </FooterColumn>
        
        <FooterColumn>
          <ColumnTitle>Contact Us</ColumnTitle>
          <ContactInfo>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 10C20 14.4183 16.4183 18 12 18C10.5937 18 9.27223 17.6372 8.12398 17C7.53381 16.6879 4 18 4 18C4 18 5.3121 14.4662 5 13.876C4.36283 12.7278 4 11.4063 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ContactIcon>
              <ContactText>hello@digitalagency.com</ContactText>
            </ContactItem>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ContactIcon>
              <ContactText>+1 (555) 123-4567</ContactText>
            </ContactItem>
            <ContactItem>
              <ContactIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.6569 16.6569C16.7202 17.5935 14.7616 19.5521 13.4138 20.8999C12.6327 21.681 11.3677 21.6814 10.5866 20.9003C9.26234 19.576 7.34159 17.6553 6.34315 16.6569C3.21895 13.5327 3.21895 8.46734 6.34315 5.34315C9.46734 2.21895 14.5327 2.21895 17.6569 5.34315C20.781 8.46734 20.781 13.5327 17.6569 16.6569Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ContactIcon>
              <ContactText>123 Marketing St, San Francisco, CA 94103</ContactText>
            </ContactItem>
          </ContactInfo>
        </FooterColumn>
      </FooterContent>
      
      <Divider />
      
      <BottomFooter>
        <Copyright> 2023 Digital Agency. All rights reserved.</Copyright>
        <BottomLinks>
          <BottomLink href="#">Privacy Policy</BottomLink>
          <BottomLink href="#">Terms of Service</BottomLink>
          <BottomLink href="#">Cookies Settings</BottomLink>
        </BottomLinks>
      </BottomFooter>
    </FooterContainer>
  );
};

export default Footer;
