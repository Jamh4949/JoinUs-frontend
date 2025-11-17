/**
 * Main Application Component for JoinUs
 *
 * This component configures the base structure of the application including:
 * - Page routing via React Router
 * - Navigation components (Navbar and Footer)
 * - Accessibility system (skip links, scroll to top)
 * - All main application routes
 *
 * @component
 * @module App
 */

import type { FC } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/footer/Footer';
import Navbar from './components/navbar/Navbar';
import ScrollToTop from './components/ScrollToTop';
import About from './pages/About/About';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import SiteMap from './pages/SiteMap/SiteMap';

/**
 * Root component that orchestrates the entire application
 *
 * Main features:
 * - Skip link for WCAG 2.1 accessibility compliance
 * - Automatic scroll on page change
 * - Persistent navigation (Navbar and Footer)
 * - Declarative routing with React Router
 *
 * @returns {JSX.Element} Complete application structure
 */
const App: FC = () => {
  return (
    <Router>
      {/* Accessibility link to skip to main content */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      {/* Component that manages scroll on route change */}
      <ScrollToTop />

      {/* Main navigation bar */}
      <Navbar />

      {/* Main content container with ID for accessibility */}
      <main id="main-content">
        {/* Definition of all application routes */}
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />

          {/* About us page */}
          <Route path="/about" element={<About />} />

          {/* Site map page */}
          <Route path="/sitemap" element={<SiteMap />} />

          {/* Login page */}
          <Route path="/login" element={<Login />} />

          {/* Registration page */}
          <Route path="/register" element={<Register />} />

          {/* Password recovery page */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>

      {/* Footer component */}
      <Footer />
    </Router>
  );
};

export default App;
