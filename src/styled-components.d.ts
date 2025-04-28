import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    // Define your theme properties here if needed
  }
}

// This allows CSS properties to be used in template literals
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      css?: any;
    }
  }
}
