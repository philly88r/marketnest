import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUsers, FiPieChart, FiSettings, FiLogOut, FiEdit, FiEye } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { renderIcon } from '../utils/iconUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClientList from '../components/ClientList';
import ClientDashboard from '../components/ClientDashboard';
import AdminChat from '../components/AdminChat';
import TestLibertyBeans from '../components/TestLibertyBeans';

// Mock admin data - in a real app, this would come from your backend
const adminUser = {
  name: 'Phillip Matthews',
  role: 'Administrator',
  avatar: '/avatar-placeholder.png'
};

const AdminPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'dashboard' | 'settings' | 'liberty-test'>('clients');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Add console logging for debugging
  useEffect(() => {
    if (selectedClientId) {
      console.log('Selected client ID in AdminPortalPage:', selectedClientId);
    }
  }, [selectedClientId]);
  
  // Special handler for Liberty Beans Coffee
  const handleLibertyBeansSelection = () => {
    console.log('Special handler for Liberty Beans Coffee triggered');
    setSelectedClientId('client-liberty-beans');
  };
  
  // Add a visible title to show we're in the admin portal
  const pageTitle = "ADMIN PORTAL $$$";

  const handleLogout = () => {
    // In a real app, you would clear authentication tokens here
    navigate('/admin-login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'clients':
        return selectedClientId ? (
          <ClientDashboard 
            clientId={selectedClientId} 
            onBack={() => setSelectedClientId(null)} 
          />
        ) : (
          <ClientList onSelectClient={(id) => {
            console.log('Client selected with ID:', id);
            // Special handling for Liberty Beans Coffee
            if (id === 'client-liberty-beans' || id === 'client-001') {
              console.log('Liberty Beans Coffee client detected, using special handler');
              handleLibertyBeansSelection();
            } else {
              // For other clients, update the state directly
              console.log('Updating selectedClientId state to:', id);
              setSelectedClientId(id);
            }
          }} />
        );
      case 'dashboard':
        return (
          <AdminDashboardContent>
            <h2>Admin Dashboard</h2>
            <p>Overview of all client metrics and agency performance coming soon.</p>
            <MetricsGrid>
              <MetricCard>
                <MetricTitle>Total Clients</MetricTitle>
                <MetricValue>4</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricTitle>Active Projects</MetricTitle>
                <MetricValue>12</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricTitle>Team Members</MetricTitle>
                <MetricValue>8</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricTitle>Avg. Client Satisfaction</MetricTitle>
                <MetricValue>4.8/5</MetricValue>
              </MetricCard>
            </MetricsGrid>
          </AdminDashboardContent>
        );
      case 'liberty-test':
        return <TestLibertyBeans />;
      case 'settings':
        return (
          <AdminSettingsContent>
            <h2>Admin Settings</h2>
            <p>Configure admin portal settings, user permissions, and notification preferences.</p>
            <SettingsForm>
              <FormGroup>
                <Label>Admin Email</Label>
                <Input type="email" defaultValue="phillip@marketnest.org" />
              </FormGroup>
              <FormGroup>
                <Label>Notification Preferences</Label>
                <CheckboxGroup>
                  <Checkbox>
                    <input type="checkbox" defaultChecked />
                    <span>New client messages</span>
                  </Checkbox>
                  <Checkbox>
                    <input type="checkbox" defaultChecked />
                    <span>Project status updates</span>
                  </Checkbox>
                  <Checkbox>
                    <input type="checkbox" defaultChecked />
                    <span>Task assignments</span>
                  </Checkbox>
                </CheckboxGroup>
              </FormGroup>
              <Button>Save Settings</Button>
            </SettingsForm>
          </AdminSettingsContent>
        );
      default:
        return null;
    }
  };

  return (
    <AdminPortalContainer>
      <Header />
      <h1 style={{ color: 'white', textAlign: 'center', marginTop: '20px', fontSize: '24px' }}>{pageTitle}</h1>
      <AdminContent>
        <AdminSidebar>
          <AdminProfile>
            <Avatar src={adminUser.avatar} alt={adminUser.name} />
            <ProfileInfo>
              <ProfileName>{adminUser.name}</ProfileName>
              <ProfileRole>{adminUser.role}</ProfileRole>
            </ProfileInfo>
          </AdminProfile>
          
          <NavMenu>
            <NavItem 
              $active={activeTab === 'clients'} 
              onClick={() => {
                setActiveTab('clients');
                setSelectedClientId(null);
              }}
            >
              {renderIcon(FiUsers)} Clients
            </NavItem>
            <NavItem 
              $active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            >
              {renderIcon(FiPieChart)} Dashboard
            </NavItem>
            <NavItem 
              $active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
            >
              {renderIcon(FiSettings)} Settings
            </NavItem>
            <NavItem
              $active={activeTab === 'liberty-test'}
              onClick={() => setActiveTab('liberty-test')}
              style={{ background: activeTab === 'liberty-test' ? 'rgba(255, 0, 0, 0.25)' : 'transparent' }}
            >
              {renderIcon(FiUsers)} Liberty Beans Test
            </NavItem>
          </NavMenu>
          
          <LogoutButton onClick={handleLogout}>
            {renderIcon(FiLogOut)} Logout
          </LogoutButton>
        </AdminSidebar>
        
        <MainContent>
          {renderContent()}
        </MainContent>
      </AdminContent>
      <Footer />
      
      {/* Add AdminChat component */}
      <AdminChat />
    </AdminPortalContainer>
  );
};

// Styled Components
const AdminPortalContainer = styled.div`
  background: #0f0f1a;
  min-height: 100vh;
  color: white;
`;

const AdminContent = styled.div`
  display: flex;
  padding-top: 120px;
  min-height: calc(100vh - 120px);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AdminSidebar = styled.div`
  width: 280px;
  background: rgba(0, 0, 0, 0.3);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 20px;
  }
`;

const AdminProfile = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  object-fit: cover;
  margin-right: 15px;
  background: rgba(255, 255, 255, 0.1);
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileName = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const ProfileRole = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const NavMenu = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const NavItem = styled.button<{ $active: boolean }>`
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: ${props => props.$active ? '600' : '400'};
  background: ${props => props.$active ? 'rgba(31, 83, 255, 0.15)' : 'transparent'};
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
  transition: all 0.2s ease;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 16px;
  
  svg {
    margin-right: 12px;
    font-size: 18px;
  }
  
  &:hover {
    background: ${props => props.$active ? 'rgba(31, 83, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(31, 83, 255, 0.5);
  }
`;

const LogoutButton = styled.button`
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  margin-top: auto;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 16px;
  
  svg {
    margin-right: 12px;
    font-size: 18px;
  }
  
  &:hover {
    background: rgba(255, 67, 163, 0.1);
    color: #FF43A3;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 67, 163, 0.5);
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const AdminDashboardContent = styled.div`
  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 28px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 30px;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
`;

const MetricTitle = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 600;
`;

const AdminSettingsContent = styled.div`
  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 28px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 30px;
  }
`;

const SettingsForm = styled.form`
  max-width: 600px;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 10px;
  }
  
  span {
    font-size: 15px;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(31, 83, 255, 0.3);
  }
`;

export default AdminPortalPage;
