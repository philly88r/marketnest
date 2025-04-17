import React from 'react';
import styled from 'styled-components';
import AdminPortalPage from './AdminPortalPage';

const DirectAdminPage: React.FC = () => {
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
