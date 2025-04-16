import React from 'react';
import { IconType } from 'react-icons';

/**
 * Helper function to render React Icons safely in React 19
 * This addresses the TypeScript error TS2769 by properly handling the IconType
 */
export const renderIcon = (Icon: IconType, props: React.SVGAttributes<SVGElement> & { size?: number } = {}) => {
  return React.createElement(Icon, props);
};
