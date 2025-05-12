import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminPortalPage from './AdminPortalPage';
import { isLoggedIn, isAdmin } from '../utils/authService';

const DirectAdminPage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!isLoggedIn() || !isAdmin()) {
      // Redirect to admin login page
      navigate('/admin-login');
    }
  }, [navigate]);

  // Only render the admin portal if user is logged in and is an admin
  if (!isLoggedIn() || !isAdmin()) {
    return null; // Return nothing while redirecting
  }
  
  return (
    <DirectAdminContainer>
      <AdminPortalPage />
    </DirectAdminContainer>
  );
};

const DirectAdminContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

export default DirectAdminPage;
