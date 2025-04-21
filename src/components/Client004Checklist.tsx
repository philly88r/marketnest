import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../utils/supabaseClient';
import Modal from "./Modal";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Icons
import { 
  FaCheck, 
  FaTimes, 
  FaEdit, 
  FaPlus, 
  FaSearch, 
  FaSort, 
  FaCalendarAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

// This component is dedicated for client-004's custom checklist table
interface ChecklistItem {
  id: number;
  feature: string;
  to_adjust: string | null;
  complete_by: string | null;
  notes_from: string | null;
  assigned_to: string | null;
  complete: boolean;
  priority?: 'low' | 'medium' | 'high';
  order?: number;
}

type FilterType = 'all' | 'completed' | 'pending';
type SortType = 'id' | 'feature' | 'complete_by' | 'complete';

const Client004Checklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // For editing/adding
  const [form, setForm] = useState<Partial<ChecklistItem>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<ChecklistItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Stats
  const completedCount = items.filter(item => item.complete).length;
  const pendingCount = items.length - completedCount;

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [items, activeFilter, sortBy, sortDirection, searchQuery]);

  async function fetchItems() {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching items from client_004_checklist table');
      const { data, error } = await supabase
        .from('client_004_checklist')
        .select('*')
        .order('order', { ascending: true }); // Use order field if available
      
      if (error) throw error;
      console.log('Fetched items:', data);
      setItems(data || []);
    } catch (e: any) {
      console.error('Error fetching checklist items:', e);
      setError(e.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  function filterAndSortItems() {
    // First apply the filter
    let result = [...items];
    
    // Apply search filter if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.feature.toLowerCase().includes(query) ||
        (item.to_adjust && item.to_adjust.toLowerCase().includes(query)) ||
        (item.notes_from && item.notes_from.toLowerCase().includes(query)) ||
        (item.assigned_to && item.assigned_to.toLowerCase().includes(query))
      );
    }
    
    // Apply tab filter
    if (activeFilter === 'completed') {
      result = result.filter(item => item.complete);
    } else if (activeFilter === 'pending') {
      result = result.filter(item => !item.complete);
    }
    
    // Then sort
    result.sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        case 'feature':
          valA = a.feature.toLowerCase();
          valB = b.feature.toLowerCase();
          break;
        case 'complete_by':
          valA = a.complete_by || '';
          valB = b.complete_by || '';
          break;
        case 'complete':
          valA = a.complete ? 1 : 0;
          valB = b.complete ? 1 : 0;
          break;
        default: // 'id'
          valA = a.id;
          valB = b.id;
      }
      
      // Apply sort direction
      if (sortDirection === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
    
    setFilteredItems(result);
  }

  // Open modal for editing
  const openEditModal = (item: ChecklistItem) => {
    console.log('Edit clicked for item', item);
    // Create a deep copy of the item to avoid reference issues
    const itemCopy = JSON.parse(JSON.stringify(item));
    setModalItem(itemCopy);
    setForm(itemCopy);
    setIsNewItem(false);
    setFormErrors({});
    setModalOpen(true);
  };

  // Open modal for creating new item
  const openCreateModal = () => {
    setModalItem(null);
    setForm({
      feature: '',
      to_adjust: null,
      complete_by: null,
      notes_from: null,
      assigned_to: null,
      complete: false,
      priority: 'medium'
    });
    setIsNewItem(true);
    setFormErrors({});
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
    setForm({});
    setFormErrors({});
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    
    // Handle checkbox inputs differently
    if (type === 'checkbox') {
      // Safe type assertion since we know it's a checkbox input
      const isChecked = (e.target as HTMLInputElement).checked;
      setForm(f => ({ ...f, [name]: isChecked }));
    } else {
      // For text inputs, use empty string if value is empty (not null)
      const fieldValue = value.trim() === '' ? null : value;
      setForm(f => ({ ...f, [name]: fieldValue }));
    }
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Required fields
    if (!form.feature) {
      errors.feature = 'Feature name is required';
    }
    
    // Add more validation rules as needed
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save from modal
  const handleModalSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      if (isNewItem) {
        // Create new item
        console.log('Creating new item:', form);
        const { data, error: createError } = await supabase
          .from('client_004_checklist')
          .insert([{
            ...form,
            // Add order as the last item
            order: items.length > 0 ? Math.max(...items.map(i => i.order || 0)) + 1 : 1
          }]);
          
        if (createError) throw createError;
        console.log('Item created successfully');
      } else if (modalItem) {
        // Update existing item
        console.log('Saving changes for item:', modalItem.id, form);
        const { data, error: updateError } = await supabase
          .from('client_004_checklist')
          .update(form)
          .eq('id', modalItem.id);
          
        if (updateError) throw updateError;
        console.log('Item updated successfully');
      }
      
      await fetchItems();
      closeModal();
    } catch (e: any) {
      console.error('Error saving checklist item:', e);
      setError(e.message || 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  async function handleToggleComplete(item: ChecklistItem) {
    setIsSaving(true);
    setError(null);
    try {
      console.log('Toggling complete status for item:', item.id);
      const { error } = await supabase
        .from('client_004_checklist')
        .update({ complete: !item.complete })
        .eq('id', item.id);
        
      if (error) throw error;
      
      console.log('Item completion toggled successfully');
      await fetchItems();
    } catch (e: any) {
      console.error('Error toggling checklist item completion:', e);
      setError(e.message || 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }

  // Handle drag and drop reordering
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;
    
    // Reorder the items array
    const reorderedItems = [...filteredItems];
    const [removed] = reorderedItems.splice(startIndex, 1);
    reorderedItems.splice(endIndex, 0, removed);
    
    // Update the order field for all affected items
    setIsLoading(true);
    try {
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        order: index + 1
      }));
      
      const { error } = await supabase
        .from('client_004_checklist')
        .upsert(updates);
        
      if (error) throw error;
      
      await fetchItems();
    } catch (e: any) {
      console.error('Error reordering items:', e);
      setError(e.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Check if a date is approaching (within 7 days)
  const isDateApproaching = (dateString: string | null): boolean => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 && diffDays <= 7;
    } catch (e) {
      return false;
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  // Handle sort toggle
  const handleSortToggle = (field: SortType) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Container>
      <Header>
        <h2>Client 004 Feature Checklist</h2>
        <StatsContainer>
          <Stat>
            <StatValue>{completedCount}</StatValue>
            <StatLabel>Completed</StatLabel>
          </Stat>
          <Stat>
            <StatValue>{pendingCount}</StatValue>
            <StatLabel>Pending</StatLabel>
          </Stat>
          <Stat>
            <StatValue>{items.length}</StatValue>
            <StatLabel>Total</StatLabel>
          </Stat>
        </StatsContainer>
      </Header>
      
      <ControlsContainer>
        <FilterTabs>
          <FilterTab 
            active={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')}
          >
            All ({items.length})
          </FilterTab>
          <FilterTab 
            active={activeFilter === 'completed'} 
            onClick={() => setActiveFilter('completed')}
          >
            Completed ({completedCount})
          </FilterTab>
          <FilterTab 
            active={activeFilter === 'pending'} 
            onClick={() => setActiveFilter('pending')}
          >
            Pending ({pendingCount})
          </FilterTab>
        </FilterTabs>
        
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon><FaSearch /></SearchIcon>
        </SearchContainer>
        
        <AddButton onClick={openCreateModal}>
          <FaPlus /> Add Item
        </AddButton>
      </ControlsContainer>

      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading items...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorMsg>{error}</ErrorMsg>
      ) : filteredItems.length === 0 ? (
        <EmptyState>
          {searchQuery
            ? `No items found matching "${searchQuery}"`
            : activeFilter === 'completed'
              ? 'No completed items yet'
              : activeFilter === 'pending'
                ? 'No pending items left! 🎉'
                : 'No items found. Click "Add Item" to create one.'}
        </EmptyState>
      ) : (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="checklist-items">
              {(provided) => (
                <CardList
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {paginatedItems.map((item, idx) => (
                    <Draggable 
                      key={item.id.toString()} 
                      draggableId={item.id.toString()} 
                      index={idx}
                    >
                      {(provided) => (
                        <ItemCard
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          complete={item.complete}
                        >
                          <ItemHeader>
                            <ItemTitle>{item.feature}</ItemTitle>
                            <ToggleButton
                              complete={item.complete}
                              onClick={() => handleToggleComplete(item)}
                              title={item.complete ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              {item.complete ? <FaCheck /> : <FaTimes />}
                            </ToggleButton>
                          </ItemHeader>
                          
                          <ItemDetails>
                            {item.to_adjust && (
                              <ItemProperty>
                                <PropertyLabel>To Adjust:</PropertyLabel>
                                <PropertyValue>{item.to_adjust}</PropertyValue>
                              </ItemProperty>
                            )}
                            
                            {item.complete_by && (
                              <ItemProperty>
                                <PropertyLabel>
                                  <FaCalendarAlt /> Complete By:
                                </PropertyLabel>
                                <PropertyValue>
                                  {formatDate(item.complete_by)}
                                  {isDateApproaching(item.complete_by) && !item.complete && (
                                    <DueSoonBadge>
                                      <FaExclamationTriangle /> Due Soon
                                    </DueSoonBadge>
                                  )}
                                </PropertyValue>
                              </ItemProperty>
                            )}
                            
                            {item.assigned_to && (
                              <ItemProperty>
                                <PropertyLabel>Assigned To:</PropertyLabel>
                                <PropertyValue>{item.assigned_to}</PropertyValue>
                              </ItemProperty>
                            )}
                            
                            {item.notes_from && (
                              <ItemProperty>
                                <PropertyLabel>Notes:</PropertyLabel>
                                <PropertyValue>{item.notes_from}</PropertyValue>
                              </ItemProperty>
                            )}
                          </ItemDetails>
                          
                          <ItemActions>
                            <EditButton onClick={() => openEditModal(item)}>
                              <FaEdit /> Edit
                            </EditButton>
                            <StatusBadge
                              priority={item.priority}
                              style={{ backgroundColor: getPriorityColor(item.priority) }}
                            >
                              {item.priority || 'normal'}
                            </StatusBadge>
                          </ItemActions>
                        </ItemCard>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </CardList>
              )}
            </Droppable>
          </DragDropContext>
          
          {totalPages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              <PageInfo>
                Page {currentPage} of {totalPages}
              </PageInfo>
              <PageButton
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      )}
      
      <StyledModal open={modalOpen} onClose={closeModal}>
        <ModalContent>
          <h3>{isNewItem ? 'Add New Checklist Item' : 'Edit Checklist Item'}</h3>
          
          <FormGroup>
            <FormLabel htmlFor="feature">
              Feature Name*
              {formErrors.feature && <ErrorText>{formErrors.feature}</ErrorText>}
            </FormLabel>
            <FormInput
              id="feature"
              name="feature"
              value={form.feature || ''}
              onChange={handleChange}
              error={!!formErrors.feature}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="to_adjust">
              To Adjust
            </FormLabel>
            <FormInput
              id="to_adjust"
              name="to_adjust"
              value={form.to_adjust || ''}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="complete_by">
              Complete By
            </FormLabel>
            <DateInput
              id="complete_by"
              name="complete_by"
              type="date"
              value={form.complete_by || ''}
              onChange={handleChange}
            />
          </FormGroup>
          
          <TwoColumnLayout>
            <FormGroup>
              <FormLabel htmlFor="assigned_to">
                Assigned To
              </FormLabel>
              <FormInput
                id="assigned_to"
                name="assigned_to"
                value={form.assigned_to || ''}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="priority">
                Priority
              </FormLabel>
              <FormSelect
                id="priority"
                name="priority"
                value={form.priority || 'medium'}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </FormSelect>
            </FormGroup>
          </TwoColumnLayout>
          
          <FormGroup>
            <FormLabel htmlFor="notes_from">
              Notes
            </FormLabel>
            <FormTextarea
              id="notes_from"
              name="notes_from"
              value={form.notes_from || ''}
              onChange={handleChange}
              rows={3}
            />
          </FormGroup>
          
          <FormGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="complete"
                checked={!!form.complete}
                onChange={handleChange}
              />
              <span>Mark as completed</span>
            </CheckboxLabel>
          </FormGroup>
          
          <ModalActions>
            <SaveButton onClick={handleModalSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </SaveButton>
            <CancelButton onClick={closeModal}>
              Cancel
            </CancelButton>
          </ModalActions>
        </ModalContent>
      </StyledModal>
    </Container>
  );
};

// Modern, Responsive Styled Components
const Container = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 1200px;
  margin: 0 auto 30px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  h2 {
    color: #fff;
    margin: 0;
    font-size: 24px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    h2 {
      font-size: 20px;
    }
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const Stat = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  text-align: center;
  min-width: 80px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #0df9b6;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #ccc;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
`;

const FilterTab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(13, 249, 182, 0.2)' : 'transparent'};
  border: none;
  color: ${props => props.active ? '#0df9b6' : '#fff'};
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'rgba(13, 249, 182, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex-grow: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.5);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
`;

const AddButton = styled.button`
  background: #0df9b6;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0be0a5;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #fff;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #0df9b6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMsg = styled.div`
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.1);
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
`;

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const ItemCard = styled.div<{ complete: boolean }>`
  background: #16213e;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-left: 4px solid ${props => props.complete ? '#0df9b6' : '#718096'};
  opacity: ${props => props.complete ? 0.7 : 1};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 18px;
  word-break: break-word;
`;

const ToggleButton = styled.button<{ complete: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.complete ? '#0df9b6' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.complete ? '#1a1a2e' : '#fff'};
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemProperty = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PropertyLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    font-size: 10px;
  }
`;

const PropertyValue = styled.div`
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DueSoonBadge = styled.span`
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ItemActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const EditButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatusBadge = styled.div<{ priority?: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  gap: 16px;
`;

const PageButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const PageInfo = styled.div`
  color: rgba(255, 255, 255, 0.7);
`;

// Modal Styling
const StyledModal = styled(Modal)`
  .modal-content {
    background: #16213e;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  color: #fff;
  
  h3 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: space-between;
`;

const ErrorText = styled.span`
  color: #ff3b30;
  font-size: 12px;
`;

const FormInput = styled.input<{ error?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid ${props => props.error ? '#ff3b30' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #0df9b6;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.2);
  }
`;

const DateInput = styled(FormInput)`
  /* Override date input styling */
  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #0df9b6;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.2);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  
  &:focus {
    outline: none;
    border-color: #0df9b6;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.2);
  }
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #0df9b6;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const SaveButton = styled.button`
  background: #0df9b6;
  color: #1a1a2e;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #0be0a5;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export default Client004Checklist;