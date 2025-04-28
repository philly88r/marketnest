import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    // Define your theme properties here if needed
  }
}

// This allows CSS properties in template literals
declare namespace React {
  interface CSSProperties {
    [key: string]: any;
  }
}
