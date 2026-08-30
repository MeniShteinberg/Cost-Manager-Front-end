// Import React and ReactDOM for component rendering and DOM manipulation
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// Import Material-UI theming system to provide consistent styling across the app
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

/* 
 * Theme Configuration: Establishes a cohesive visual design system with custom colors,
 * typography, and spacing rules. CssBaseline will normalize browser defaults using this theme.
 */
const minimalTheme = createTheme({
  palette: {
    mode: 'light',
    // Primary color used for buttons, links, and key UI elements
    primary: {
      main: '#1e293b',
    },
    // Neutral background and paper colors for consistent contrast
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    // Text colors designed for readability on light backgrounds
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  // Typography settings ensure consistent font rendering across all components
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Tahoma", "Geneva", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
  },
  // Uniform border radius for modern, polished UI elements
  shape: { 
    borderRadius: 10,
  },
});

// Initialize React root at the #root DOM element and render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode helps detect potential problems during development
  <React.StrictMode>
    {/* ThemeProvider injects the theme into all MUI components in the app */}
    <ThemeProvider theme={minimalTheme}>
      {/* CssBaseline normalizes default browser styles using Material-UI theme colors */}
      <CssBaseline />
      {/* Main application component with all page features */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// Track and report web performance metrics for monitoring application responsiveness
reportWebVitals();
