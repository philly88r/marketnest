import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiEdit, FiEye, FiSearch, FiPlus } from 'react-icons/fi';
import { renderIcon } from '../utils/iconUtils';
import { supabase } from '../utils/supabaseClient';

// Client interface for type safety
// Real data will be fetched from Supabase

interface Client {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  activeProjects: number;
  status: string;
  username: string;
  password: string;
}

interface ClientListProps {
  onSelectClient: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch clients from Supabase on mount
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('clients').select('*');
        if (error) throw error;
        if (data) {
          console.log('Fetched clients:', data);
          // Check if Liberty Beans Coffee exists with the new ID
          const libertyBeansClient = data.find(client => 
            client.name.includes('Liberty Beans') || 
            client.id === 'client-liberty-beans'
          );
          
          if (libertyBeansClient) {
            console.log('Found Liberty Beans client:', libertyBeansClient);
          } else {
            console.log('Liberty Beans client not found in database');
          }
          
          setClients(data);
        }
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        // Show error instead of using mock data
        setError('Failed to load clients. Please try again.');
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCredentials = (clientId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  // Modal handlers
  const openAddModal = () => {
    setModalMode('add');
    setForm({});
    setEditingClient(null);
    setShowModal(true);
    setError(null);
  };
  const openEditModal = (client: Client) => {
    setModalMode('edit');
    setForm(client);
    setEditingClient(client);
    setShowModal(true);
    setError(null);
  };
  const closeModal = () => {
    setShowModal(false);
    setForm({});
    setEditingClient(null);
    setError(null);
  };

  // Add or edit client in Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modalMode === 'add') {
        const { data, error } = await supabase.from('clients').insert([form]);
        if (error) throw error;
        setClients(prev => [...prev, ...(data || [])]);
      } else if (modalMode === 'edit' && editingClient) {
        const { data, error } = await supabase.from('clients').update(form).eq('id', editingClient.id);
        if (error) throw error;
        setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...form } as Client : c));
      }
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientListContainer>
      <ClientListHeader>
        <h2>Client Management</h2>
        <SearchContainer>
          <SearchIcon>
            {renderIcon(FiSearch)}
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="Search clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <AddClientButton onClick={openAddModal}>
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
                <ClientName>{client.name.includes('Liberty Beans') ? `${client.name} $$$` : client.name}</ClientName>
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
                  {renderIcon(FiEye)}
                </ShowPasswordButton>
              </CredentialsContainer>
            </ClientCell>
            <ClientCell width="15%">
              {client.name.includes('Liberty Beans') || client.id === 'client-liberty-beans' ? (
                <>
                  <ActionButton 
                    onClick={() => {
                      console.log('Liberty Beans Edit clicked', client);
                      try {
                        openEditModal(client);
                      } catch (err) {
                        console.error('Error opening edit modal:', err);
                      }
                    }}
                    style={{ background: 'rgba(31, 83, 255, 0.25)', cursor: 'pointer' }}
                  >
                    {renderIcon(FiEdit)} Edit
                  </ActionButton>
                  <ActionButton 
                    onClick={() => {
                      console.log('Liberty Beans View clicked');
                      try {
                        // Call onSelectClient directly with the Liberty Beans ID
                        // Add a delay to ensure the state update completes
                        setTimeout(() => {
                          onSelectClient('client-liberty-beans');
                        }, 100);
                      } catch (err) {
                        console.error('Error selecting client:', err);
                      }
                    }}
                    style={{ 
                      background: 'rgba(255, 0, 0, 0.25)', 
                      cursor: 'pointer',
                      padding: '10px 15px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                      transform: 'scale(1.05)'
                    }}
                  >
                    {renderIcon(FiEye)} View
                  </ActionButton>
                </>
              ) : (
                <>
                  <ActionButton onClick={() => openEditModal(client)}>{renderIcon(FiEdit)} Edit</ActionButton>
                  <ActionButton onClick={() => onSelectClient(client.id)}>{renderIcon(FiEye)} View</ActionButton>
                </>
              )}
            </ClientCell>
          </ClientRow>
        ))}
      </ClientTable>
      {/* Modal for Add/Edit Client */}
      {showModal && (
        <ModalOverlay>
          <ModalContent as={motion.div} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <ModalTitle>{modalMode === 'add' ? 'Add New Client' : 'Edit Client'}</ModalTitle>
            <form onSubmit={handleSubmit}>
              <ModalFormGroup>
                <label>Name</label>
                <input type="text" required value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </ModalFormGroup>
              <ModalFormGroup>
                <label>Industry</label>
                <input type="text" required value={form.industry || ''} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
              </ModalFormGroup>
              <ModalFormGroup>
                <label>Contact Name</label>
                <input type="text" required value={form.contactName || ''} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
              </ModalFormGroup>
              <ModalFormGroup>
                <label>Contact Email</label>
                <input type="email" required value={form.contactEmail || ''} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
              </ModalFormGroup>
              <ModalFormGroup>
                <label>Contact Phone</label>
                <input type="text" required value={form.contactPhone || ''} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
              </ModalFormGroup>
              <ModalFormGroup>
                <label>Username</label>
                <input type="text" required value={form.username || ''} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </ModalFormGroup>
              <ModalFormGroup>
                <label>Password</label>
                <input type="text" required value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </ModalFormGroup>
              <ModalFormGroup>
                <label>Status</label>
                <select required value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </ModalFormGroup>
              <ModalFormGroup>
                <label>Active Projects</label>
                <input type="number" required value={form.activeProjects || 0} onChange={e => setForm(f => ({ ...f, activeProjects: parseInt(e.target.value, 10) }))} />
              </ModalFormGroup>
              {error && <ErrorText>{error}</ErrorText>}
              <ModalButtonGroup>
                <ModalButton type="submit" disabled={loading}>{modalMode === 'add' ? 'Add Client' : 'Save Changes'}</ModalButton>
                <ModalButton type="button" onClick={closeModal}>Cancel</ModalButton>
              </ModalButtonGroup>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #1F1F1F;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 10px;
`;

const ModalFormGroup = styled.div`
  margin-bottom: 15px;
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ErrorText = styled.div`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;

export default ClientList;
