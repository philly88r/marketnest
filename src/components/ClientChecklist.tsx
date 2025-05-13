import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTrash2, FiCalendar, FiUser, FiPlus } from 'react-icons/fi';
import {
  getChecklistItemsByClientId,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  type ChecklistItem
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
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Load checklist items
  useEffect(() => {
    const loadChecklist = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching checklist items for client:', clientId);
        try {
          const items = await getChecklistItemsByClientId(clientId, projectId || null);
          console.log('Fetched checklist items:', items);
          setChecklist(items);
        } catch (fetchErr) {
          console.error('Error fetching checklist items:', fetchErr);
          // Show error but don't crash the component
          setError('Unable to load checklist items from the server. Please refresh to try again.');
          // Set empty array to prevent undefined errors
          setChecklist([]);
        }
      } catch (err) {
        console.error('Unexpected error loading checklist:', err);
        // Set empty array to prevent undefined errors
        setChecklist([]);
        setError('Failed to load checklist. Please refresh the page.');
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
      
      // Create a temporary item with a temporary ID for optimistic UI update
      const tempId = `temp-${Date.now()}`;
      const tempItem: ChecklistItem = {
        id: tempId,
        content: newItemText,
        is_completed: false,
        client_id: clientId,
        project_id: projectId || null,
        due_date: newItemDueDate || null,
        assigned_to: newItemAssignee || null,
        created_by: userId,
        created_at: new Date().toISOString()
      };
      
      // Optimistically update the UI first
      setChecklist(prev => [tempItem, ...prev]);
      
      // Clear form fields immediately to improve UX
      setNewItemText('');
      setNewItemDueDate('');
      setNewItemAssignee('');
      setIsAddingItem(false);
      
      // Then perform the actual create in the database
      try {
        console.log('Creating new checklist item with data:', {
          content: tempItem.content,
          is_completed: tempItem.is_completed,
          client_id: tempItem.client_id,
          project_id: tempItem.project_id,
          due_date: tempItem.due_date,
          assigned_to: tempItem.assigned_to,
          created_by: tempItem.created_by
        });
        
        const newItem = await createChecklistItem({
          content: tempItem.content,
          is_completed: tempItem.is_completed,
          client_id: tempItem.client_id,
          project_id: tempItem.project_id,
          due_date: tempItem.due_date,
          assigned_to: tempItem.assigned_to,
          created_by: tempItem.created_by
        });
        
        console.log('Successfully created checklist item:', newItem);
        
        // Replace the temporary item with the real one from the server
        setChecklist(prev => {
          const updated = prev.map(item => 
            item.id === tempId ? newItem : item
          );
          console.log('Updated checklist state:', updated);
          return updated;
        });
      } catch (createErr) {
        console.error('Error creating checklist item:', createErr);
        // Keep the optimistic update in the UI to prevent blank screen
        setError('Item may not have been saved to the server. Please refresh to verify.');
      }
    } catch (err) {
      console.error('Unexpected error in handleAddItem:', err);
      // Don't throw - this prevents blank screen
      setError('An error occurred. Your changes may not be saved.');
    }
  };
  
  // Handle toggling a checklist item
  const handleToggleItem = async (item: ChecklistItem) => {
    try {
      // Create a copy of the current checklist for potential rollback
      const previousChecklist = [...checklist];
      
      // Optimistically update the UI first
      setChecklist(prev => 
        prev.map(i => i.id === item.id ? { ...i, is_completed: !i.is_completed } : i)
      );
      
      // Then perform the actual update in the database
      try {
        const updatedItem = await updateChecklistItem(item.id, {
          is_completed: !item.is_completed
        });
        
        // Update with the server response if successful
        setChecklist(prev => 
          prev.map(i => i.id === updatedItem.id ? updatedItem : i)
        );
      } catch (updateErr) {
        console.error('Error updating checklist item:', updateErr);
        // Keep the optimistic update in the UI to prevent blank screen
        setError('Changes may not have been saved to the server. Please refresh to verify.');
      }
    } catch (err) {
      console.error('Unexpected error in handleToggleItem:', err);
      // Don't throw or reset the UI - this prevents blank screen
      setError('An error occurred. Your changes may not be saved.');
    }
  };
  
  // Handle deleting a checklist item
  const handleDeleteItem = async (itemId: string) => {
    try {
      // Store the current checklist for potential rollback
      const previousChecklist = [...checklist];
      
      // Optimistically update the UI first
      setChecklist(prev => prev.filter(item => item.id !== itemId));
      
      // Then perform the actual delete in the database
      try {
        await deleteChecklistItem(itemId);
      } catch (deleteErr) {
        console.error('Error deleting checklist item:', deleteErr);
        // Keep the optimistic update in the UI to prevent blank screen
        setError('Item may not have been deleted from the server. Please refresh to verify.');
      }
    } catch (err) {
      console.error('Unexpected error in handleDeleteItem:', err);
      // Don't throw - this prevents blank screen
      setError('An error occurred. Your changes may not be saved.');
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
        <div>
          <h3>Task Checklist</h3>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '5px' }}>
            {checklist.filter(item => item.is_completed).length} of {checklist.length} tasks completed
          </div>
        </div>
        
        <AddButton onClick={() => setIsAddingItem(true)}>
          <FiPlus /> Add Task
        </AddButton>
      </ChecklistHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FilterTabs>
        <FilterTab 
          $active={filterMode === 'all'} 
          onClick={() => setFilterMode('all')}
        >
          All ({checklist.length})
        </FilterTab>
        <FilterTab 
          $active={filterMode === 'pending'} 
          onClick={() => setFilterMode('pending')}
        >
          Pending ({checklist.filter(item => !item.is_completed).length})
        </FilterTab>
        <FilterTab 
          $active={filterMode === 'completed'} 
          onClick={() => setFilterMode('completed')}
        >
          Completed ({checklist.filter(item => item.is_completed).length})
        </FilterTab>
      </FilterTabs>
      
      <AnimatePresence>
        {isAddingItem && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AddItemForm>
              <InputGroup>
                <input
                  type="text"
                  placeholder="Enter task description..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  autoFocus
                />
              </InputGroup>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <InputGroup style={{ flex: 1 }}>
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
                
                <InputGroup style={{ flex: 1 }}>
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
              </div>
              
              <AddItemActions>
                <ActionButton onClick={handleAddItem}>Add Task</ActionButton>
                <CancelButton onClick={() => {
                  setIsAddingItem(false);
                  setNewItemText('');
                  setNewItemDueDate('');
                  setNewItemAssignee('');
                }}>Cancel</CancelButton>
              </AddItemActions>
            </AddItemForm>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isLoading ? (
        <LoadingMessage>Loading tasks...</LoadingMessage>
      ) : (
        <>
          {checklist.length === 0 ? (
            <EmptyMessage>No tasks found. Add your first task to get started.</EmptyMessage>
          ) : (
            <ChecklistItems>
              <AnimatePresence>
                {checklist
                  .filter(item => {
                    if (filterMode === 'pending') return !item.is_completed;
                    if (filterMode === 'completed') return item.is_completed;
                    return true; // 'all' mode
                  })
                  .map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChecklistItemRow style={{
                        background: item.is_completed 
                          ? 'rgba(13, 249, 182, 0.05)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        borderLeft: item.is_completed 
                          ? '3px solid rgba(13, 249, 182, 0.5)' 
                          : '3px solid transparent'
                      }}>
                        <CheckboxContainer onClick={() => handleToggleItem(item)}>
                          <Checkbox $checked={item.is_completed}>
                            {item.is_completed && <FiCheck />}
                          </Checkbox>
                          <ItemText $completed={item.is_completed}>{item.content}</ItemText>
                        </CheckboxContainer>
                        
                        <ItemDetails>
                          {item.due_date && (
                            <ItemDetail>
                              <FiCalendar />
                              {formatDate(item.due_date)}
                            </ItemDetail>
                          )}
                          
                          {item.assigned_to && (
                            <ItemDetail>
                              <FiUser />
                              {item.assigned_to}
                            </ItemDetail>
                          )}
                          
                          <DeleteButton onClick={() => handleDeleteItem(item.id)}>
                            <FiTrash2 />
                          </DeleteButton>
                        </ItemDetails>
                      </ChecklistItemRow>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </ChecklistItems>
          )}
        </>
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

const AddButton = styled.button`
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
  position: relative;
  z-index: 1000;
`;

const InputGroup = styled.div`
  margin-bottom: 10px;
  position: relative;
  z-index: 1001;
  
  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 10px 12px;
    color: white;
    font-size: 14px;
    position: relative;
    z-index: 1001;
    
    &:focus {
      outline: none;
      border-color: rgba(13, 249, 182, 0.5);
    }
  }
`;

const InputWithIcon = styled.div`
  position: relative;
  z-index: 1001;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
    z-index: 1002;
  }
  
  input {
    padding-left: 35px;
  }
`;

const AddItemActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  position: relative;
  z-index: 1001;
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
  position: relative;
  z-index: 1002;
  
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
  position: relative;
  z-index: 1002;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ChecklistItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChecklistItemRow = styled.div`
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

const FilterTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
`;

interface FilterTabProps {
  $active: boolean;
}

const FilterTab = styled.button<FilterTabProps>`
  background: ${props => props.$active ? 'rgba(13, 249, 182, 0.1)' : 'transparent'};
  color: ${props => props.$active ? '#0df9b6' : 'rgba(255, 255, 255, 0.6)'};
  border: ${props => props.$active ? '1px solid rgba(13, 249, 182, 0.3)' : '1px solid transparent'};
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(13, 249, 182, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

export default ClientChecklist;
