import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../utils/supabaseClient';

interface ChecklistItem {
  id: number;
  feature: string;
  to_adjust: string | null;
  notes_from: string | null;
  complete: boolean;
  category: string;
}

const Client004WebsiteQuestionnaire: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('client_004_checklist')
        .select('*')
        .eq('category', 'website')
        .order('id', { ascending: true });
      
      if (error) throw error;
      setItems(data || []);
    } catch (e: any) {
      console.error('Error fetching website questionnaire items:', e);
      setError(e.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleComplete(item: ChecklistItem) {
    try {
      const { error } = await supabase
        .from('client_004_checklist')
        .update({ complete: !item.complete })
        .eq('id', item.id);
      
      if (error) throw error;
      
      // Update local state
      setItems(prevItems => 
        prevItems.map(i => 
          i.id === item.id ? { ...i, complete: !i.complete } : i
        )
      );
    } catch (e: any) {
      console.error('Error updating item:', e);
      alert('Failed to update item. Please try again.');
    }
  }

  if (isLoading) {
    return <LoadingContainer>Loading website questionnaire...</LoadingContainer>;
  }

  if (error) {
    return <ErrorContainer>Error: {error}</ErrorContainer>;
  }

  const completedCount = items.filter(item => item.complete).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Container>
      <Header>
        <Title>Website Questionnaire</Title>
        <Description>
          Complete the following items to help us build your website according to your requirements.
        </Description>
      </Header>

      <ProgressSection>
        <ProgressInfo>
          <ProgressText>
            {completedCount} of {totalCount} items completed ({Math.round(progressPercentage)}%)
          </ProgressText>
        </ProgressInfo>
        <ProgressBar>
          <ProgressFill style={{ width: `${progressPercentage}%` }} />
        </ProgressBar>
      </ProgressSection>

      {items.length === 0 ? (
        <EmptyState>No website questionnaire items found.</EmptyState>
      ) : (
        <ChecklistTable>
          <thead>
            <tr>
              <TableHeader>Requirement</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Notes</TableHeader>
              <TableHeader width="100px">Status</TableHeader>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <TableRow key={item.id} $completed={item.complete}>
                <TableCell>{item.feature}</TableCell>
                <TableCell>{item.to_adjust}</TableCell>
                <TableCell>{item.notes_from}</TableCell>
                <TableCell>
                  <StatusToggle 
                    $completed={item.complete}
                    onClick={() => handleToggleComplete(item)}
                  >
                    {item.complete ? (
                      <>
                        <CheckIcon /> Complete
                      </>
                    ) : (
                      'Mark Complete'
                    )}
                  </StatusToggle>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </ChecklistTable>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 8px;
  color: #fff;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
`;

const ProgressSection = styled.div`
  margin-bottom: 24px;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ProgressText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #0df9b6 0%, #4285F4 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ChecklistTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 16px;
`;

const TableHeader = styled.th<{ width?: string }>`
  text-align: left;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  width: ${props => props.width || 'auto'};
`;

const TableRow = styled.tr<{ $completed: boolean }>`
  background: ${props => props.$completed ? 'rgba(13, 249, 182, 0.05)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
`;

const StatusToggle = styled.button<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  background: ${props => props.$completed ? 'rgba(13, 249, 182, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$completed ? '#0df9b6' : '#fff'};
  
  &:hover {
    background: ${props => props.$completed ? 'rgba(13, 249, 182, 0.3)' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="#0df9b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: white;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
  padding: 20px;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
`;

export default Client004WebsiteQuestionnaire;
