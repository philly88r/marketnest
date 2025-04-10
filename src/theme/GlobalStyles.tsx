import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Typography Styles */
  h1, h2, h3, h4, h5, h6 {
    background: ${({ theme }) => theme.gradients.text};
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  /* Gradient Text Helper Classes */
  .gradient-text {
    background: ${({ theme }) => theme.gradients.text};
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Gradient Button Styles */
  .gradient-button {
    background: ${({ theme }) => theme.gradients.button};
    border: none;
    box-shadow: ${({ theme }) => theme.shadows.small};
    transition: ${({ theme }) => theme.transitions.medium};
    
    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.medium};
      transform: translateY(-2px);
    }
  }

  /* Progress Bar Styles */
  .gradient-progress {
    background: ${({ theme }) => theme.gradients.primary};
    box-shadow: ${({ theme }) => theme.shadows.small};
  }

  /* Highlighted Text Styles */
  .highlight {
    background: ${({ theme }) => theme.gradients.text};
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
  }
`;

export default GlobalStyles;
