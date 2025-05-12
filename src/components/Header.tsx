import React, { useState } from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { isLoggedIn, isClient, logout } from '../utils/authService';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 30px 60px 30px 60px; /* Reduced right padding to shift content left */
  display: flex;
  justify-content: flex-start; /* Changed from space-between to flex-start */
  align-items: center;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  
  @media (max-width: 1200px) {
    padding: 30px 40px 30px 60px;
  }
  
  @media (max-width: 992px) {
    padding: 20px 30px 20px 40px;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    justify-content: space-between; /* Keep space-between for mobile */
  }
`;

const Logo = styled.div`
  width: auto;
  height: 100px; /* Increased from 80px to 100px */
  display: flex;
  align-items: center;
  margin-right: 60px;
  position: relative;
  
  @media (max-width: 768px) {
    height: 70px; /* Increased from 60px to 70px */
    margin-right: 20px;
  }
`;

const LogoImage = styled.img`
  height: 100%;
  width: auto;
  object-fit: contain;
  position: relative;
  z-index: 2;
  background: transparent; /* Ensure no background */
  filter: drop-shadow(0px 0px 8px rgba(31, 83, 255, 0.4)); /* Enhanced shadow with brand color */
  transform: scale(1.1); /* Make the logo slightly larger */
`;

const NavContainer = styled.nav`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 60px;
  
  @media (max-width: 1200px) {
    gap: 40px;
  }
  
  @media (max-width: 992px) {
    gap: 30px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #FF43A3;
  }
  
  @media (max-width: 992px) {
    font-size: 16px;
  }
`;

const RouterNavItem = styled(NavItem)`
  text-decoration: none;
`;

const ClientPortalButton = styled.button`
  padding: 10px 20px;
  background: rgba(13, 249, 182, 0.2);
  border: 1px solid #0df9b6;
  border-radius: 30px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(13, 249, 182, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(13, 249, 182, 0.2);
  }
`;

const QuestionnaireButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(90deg, rgba(31, 83, 255, 0.2) 0%, rgba(255, 67, 163, 0.2) 100%);
  border: 1px solid transparent;
  border-image: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  border-image-slice: 1;
  border-radius: 30px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 15px;
  
  &:hover {
    background: linear-gradient(90deg, rgba(31, 83, 255, 0.3) 0%, rgba(255, 67, 163, 0.3) 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(31, 83, 255, 0.2);
  }
  
  @media (max-width: 992px) {
    margin-left: 10px;
    padding: 8px 16px;
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.div`
  display: none; 
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 101; 

  span {
    width: 30px;
    height: 3px;
    background: white;
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;
  }

  @media (max-width: 1100px) { 
    display: flex;
  }
`;

const MobileMenuContainer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99;
  transform: translateY(${props => props.$isOpen ? '0' : '-100%'});
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: all 0.5s ease;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavItem = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 30px;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #FF43A3;
  }
`;

const CloseButton = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 3px;
    background-color: white;
    border-radius: 3px;
    top: 50%;
    left: 0;
  }
  
  &::before {
    transform: rotate(45deg);
  }
  
  &::after {
    transform: rotate(-45deg);
  }
`;

const ServicesDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 280px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 10;
  margin-top: 15px;
`;

const DropdownItem = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #FF43A3;
  }
`;

const MobileServicesSubmenu = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MobileSubmenuItem = styled.div`
  color: white;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #FF43A3;
  }
`;

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [softwareDropdownOpen, setSoftwareDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const clientPortalLink = isLoggedIn() && isClient() ? '/client-portal/client-001' : '/client-login';
  
  const handleQuestionnaireClick = () => {
    navigate('/project-questionnaire');
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/client-login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleServicesDropdown = () => {
    setServicesDropdownOpen(!servicesDropdownOpen);
  };
  
  const toggleSoftwareDropdown = () => {
    setSoftwareDropdownOpen(!softwareDropdownOpen);
  };

  return (
    <HeaderContainer>
      <RouterLink to="/">
        <Logo>
          <LogoImage 
            src="/logo.svg" 
            alt="MarketNest Logo" 
          />
        </Logo>
      </RouterLink>
      
      <NavContainer>
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <NavItem>Home</NavItem>
          </RouterLink>
          <RouterLink to="/about" style={{ textDecoration: 'none' }}>
            <NavItem>About</NavItem>
          </RouterLink>
          <div style={{ position: 'relative' }}>
            <NavItem 
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              Services
              {servicesDropdownOpen && (
                <ServicesDropdown>
                  <RouterLink to="/services/seo" style={{ textDecoration: 'none' }}>
                    <DropdownItem>SEO Services</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/services/ppc" style={{ textDecoration: 'none' }}>
                    <DropdownItem>PPC Advertising</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/services/social-media" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Social Media Marketing</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/services/content-marketing" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Content Marketing</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/services/content-writing" style={{ textDecoration: 'none' }}>
                    <DropdownItem>AI Content Writing</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/services/email-marketing" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Email Marketing</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/services/web-design" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Web Design & Development</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/services/analytics-reporting" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Analytics & Reporting</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/services/conversion-optimization" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Conversion Rate Optimization</DropdownItem>
                  </RouterLink>
                </ServicesDropdown>
              )}
            </NavItem>
          </div>
          <div style={{ position: 'relative' }}>
            <NavItem 
              onMouseEnter={() => setSoftwareDropdownOpen(true)}
              onMouseLeave={() => setSoftwareDropdownOpen(false)}
            >
              Business Software
              {softwareDropdownOpen && (
                <ServicesDropdown>
                  <RouterLink to="/business-software" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Overview</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/business-software/ai-agents" style={{ textDecoration: 'none' }}>
                    <DropdownItem>AI Agents</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/image-generation" style={{ textDecoration: 'none' }}>
                    <DropdownItem>AI Image Generation</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/business-software/automation" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Business Automation</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/business-software/crm-solutions" style={{ textDecoration: 'none' }}>
                    <DropdownItem>CRM Solutions</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/business-software/erp-solutions" style={{ textDecoration: 'none' }}>
                    <DropdownItem>ERP Solutions</DropdownItem>
                  </RouterLink>
                  <RouterLink to="/business-software/database-management" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Database Management</DropdownItem>
                  </RouterLink>
                </ServicesDropdown>
              )}
            </NavItem>
          </div>
          <RouterLink to="/case-studies" style={{ textDecoration: 'none' }}>
            <NavItem>Case Studies</NavItem>
          </RouterLink>
          <RouterLink to="/blog" style={{ textDecoration: 'none' }}>
            <NavItem>Blog</NavItem>
          </RouterLink>
          <RouterLink to="/contact" style={{ textDecoration: 'none' }}>
            <NavItem>Contact</NavItem>
          </RouterLink>
          <RouterLink to={clientPortalLink} style={{ textDecoration: 'none' }}>
            <ClientPortalButton>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#0df9b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#0df9b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Client Portal
            </ClientPortalButton>
          </RouterLink>
          <QuestionnaireButton onClick={handleQuestionnaireClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradient" x1="3" y1="10.5" x2="21" y2="10.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1F53FF"/>
                  <stop offset="1" stopColor="#FF43A3"/>
                </linearGradient>
              </defs>
              <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V12" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12H12" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 16H16" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 7L21 4M21 4L18 1M21 4H15" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Project Questionnaire
          </QuestionnaireButton>
          {isLoggedIn() && isClient() && (
            <ClientPortalButton onClick={handleLogout} style={{ marginLeft: 24 }}>
              Logout
            </ClientPortalButton>
          )}
      </NavContainer>
      
      <MobileMenuContainer>
        <MobileMenuButton onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </MobileMenuButton>
      </MobileMenuContainer>
      
      <MobileMenu $isOpen={mobileMenuOpen}>
        <CloseButton onClick={toggleMobileMenu} />
        <>
          <RouterLink to="/" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
            <MobileNavItem>Home</MobileNavItem>
          </RouterLink>
          <RouterLink to="/about" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
            <MobileNavItem>About</MobileNavItem>
          </RouterLink>
          <div>
            <MobileNavItem onClick={toggleServicesDropdown}>
              Services {servicesDropdownOpen ? '▲' : '▼'}
            </MobileNavItem>
            {servicesDropdownOpen && (
              <MobileServicesSubmenu>
                <RouterLink to="/services/seo" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>SEO Services</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/services/ppc" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>PPC Advertising</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/services/social-media" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Social Media Marketing</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/services/content-marketing" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Content Marketing</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/services/content-writing" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>AI Content Writing</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/services/email-marketing" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Email Marketing</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/services/web-design" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Web Design & Development</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/services/analytics-reporting" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Analytics & Reporting</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/services/conversion-optimization" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Conversion Rate Optimization</MobileSubmenuItem>
                </RouterLink>
              </MobileServicesSubmenu>
            )}
          </div>
          <div>
            <MobileNavItem onClick={toggleSoftwareDropdown}>
              Business Software {softwareDropdownOpen ? '▲' : '▼'}
            </MobileNavItem>
            {softwareDropdownOpen && (
              <MobileServicesSubmenu>
                <RouterLink to="/business-software" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Overview</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/business-software/ai-agents" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>AI Agents</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/image-generation" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>AI Image Generation</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/business-software/automation" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Business Automation</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/business-software/crm-solutions" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>CRM Solutions</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/business-software/erp-solutions" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>ERP Solutions</MobileSubmenuItem>
                </RouterLink>
                <RouterLink to="/business-software/database-management" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                  <MobileSubmenuItem>Database Management</MobileSubmenuItem>
                </RouterLink>
              </MobileServicesSubmenu>
            )}
          </div>
          <RouterLink to="/case-studies" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
            <MobileNavItem>Case Studies</MobileNavItem>
          </RouterLink>
          <RouterLink to="/blog" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
            <MobileNavItem>Blog</MobileNavItem>
          </RouterLink>
          <RouterLink to="/contact" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
            <MobileNavItem>Contact</MobileNavItem>
          </RouterLink>
          <RouterLink to={clientPortalLink} style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
            <MobileNavItem style={{ color: '#0df9b6' }}>Client Portal</MobileNavItem>
          </RouterLink>
          <MobileNavItem 
            onClick={handleQuestionnaireClick}
            style={{ 
              background: 'linear-gradient(90deg, rgba(31, 83, 255, 0.2) 0%, rgba(255, 67, 163, 0.2) 100%)',
              padding: '10px 20px',
              borderRadius: '30px',
              marginTop: '10px',
              textAlign: 'center'
            }}
          >
            Project Questionnaire
          </MobileNavItem>
          {isLoggedIn() && isClient() && (
            <MobileNavItem onClick={handleLogout} style={{ color: '#0df9b6' }}>
              Logout
            </MobileNavItem>
          )}
        </>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
