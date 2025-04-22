import React from "react";
import styled from "styled-components";
import ContentWritingPage from "../pages/ContentWritingPage";
import ImageGenerationPage from "../pages/ImageGenerationPage";

const AIContainer = styled.div`
  padding: 30px 0;
`;

const ClientDashboardAI: React.FC = () => {
  return (
    <AIContainer>
      <h2>AI Tools</h2>
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 350, maxWidth: 600 }}>
          <h3>AI Content Writing</h3>
          <ContentWritingPage />
        </div>
        <div style={{ flex: 1, minWidth: 350, maxWidth: 600 }}>
          <h3>AI Image Generation</h3>
          <ImageGenerationPage />
        </div>
      </div>
    </AIContainer>
  );
};

export default ClientDashboardAI;
