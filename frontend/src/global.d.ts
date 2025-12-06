// Global declarations to help TS in environments missing React types or JSX runtime
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

// Allow importing CSS modules and other assets when types are not available
declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

// Ambient module declarations to silence missing-type errors in the editor environment
declare module 'react-router-dom';
declare module 'lucide-react';

// Simple wildcard declarations for path-alias imports used in the project
declare module '@/*';
