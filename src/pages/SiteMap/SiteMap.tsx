/**
 * SiteMap Page Component
 *
 * Provides a comprehensive overview of all site pages and sections.
 * Organized into logical categories for easy navigation and improved
 * SEO. Helps users quickly find what they're looking for.
 *
 * Features:
 * - Organized navigation sections
 * - AOS animations
 * - Accessibility-compliant structure
 * - Links to all major site sections
 *
 * @component
 * @module SiteMap
 */

import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import './SiteMap.scss';

/**
 * Site map page component
 *
 * Displays all available pages organized by category:
 * - Main navigation pages
 * - Meeting-related pages
 * - User account pages
 * - Resources and documentation
 *
 * @returns {JSX.Element} Rendered site map page
 */
const SiteMap: FC = () => {
  /**
   * Initialize AOS (Animate On Scroll) library
   * Runs once on component mount
   */
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      <Navbar />
      <section className="sitemap" aria-labelledby="sitemap-title">
      <div className="sitemap__container wrapper">
        {/* Page heading */}
        <h1 id="sitemap-title" data-aos="fade-up">
          Mapa del Sitio
        </h1>

        {/* Introduction text */}
        <p data-aos="fade-up" className="sitemap__intro">
          Encuentra todas las páginas y secciones de JoinUs.
        </p>

        {/* Site map content organized by sections */}
        <div className="sitemap__content" data-aos="fade-up">
          {/* Main navigation section */}
          <nav className="sitemap__section" aria-labelledby="sitemap-nav-main">
            <h2 id="sitemap-nav-main">Navegación Principal</h2>
            <ul>
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/about">Sobre Nosotros</Link>
              </li>
              <li>
                <Link to="/sitemap">Mapa del Sitio</Link>
              </li>
            </ul>
          </nav>

          {/* Meetings section */}
          <nav
            className="sitemap__section"
            aria-labelledby="sitemap-nav-meetings"
          >
            <h2 id="sitemap-nav-meetings">Reuniones</h2>
            <ul>
              <li>
                <Link to="/#reuniones">Iniciar Nueva Reunión</Link>
              </li>
              <li>
                <Link to="/#reuniones">Unirse a Reunión</Link>
              </li>
            </ul>
          </nav>

          {/* User account section */}
          <nav className="sitemap__section" aria-labelledby="sitemap-nav-user">
            <h2 id="sitemap-nav-user">Usuario</h2>
            <ul>
              <li>
                <Link to="/login">Iniciar Sesión</Link>
              </li>
              <li>
                <Link to="/register">Registrarse</Link>
              </li>
              <li>
                <Link to="/profile">Mi Perfil</Link>
              </li>
            </ul>
          </nav>

          {/* Resources section */}
          <nav
            className="sitemap__section"
            aria-labelledby="sitemap-nav-resources"
          >
            <h2 id="sitemap-nav-resources">Recursos</h2>
            <ul>
              <li>
                <a href="#" aria-label="Manual de usuario de JoinUs">
                  Manual de Usuario
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default SiteMap;
