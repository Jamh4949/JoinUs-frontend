/**
 * Footer Component
 *
 * Site-wide footer containing:
 * - Branding and copyright information
 * - Navigation links organized by category
 * - Authentication links
 * - Documentation access
 * - AOS animations for visual appeal
 *
 * @component
 * @module Footer
 */

import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/JoinUs.png';
import './Footer.scss';

/**
 * Footer component with navigation and site information
 *
 * Features:
 * - Organized navigation sections
 * - AOS fade-up animation on scroll
 * - Responsive grid layout
 * - Accessibility-compliant navigation
 *
 * @returns {JSX.Element} Rendered footer
 */
const Footer: FC = () => {
  /**
   * Initialize AOS (Animate On Scroll) library
   * Runs once on component mount
   */
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container wrapper" data-aos="fade-up">
        {/* Branding column with logo and copyright */}
        <div className="footer__col">
          <img src={Logo} alt="JoinUs" />
          <p className="footer__copyright">JoinUs © 2024.</p>
          <p className="footer__copyright">Todos los derechos reservados.</p>
        </div>

        {/* Site navigation column */}
        <nav className="footer__col" aria-label="Navegación del sitio">
          <h3>Accede a:</h3>
          <Link to="/">Inicio</Link>
          <Link to="/about">Sobre Nosotros</Link>
          <Link to="/sitemap">Mapa del Sitio</Link>
        </nav>

        {/* User account options column */}
        <nav className="footer__col" aria-label="Opciones de cuenta">
          <h3>Opciones del Usuario:</h3>
          <Link to="/login">Login</Link>
          <Link to="/register">Registro</Link>
          <Link to="/forgot-password">Olvidé mi Contraseña</Link>
        </nav>

        {/* Documentation and help column */}
        <div className="footer__col">
          <h3>Guía:</h3>
          <a href="#" aria-label="Manual de usuario de JoinUs">
            Manual de Usuario
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
