/**
 * Home Page Component
 *
 * Landing page of the JoinUs application. Serves as the main entry point
 * for users and displays:
 * - Hero section with value proposition
 * - Start/join meeting functionality
 *
 * This page is designed to quickly convert visitors into users by
 * highlighting the main features and providing immediate access to
 * core functionality.
 *
 * @component
 * @module Home
 */

import type { FC } from 'react';
import Hero from '../../components/hero/Hero';
import Startmeet from '../../components/startmeet/Startmeet';
import './Home.scss';

/**
 * Home page component
 *
 * Composition:
 * - Screen reader only h1 for accessibility
 * - Hero section for visual impact and messaging
 * - Startmeet section for immediate user engagement
 *
 * @returns {JSX.Element} Rendered home page
 */
const Home: FC = () => {
  return (
    <div className="home">
      {/* Hidden h1 for screen readers and SEO */}
      <h1 className="sr-only">JoinUs - Inicio</h1>

      {/* Main hero section */}
      <Hero />

      {/* Meeting management section */}
      <Startmeet />
    </div>
  );
};

export default Home;
