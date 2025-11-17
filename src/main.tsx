/**
 * Main Entry Point for JoinUs Frontend Application
 *
 * This file is responsible for:
 * 1. Initializing React in the DOM
 * 2. Wrapping the application in StrictMode for issue detection
 * 3. Rendering the main App component
 *
 * @module main
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.scss';

/**
 * Gets the root DOM element where the application will be mounted
 * @type {HTMLElement | null}
 */
const rootElement: HTMLElement | null = document.getElementById('root');

/**
 * Validates that the root element exists before mounting the application
 * Throws an error if not found to prevent rendering issues
 */
if (!rootElement) {
  throw new Error('Root element not found');
}

/**
 * Creates and renders the React application
 * - StrictMode: Activates additional checks and warnings in development
 * - App: Main component containing all application logic
 */
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
