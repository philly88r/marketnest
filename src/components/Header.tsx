import React, { useState } from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { isLoggedIn, isClient } from '../utils/authService';

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

const MobileMenuContainer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

// Mobile menu button styling

const MobileMenuButton = styled.div`
  width: 30px;
  height: 30px;
  display: none;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: flex;
  }
  
  span {
    width: 100%;
    height: 3px;
    background-color: white;
    border-radius: 3px;
    transition: all 0.3s ease;
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
  // Always use the non-home page header style
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [softwareDropdownOpen, setSoftwareDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const handleLogout = async () => {
    // Use the shared logout utility
    const { logout } = await import('../utils/authService');
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

  let clientPortalLink = '/client-login';
  if (isLoggedIn() && isClient()) {
    const clientUser = localStorage.getItem('client-user');
    if (clientUser) {
      const { id } = JSON.parse(clientUser);
      clientPortalLink = `/client-portal/${id}`;
    }
  }

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
            <RouterNavItem>Home</RouterNavItem>
          </RouterLink>
          <RouterLink to="/about" style={{ textDecoration: 'none' }}>
            <RouterNavItem>About</RouterNavItem>
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
            <RouterNavItem>Case Studies</RouterNavItem>
          </RouterLink>
          <RouterLink to="/blog" style={{ textDecoration: 'none' }}>
            <RouterNavItem>Blog</RouterNavItem>
          </RouterLink>
          <RouterLink to="/contact" style={{ textDecoration: 'none' }}>
            <RouterNavItem>Contact</RouterNavItem>
          </RouterLink>
          <RouterLink to={clientPortalLink} style={{ textDecoration: 'none' }}>
            <ClientPortalButton>Client Portal</ClientPortalButton>
          </RouterLink>
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
