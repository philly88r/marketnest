import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMoreVertical, FiImage, FiSearch, FiEdit, FiTrash2, FiDownload, FiCopy } from 'react-icons/fi';
import { supabase } from '../../utils/supabaseClient';

interface SavedLandingPagesProps {
  clientId?: string;
  onEdit?: (pageData: any) => void;
}

const SavedLandingPages: React.FC<SavedLandingPagesProps> = ({ clientId, onEdit }) => {
  const [savedPages, setSavedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: boolean }>({});
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedPages();
  }, [clientId]);

  const fetchSavedPages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching landing pages:', error);
        return;
      }
      
      setSavedPages(data || []);
    } catch (error) {
      console.error('Error in fetchSavedPages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = (pageId: string) => {
    setMenuAnchor(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
    setSelectedPageId(pageId);
  };

  const handleMenuClose = () => {
    setMenuAnchor({});
    setSelectedPageId(null);
  };

  const handleDeleteClick = (pageId: string) => {
    setPageToDelete(pageId);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;
    
    try {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', pageToDelete);
      
      if (error) {
        console.error('Error deleting landing page:', error);
        return;
      }
      
      setSavedPages(prev => prev.filter(page => page.id !== pageToDelete));
      setDeleteConfirmOpen(false);
      setPageToDelete(null);
    } catch (error) {
      console.error('Error in handleDeleteConfirm:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPageToDelete(null);
  };

  const handleEditClick = (page: any) => {
    if (onEdit) {
      onEdit(page);
    }
    handleMenuClose();
  };

  const handleDownloadClick = (page: any) => {
    // Implementation for downloading the landing page HTML
    handleMenuClose();
  };

  const handleCopyClick = (page: any) => {
    // Implementation for copying the landing page
    handleMenuClose();
  };

  const filteredPages = savedPages.filter(page => 
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>Saved Landing Pages</Title>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search landing pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
        </SearchContainer>
      </Header>

      {loading ? (
        <LoadingMessage>Loading saved landing pages...</LoadingMessage>
      ) : filteredPages.length === 0 ? (
        <EmptyMessage>
          {searchTerm ? 'No landing pages match your search.' : 'No saved landing pages yet.'}
        </EmptyMessage>
      ) : (
        <PageList>
          {filteredPages.map((page) => (
            <PageItem key={page.id}>
              <PageItemContent>
                <PageAvatar>
                  <FiImage size={24} />
                </PageAvatar>
                <PageInfo>
                  <PageName>{page.name}</PageName>
                  <PageDetails>
                    <BusinessName>{page.business_name}</BusinessName>
                    <PageDate>
                      {new Date(page.created_at).toLocaleDateString()}
                    </PageDate>
                  </PageDetails>
                </PageInfo>
                <MenuButton onClick={() => handleMenuToggle(page.id)}>
                  <FiMoreVertical />
                </MenuButton>
              </PageItemContent>

              {menuAnchor[page.id] && (
                <MenuPopup>
                  <MenuItem onClick={() => handleEditClick(page)}>
                    <FiEdit />
                    <span>Edit</span>
                  </MenuItem>
                  <MenuItem onClick={() => handleDownloadClick(page)}>
                    <FiDownload />
                    <span>Download HTML</span>
                  </MenuItem>
                  <MenuItem onClick={() => handleCopyClick(page)}>
                    <FiCopy />
                    <span>Duplicate</span>
                  </MenuItem>
                  <MenuItem onClick={() => handleDeleteClick(page.id)} className="delete">
                    <FiTrash2 />
                    <span>Delete</span>
                  </MenuItem>
                </MenuPopup>
              )}
            </PageItem>
          ))}
        </PageList>
      )}

      {deleteConfirmOpen && (
        <DialogOverlay>
          <DialogContent>
            <DialogTitle>Delete Landing Page</DialogTitle>
            <DialogText>
              Are you sure you want to delete this landing page? This action cannot be undone.
            </DialogText>
            <DialogActions>
              <Button secondary onClick={handleDeleteCancel}>Cancel</Button>
              <Button danger onClick={handleDeleteConfirm}>Delete</Button>
            </DialogActions>
          </DialogContent>
        </DialogOverlay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
  background: #f9f9f9;
  border-radius: 8px;
`;

const PageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PageItem = styled.li`
  position: relative;
  margin-bottom: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PageItemContent = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
`;

const PageAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #4a90e2;
`;

const PageInfo = styled.div`
  flex: 1;
`;

const PageName = styled.h3`
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 600;
`;

const PageDetails = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
`;

const BusinessName = styled.span`
  margin-right: 15px;
`;

const PageDate = styled.span`
  font-size: 12px;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const MenuPopup = styled.div`
  position: absolute;
  right: 15px;
  top: 60px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 180px;
`;

const MenuItem = styled.div`
  padding: 10px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  svg {
    margin-right: 10px;
    font-size: 16px;
  }
  
  &.delete {
    color: #e53935;
  }
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
`;

const DialogTitle = styled.h3`
  margin-top: 0;
  font-size: 18px;
`;

const DialogText = styled.p`
  color: #666;
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;

const Button = styled.button<{ secondary?: boolean; danger?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: ${props => props.danger ? '#e53935' : props.secondary ? '#f5f5f5' : '#4a90e2'};
  color: ${props => props.secondary ? '#333' : 'white'};
  
  &:hover {
    background-color: ${props => props.danger ? '#c62828' : props.secondary ? '#e0e0e0' : '#2979ff'};
  }
`;

export default SavedLandingPages;