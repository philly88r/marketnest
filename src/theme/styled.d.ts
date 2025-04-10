import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: {
        primary: string;
        secondary: string;
        muted: string;
      };
      accent: {
        light: string;
        medium: string;
      };
    };
    gradients: {
      primary: string;
      text: string;
      button: string;
      card: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
    };
    fontSizes: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
      xxlarge: string;
      xxxlarge: string;
      hero: string;
    };
    spacing: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
      xxlarge: string;
      xxxlarge: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      pill: string;
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
    transitions: {
      fast: string;
      medium: string;
      slow: string;
    };
  }
}
