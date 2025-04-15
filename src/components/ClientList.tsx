import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiEdit, FiEye, FiSearch, FiPlus } from 'react-icons/fi';

// Mock client data - in a real app, this would come from your backend
export const mockClients = [
  {
    id: 'client-001',
    name: 'Liberty Beans Coffee',
    logo: '/client-logos/liberty-beans.png',
    industry: 'Food & Beverage',
    contactName: 'Liberty Beans',
    contactEmail: 'info@libertybeans.com',
    contactPhone: '(919) 555-1234',
    activeProjects: 3,
    status: 'active',
    username: 'libertybeans',
    password: 'coffee2025'
  },
  {
    id: 'client-002',
    name: 'ProTech Carpet Care',
    logo: '/client-logos/protech.png',
    industry: 'Home Services',
    contactName: 'ProTech Team',
    contactEmail: 'service@protechcarpet.com',
    contactPhone: '(919) 555-5678',
    activeProjects: 2,
    status: 'active',
    username: 'protech',
    password: 'carpet2025'
  },
  {
    id: 'client-003',
    name: 'STFD Fence',
    logo: '/client-logos/stfd.png',
    industry: 'Construction',
    contactName: 'STFD Team',
    contactEmail: 'info@stfdfence.com',
    contactPhone: '(919) 555-9012',
    activeProjects: 4,
    status: 'active',
    username: 'stfdfence',
    password: 'fence2025'
  },
  {
    id: 'client-004',
    name: 'Altare',
    logo: '/client-logos/altare.png',
    industry: 'Technology',
    contactName: 'Altare Team',
    contactEmail: 'contact@altare.tech',
    contactPhone: '(919) 555-3456',
    activeProjects: 3,
    status: 'active',
    username: 'altare',
    password: 'tech2025'
  }
];

interface ClientListProps {
  onSelectClient: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  
  const filteredClients = mockClients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleCredentials = (clientId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };
  
  return (
    <ClientListContainer>
      <ClientListHeader>
        <h2>Client Management</h2>
        <SearchContainer>
          <SearchIcon>
            {React.createElement(FiSearch)}
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="Search clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <AddClientButton>
          + Add New Client
        </AddClientButton>
      </ClientListHeader>
      
      <ClientTable>
        <ClientTableHeader>
          <ClientHeaderCell width="30%">Client</ClientHeaderCell>
          <ClientHeaderCell width="15%">Industry</ClientHeaderCell>
          <ClientHeaderCell width="15%">Contact</ClientHeaderCell>
          <ClientHeaderCell width="10%">Projects</ClientHeaderCell>
          <ClientHeaderCell width="15%">Credentials</ClientHeaderCell>
          <ClientHeaderCell width="15%">Actions</ClientHeaderCell>
        </ClientTableHeader>
        
        {filteredClients.map(client => (
          <ClientRow key={client.id}>
            <ClientCell width="30%">
              <ClientInfo>
                <ClientLogo>
                  {client.name.charAt(0)}
                </ClientLogo>
                <ClientName>{client.name}</ClientName>
              </ClientInfo>
            </ClientCell>
            <ClientCell width="15%">{client.industry}</ClientCell>
            <ClientCell width="15%">
              <ContactInfo>
                <div>{client.contactName}</div>
                <ContactEmail>{client.contactEmail}</ContactEmail>
              </ContactInfo>
            </ClientCell>
            <ClientCell width="10%">
              <ProjectCount>{client.activeProjects}</ProjectCount>
            </ClientCell>
            <ClientCell width="15%">
              <CredentialsContainer>
                <CredentialsInfo>
                  <div>Username: {client.username}</div>
                  <PasswordField>
                    Password: {showCredentials[client.id] ? client.password : '••••••••'}
                  </PasswordField>
                </CredentialsInfo>
                <ShowPasswordButton onClick={() => toggleCredentials(client.id)}>
                  {showCredentials[client.id] ? 'Hide' : 'Show'}
                </ShowPasswordButton>
              </CredentialsContainer>
            </ClientCell>
            <ClientCell width="15%">
              <ActionButtons>
                <ActionButton onClick={() => onSelectClient(client.id)}>
                  {React.createElement(FiEye)} View
                </ActionButton>
                <ActionButton>
                  {React.createElement(FiEdit)} Edit
                </ActionButton>
              </ActionButtons>
            </ClientCell>
          </ClientRow>
        ))}
      </ClientTable>
    </ClientListContainer>
  );
};

// Styled Components
const ClientListContainer = styled.div``;

const ClientListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
  
  h2 {
    margin: 0;
    font-size: 28px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    h2 {
      margin-bottom: 15px;
    }
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const AddClientButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(31, 83, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ClientTable = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    overflow-x: auto;
  }
`;

const ClientTableHeader = styled.div`
  display: flex;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  min-width: 900px;
`;

const ClientHeaderCell = styled.div<{ width: string }>`
  width: ${props => props.width};
  padding: 0 10px;
`;

const ClientRow = styled.div`
  display: flex;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
  min-width: 900px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ClientCell = styled.div<{ width: string }>`
  width: ${props => props.width};
  padding: 0 10px;
  display: flex;
  align-items: center;
`;

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ClientLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1F53FF, #FF43A3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 15px;
  color: white;
`;

const ClientName = styled.div`
  font-weight: 600;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
`;

const ContactEmail = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  margin-top: 3px;
`;

const ProjectCount = styled.div`
  background: rgba(31, 83, 255, 0.15);
  color: #1F53FF;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
`;

const CredentialsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CredentialsInfo = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
`;

const PasswordField = styled.div`
  margin-top: 3px;
`;

const ShowPasswordButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  &:first-child {
    background: rgba(31, 83, 255, 0.15);
    color: #1F53FF;
    
    &:hover {
      background: rgba(31, 83, 255, 0.25);
    }
  }
`;

export default ClientList;
