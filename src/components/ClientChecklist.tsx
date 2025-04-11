import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';
import { FiPlus } from 'react-icons/fi';
import {
  getChecklistItemsByClientId,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  type ChecklistItem
} from '../utils/clientService';

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
  
  // Handle adding new checklist item
  const handleAddItem = async () => {
    if (!newItemText.trim()) {
      return;
    }
    
    try {
      const newItem = await createChecklistItem({
        content: newItemText.trim(),
        is_completed: false,
        client_id: clientId,
        project_id: projectId || null,
        due_date: newItemDueDate || null,
        assigned_to: newItemAssignee || null
      });
      
      setChecklist([newItem, ...checklist]);
      setNewItemText('');
      setNewItemDueDate('');
      setNewItemAssignee('');
      setIsAddingItem(false);
    } catch (err) {
      console.error('Error creating checklist item:', err);
      setError('Failed to create checklist item. Please try again.');
    }
  };
  
  // Handle toggling checklist item completion
  const handleToggleComplete = async (item: ChecklistItem) => {
    try {
      const updatedItem = await updateChecklistItem(item.id, {
        is_completed: !item.is_completed
      });
      
      setChecklist(checklist.map(i => i.id === item.id ? updatedItem : i));
    } catch (err) {
      console.error('Error updating checklist item:', err);
      setError('Failed to update checklist item. Please try again.');
    }
  };
  
  // Handle deleting checklist item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteChecklistItem(itemId);
      setChecklist(checklist.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting checklist item:', err);
      setError('Failed to delete checklist item. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <ChecklistContainer>
      <ChecklistHeader>
        <h3>Client Tasks</h3>
        <AddItemButton onClick={() => setIsAddingItem(true)}>
          <FiPlus size={16} /> Add Task
        </AddItemButton>
      </ChecklistHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <AnimatePresence>
        {isAddingItem && (
          <NewItemForm
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <NewItemInput
              type="text"
              placeholder="Enter task description"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              autoFocus
            />
            <NewItemDetails>
              <NewItemDateInput>
                <FiCalendar />
                <input
                  type="date"
                  placeholder="Due date (optional)"
                  value={newItemDueDate}
                  onChange={(e) => setNewItemDueDate(e.target.value)}
                />
              </NewItemDateInput>
              <NewItemAssigneeInput>
                <FiUser />
                <input
                  type="text"
                  placeholder="Assignee (optional)"
                  value={newItemAssignee}
                  onChange={(e) => setNewItemAssignee(e.target.value)}
                />
              </NewItemAssigneeInput>
            </NewItemDetails>
            <NewItemActions>
              <AddButton onClick={handleAddItem}>Add Task</AddButton>
              <CancelButton onClick={() => setIsAddingItem(false)}>Cancel</CancelButton>
            </NewItemActions>
          </NewItemForm>
        )}
      </AnimatePresence>
      
      <ChecklistContent>
        {isLoading ? (
          <LoadingMessage>Loading tasks...</LoadingMessage>
        ) : checklist.length === 0 ? (
          <EmptyStateMessage>
            No tasks yet. Click "Add Task" to create one.
          </EmptyStateMessage>
        ) : (
          checklist.map(item => (
            <ChecklistItem
              key={item.id}
              $completed={item.is_completed}
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
            >
              <CheckboxContainer onClick={() => handleToggleComplete(item)}>
                <Checkbox $checked={item.is_completed}>
                  {item.is_completed && <FiCheck />}
                </Checkbox>
              </CheckboxContainer>
              <ItemContent>
                <ItemText $completed={item.is_completed}>{item.content}</ItemText>
                <ItemDetails>
                  {(item.due_date || item.assigned_to) && (
                    <>
                      {item.due_date && (
                        <ItemDetail>
                          <FiCalendar />
                          <span>{formatDate(item.due_date)}</span>
                        </ItemDetail>
                      )}
                      {item.assigned_to && (
                        <ItemDetail>
                          <FiUser />
                          <span>{item.assigned_to}</span>
                        </ItemDetail>
                      )}
                    </>
                  )}
                </ItemDetails>
              </ItemContent>
              <DeleteButton onClick={() => handleDeleteItem(item.id)}>
                <FiTrash2 />
              </DeleteButton>
            </ChecklistItem>
          ))
        )}
      </ChecklistContent>
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
    margin: 0;
    font-size: 18px;
  }
`;

const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(31, 83, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(31, 83, 255, 0.2);
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 67, 67, 0.1);
  border: 1px solid rgba(255, 67, 67, 0.3);
  color: #ff4343;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const NewItemForm = styled(motion.div)`
  background: rgba(31, 83, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px dashed rgba(31, 83, 255, 0.3);
  overflow: hidden;
`;

const NewItemInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 12px 15px;
  color: white;
  font-size: 15px;
  margin-bottom: 15px;
  
  &:focus {
    outline: none;
  }
`;

const NewItemDetails = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const NewItemDateInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px 12px;
  flex: 1;
  
  svg {
    color: rgba(255, 255, 255, 0.5);
  }
  
  input {
    background: transparent;
    border: none;
    color: white;
    font-size: 14px;
    width: 100%;
    
    &:focus {
      outline: none;
    }
    
    &::-webkit-calendar-picker-indicator {
      filter: invert(1);
      opacity: 0.5;
    }
  }
`;

const NewItemAssigneeInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px 12px;
  flex: 1;
  
  svg {
    color: rgba(255, 255, 255, 0.5);
  }
  
  input {
    background: transparent;
    border: none;
    color: white;
    font-size: 14px;
    width: 100%;
    
    &:focus {
      outline: none;
    }
  }
`;

const NewItemActions = styled.div`
  display: flex;
  gap: 10px;
`;

const AddButton = styled.button`
  padding: 10px 15px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(31, 83, 255, 0.3);
  }
`;

const CancelButton = styled.button`
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ChecklistContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.7);
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  font-size: 15px;
`;

const ChecklistItem = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-radius: 8px;
  background: ${props => props.$completed 
    ? 'rgba(52, 199, 89, 0.05)' 
    : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$completed 
      ? 'rgba(52, 199, 89, 0.1)' 
      : 'rgba(255, 255, 255, 0.08)'};
  }
`;

const CheckboxContainer = styled.div`
  cursor: pointer;
  margin-right: 15px;
  padding-top: 2px;
`;

const Checkbox = styled.div<{ $checked: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 2px solid ${props => props.$checked ? '#34c759' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.$checked ? '#34c759' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
  
  svg {
    font-size: 14px;
  }
`;

const ItemContent = styled.div`
  flex: 1;
`;

const ItemText = styled.div<{ $completed: boolean }>`
  font-size: 15px;
  margin-bottom: 5px;
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  color: ${props => props.$completed ? 'rgba(255, 255, 255, 0.6)' : 'white'};
`;

const ItemDetails = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const ItemDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  
  svg {
    font-size: 12px;
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 67, 67, 0.1);
    color: #ff4343;
  }
`;

export default ClientChecklist;
