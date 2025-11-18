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

import App from './App.tsx';
import './index.scss';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';


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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
