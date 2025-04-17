import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTrash2, FiCalendar, FiUser, FiPlus } from 'react-icons/fi';
import {
  getChecklistItemsByClientId,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  ChecklistItem
} from '../utils/clientService';
import { getCurrentUser } from '../utils/authService';

interface ClientChecklistProps {
  clientId: string;
  projectId?: string;
}

const ClientChecklist: React.FC<ClientChecklistProps> = ({ clientId, projectId }) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [newItemAssignee, setNewItemAssignee] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  // Load checklist items
  useEffect(() => {
    const loadChecklist = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const items = await getChecklistItemsByClientId(clientId, projectId || null);
        setChecklist(items);
      } catch (err) {
        console.error('Error loading checklist:', err);
        setError('Failed to load checklist. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChecklist();
  }, [clientId, projectId]);
  
  // Handle adding a new checklist item
  const handleAddItem = async () => {
    if (!newItemText.trim()) return;
    
    try {
      const user = getCurrentUser();
      const userId = user?.id || 'anonymous';
      
      const newItem = await createChecklistItem({
        content: newItemText,
        is_completed: false,
        client_id: clientId,
        project_id: projectId || null,
        due_date: newItemDueDate || null,
        assignee: newItemAssignee || null,
        created_by: userId
      });
      
      setChecklist(prev => [...prev, newItem]);
      setNewItemText('');
      setNewItemDueDate('');
      setNewItemAssignee('');
      setIsAddingItem(false);
    } catch (err) {
      console.error('Error adding checklist item:', err);
      setError('Failed to add checklist item. Please try again.');
    }
  };
  
  // Handle toggling a checklist item
  const handleToggleItem = async (item: ChecklistItem) => {
    try {
      const updatedItem = await updateChecklistItem(item.id, {
        is_completed: !item.is_completed
      });
      
      setChecklist(prev => 
        prev.map(i => i.id === updatedItem.id ? updatedItem : i)
      );
    } catch (err) {
      console.error('Error updating checklist item:', err);
      setError('Failed to update checklist item. Please try again.');
    }
  };
  
  // Handle deleting a checklist item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteChecklistItem(itemId);
      setChecklist(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting checklist item:', err);
      setError('Failed to delete checklist item. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <ChecklistContainer>
      <ChecklistHeader>
        <h3>Checklist</h3>
        <AddItemButton onClick={() => setIsAddingItem(true)}>
          <FiPlus /> Add Item
        </AddItemButton>
      </ChecklistHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {isAddingItem && (
        <AddItemForm>
          <InputGroup>
            <input
              type="text"
              placeholder="Task description"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              autoFocus
            />
          </InputGroup>
          <InputGroup>
            <InputWithIcon>
              <FiCalendar />
              <input
                type="date"
                placeholder="Due date (optional)"
                value={newItemDueDate}
                onChange={(e) => setNewItemDueDate(e.target.value)}
              />
            </InputWithIcon>
          </InputGroup>
          <InputGroup>
            <InputWithIcon>
              <FiUser />
              <input
                type="text"
                placeholder="Assignee (optional)"
                value={newItemAssignee}
                onChange={(e) => setNewItemAssignee(e.target.value)}
              />
            </InputWithIcon>
          </InputGroup>
          <AddItemActions>
            <ActionButton onClick={handleAddItem}>Add</ActionButton>
            <CancelButton onClick={() => setIsAddingItem(false)}>Cancel</CancelButton>
          </AddItemActions>
        </AddItemForm>
      )}
      
      {isLoading ? (
        <LoadingMessage>Loading checklist...</LoadingMessage>
      ) : (
        <ChecklistItems>
          {checklist.length === 0 ? (
            <EmptyMessage>No checklist items yet. Add your first item above.</EmptyMessage>
          ) : (
            <>
              {checklist.map(item => (
                <ChecklistItem key={item.id}>
                  <CheckboxContainer onClick={() => handleToggleItem(item)}>
                    <Checkbox $checked={item.is_completed}>
                      {item.is_completed && <FiCheck />}
                    </Checkbox>
                    <ItemText $completed={item.is_completed}>
                      {item.content}
                    </ItemText>
                  </CheckboxContainer>
                  <ItemDetails>
                    {item.due_date && (
                      <ItemDetail>
                        <FiCalendar /> {formatDate(item.due_date)}
                      </ItemDetail>
                    )}
                    {item.assignee && (
                      <ItemDetail>
                        <FiUser /> {item.assignee}
                      </ItemDetail>
                    )}
                    <DeleteButton onClick={() => handleDeleteItem(item.id)}>
                      <FiTrash2 />
                    </DeleteButton>
                  </ItemDetails>
                </ChecklistItem>
              ))}
            </>
          )}
        </ChecklistItems>
      )}
    </ChecklistContainer>
  );
};

// Styled Components
const ChecklistContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const ChecklistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
`;

const AddItemButton = styled.button`
  background: rgba(13, 249, 182, 0.1);
  border: 1px solid rgba(13, 249, 182, 0.3);
  color: #0df9b6;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(13, 249, 182, 0.2);
  }
`;

const AddItemForm = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  margin-bottom: 10px;
  
  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 10px 12px;
    color: white;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: rgba(13, 249, 182, 0.5);
    }
  }
`;

const InputWithIcon = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
  }
  
  input {
    padding-left: 35px;
  }
`;

const AddItemActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const ActionButton = styled.button`
  background: rgba(13, 249, 182, 0.2);
  color: #0df9b6;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(13, 249, 182, 0.3);
  }
`;

const CancelButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ChecklistItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChecklistItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  flex: 1;
`;

const Checkbox = styled.div<{ $checked: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 2px solid ${props => props.$checked ? '#0df9b6' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.$checked ? 'rgba(13, 249, 182, 0.2)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #0df9b6;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.$checked ? '#0df9b6' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const ItemText = styled.div<{ $completed: boolean }>`
  font-size: 15px;
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  color: ${props => props.$completed ? 'rgba(255, 255, 255, 0.5)' : 'white'};
`;

const ItemDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ItemDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ff3b30;
    background: rgba(255, 59, 48, 0.1);
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.5);
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
`;

const ErrorMessage = styled.div`
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
`;

export default ClientChecklist;
