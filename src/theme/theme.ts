// Define the theme without using DefaultTheme initially
const theme = {
  colors: {
    primary: '#0df9b6',
    secondary: '#de681d',
    background: '#000000',
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.81)',
      muted: 'rgba(255, 255, 255, 0.6)'
    },
    accent: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)'
    }
  },
  gradients: {
    primary: 'linear-gradient(90deg, #0df9b6 0%, #de681d 100%)',
    text: 'linear-gradient(90deg, #0df9b6 0%, #de681d 100%)',
    button: 'linear-gradient(90deg, #0df9b6 0%, #de681d 100%)',
    card: 'linear-gradient(90deg, rgba(13, 249, 182, 0.1) 0%, rgba(222, 104, 29, 0.1) 100%)'
  },
  shadows: {
    small: '0 2px 5px rgba(13, 249, 182, 0.2)',
    medium: '0 4px 10px rgba(13, 249, 182, 0.3)',
    large: '0 6px 20px rgba(13, 249, 182, 0.4)'
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '24px',
    xxlarge: '32px',
    xxxlarge: '48px',
    hero: '64px'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
    xxlarge: '48px',
    xxxlarge: '64px'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    pill: '9999px'
  },
  transitions: {
    fast: '0.2s ease',
    medium: '0.3s ease',
    slow: '0.5s ease'
  },
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
    xl: '1600px'
  }
};

export default theme;
