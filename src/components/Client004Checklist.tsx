import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../utils/supabaseClient';
import Modal from "./Modal";

// This component is dedicated for Altare's custom checklist table
interface ChecklistItem {
  id: number;
  feature: string;
  to_adjust: string | null;
  complete_by: string | null;
  notes_from: string | null;
  assigned_to: string | null;
  complete: boolean;
  // These fields are used in the UI but not stored in the database
  priority?: 'low' | 'medium' | 'high'; // UI only
  order?: number; // UI only
}

type FilterType = 'all' | 'completed' | 'pending';
type SortType = 'id' | 'feature' | 'complete_by' | 'complete';

const AltareChecklist: React.FC = () => {
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
        .order('id', { ascending: true }); // Use order field if available, fallback to id
      
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
  const openCreateModal = (e?: React.MouseEvent) => {
    // Prevent event propagation if event exists
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Opening create modal');
    setModalItem(null);
    setForm({
      feature: '',
      to_adjust: null,
      complete_by: null,
      notes_from: null,
      assigned_to: null,
      complete: false
      // Removed priority as it's not in the database
    });
    setIsNewItem(true);
    setFormErrors({});
    setModalOpen(true);
  };

  // Close modal
  const closeModal = (e?: React.MouseEvent) => {
    // Prevent event propagation if event exists
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Closing modal');
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
        // Create a clean version of the form data without UI-only fields
        const { priority, ...cleanForm } = form;
        
        console.log('Clean form data for insert:', cleanForm);
        const { data, error: createError } = await supabase
          .from('client_004_checklist')
          .insert([cleanForm]);
          
        if (createError) throw createError;
        console.log('Item created successfully');
      } else if (modalItem) {
        // Update existing item
        console.log('Saving changes for item:', modalItem.id, form);
        // Create a clean version of the form data without UI-only fields
        const { priority, ...cleanForm } = form;
        
        console.log('Clean form data for update:', cleanForm);
        const { data, error: updateError } = await supabase
          .from('client_004_checklist')
          .update(cleanForm)
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

  // Handle manual reordering (replacing drag and drop)
  const moveItem = async (itemId: number, direction: 'up' | 'down') => {
    const itemIndex = filteredItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= filteredItems.length) return;
    
    // Update local order for visual feedback
    const reorderedItems = [...items];
    const itemToMove = reorderedItems.find(i => i.id === itemId);
    const targetItem = reorderedItems.find(i => i.id === filteredItems[newIndex].id);
    
    if (!itemToMove || !targetItem) return;
    
    // Swap orders
    const tempOrder = itemToMove.order;
    itemToMove.order = targetItem.order;
    targetItem.order = tempOrder;
    
    setItems(reorderedItems);
    
    // Update in database
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_004_checklist')
        .upsert([
          { id: itemToMove.id, order: itemToMove.order },
          { id: targetItem.id, order: targetItem.order }
        ]);
        
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

  // Icons as SVG components to avoid dependency issues
  const IconCheck = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
  
  const IconTimes = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
  
  const IconEdit = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
  
  const IconPlus = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
  
  const IconSearch = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
  
  const IconCalendar = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
  
  const IconWarning = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
  
  const IconArrowUp = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
  
  const IconArrowDown = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );

  return (
    <Container>
      <Header>
        <h2>Altare Feature Checklist</h2>
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
      
      <AddButtonContainer>
        <AddButton 
          onClick={(e) => openCreateModal(e)}
          type="button"
          aria-label="Add new checklist item"
        >
          <IconPlus /> Add Item
        </AddButton>
      </AddButtonContainer>
      
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
          <SearchIcon><IconSearch /></SearchIcon>
        </SearchContainer>
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
          <CardList>
            {paginatedItems.map((item, idx) => (
              <ItemCard 
                key={item.id.toString()} 
                complete={item.complete}
              >
                <ItemHeader>
                  <ItemTitle>{item.feature}</ItemTitle>
                  <ToggleButton
                    complete={item.complete}
                    onClick={() => handleToggleComplete(item)}
                    title={item.complete ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {item.complete ? <IconCheck /> : <IconTimes />}
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
                        <IconCalendar /> Complete By:
                      </PropertyLabel>
                      <PropertyValue>
                        {formatDate(item.complete_by)}
                        {isDateApproaching(item.complete_by) && !item.complete && (
                          <DueSoonBadge>
                            <IconWarning /> Due Soon
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
                    <IconEdit /> Edit
                  </EditButton>
                  <OrderButtons>
                    <OrderButton 
                      disabled={idx === 0}
                      onClick={() => moveItem(item.id, 'up')}
                      title="Move up"
                    >
                      <IconArrowUp />
                    </OrderButton>
                    <OrderButton 
                      disabled={idx === paginatedItems.length - 1}
                      onClick={() => moveItem(item.id, 'down')}
                      title="Move down"
                    >
                      <IconArrowDown />
                    </OrderButton>
                  </OrderButtons>
                  <StatusBadge
                    priority={item.priority}
                    style={{ backgroundColor: getPriorityColor(item.priority) }}
                  >
                    {item.priority || 'normal'}
                  </StatusBadge>
                </ItemActions>
              </ItemCard>
            ))}
          </CardList>
          
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
      
      <StyledModal open={modalOpen} onClose={(e) => closeModal(e)}>
        <ModalContent onClick={e => e.stopPropagation()} data-testid="modal-content">
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

const AddButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const FilterTab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#0df9b6' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? '#1a1a2e' : '#fff'};
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? '#0be0a5' : 'rgba(255, 255, 255, 0.2)'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.5);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex-grow: 1;
  max-width: 100%;
  
  @media (max-width: 480px) {
    width: 100%;
  }
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
    border-color: #0df9b6;
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
  padding: 12px 20px;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 5;
  
  @media (max-width: 768px) {
    width: auto;
    padding: 14px 24px;
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    width: 80%;
  }
  
  &:hover {
    background: #0be0a5;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const OrderButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const OrderButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  padding: 4px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
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
    background: #f5f5f7;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    z-index: 1000;
    position: relative;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  color: #333;
  
  h3 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 20px;
    color: #1a1a2e;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
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
  background: #fff;
  border: 1px solid ${props => props.error ? '#ff3b30' : '#ddd'};
  border-radius: 4px;
  color: #333;
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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
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
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`;

export default AltareChecklist;