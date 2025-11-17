import type { FC } from 'react';
import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { IoMenu } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import Logo from '../../assets/JoinUs.png';
import './Navbar.scss';

/**
 * Type definition for navigation link objects
 * @typedef {Object} NavLink
 * @property {string} label - Display text for the link
 * @property {string} path - Route path for the link
 */
type NavLink = {
  label: string;
  path: string;
};

/**
 * Array of main navigation links
 * Defined as readonly to prevent accidental modifications
 * @constant
 * @type {readonly NavLink[]}
 */
const NAV_LINKS: readonly NavLink[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Sobre Nosotros', path: '/about' },
  { label: 'Mapa del Sitio', path: '/sitemap' },
] as const;

/**
 * Navigation bar component with responsive menu and accessibility features
 *
 * State Management:
 * - showNav: Controls mobile menu visibility
 *
 * Accessibility Features:
 * - ARIA labels for screen readers
 * - aria-expanded for menu state
 * - aria-current for active page indication
 * - Semantic HTML (nav, header, etc.)
 *
 * @returns {JSX.Element} Rendered navigation bar
 */
const Navbar: FC = () => {
  const [showNav, setShowNav] = useState<boolean>(false);

  /**
   * Toggles the mobile navigation menu visibility
   * @function
   */
  const handleToggleNav = (): void => {
    setShowNav((prev: boolean): boolean => !prev);
  };

  /**
   * Closes the mobile navigation menu
   * Used when a navigation link is clicked
   * @function
   */
  const handleCloseNav = (): void => {
    setShowNav(false);
  };

  return (
    <header className="navbar" role="banner">
      <nav
        className="navbar__container wrapper"
        aria-label="Navegación principal"
      >
        {/* Logo - Link to home page */}
        <Link
          to="/"
          className="navbar__logo"
          onClick={handleCloseNav}
          aria-label="JoinUs - Ir a inicio"
        >
          <img src={Logo} alt="JoinUs" />
        </Link>

        {/* Navigation links - shown/hidden based on showNav state */}
        <ul className={`navbar__links ${showNav ? 'show' : ''}`} role="list">
          {NAV_LINKS.map((link: NavLink) => (
            <li key={link.label}>
              <Link
                to={link.path}
                onClick={handleCloseNav}
                aria-current={
                  window.location.pathname === link.path ? 'page' : undefined
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

                <div className="navbar__btns">
                        <Link to="/login" className="navbar__login-btn">
                        Iniciar Sesión
                        </Link>
                    <a href="#" className="btn">
                        Registrarse
                    </a>
                </div>

        {/* Mobile menu toggle button */}
        <button
          type="button"
          className="navbar__menu"
          onClick={handleToggleNav}
          aria-expanded={showNav}
          aria-label={
            showNav ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
          }
          aria-controls="navbar-links"
        >
          {showNav ? (
            <IoMdClose aria-hidden="true" />
          ) : (
            <IoMenu aria-hidden="true" />
          )}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
