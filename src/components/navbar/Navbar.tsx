import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { IoMdClose } from 'react-icons/io';
import { IoMenu } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/JoinUs.png';
import './Navbar.scss';
import { useAuth } from '../../contexts/AuthContext';

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
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  /**
   * Handles user logout
   * Clears session and redirects to home
   * @function
   */
  const handleLogout = (): void => {
    setShowDropdown(false);
    handleCloseNav();
    alert('Sesión cerrada con éxito. Redirigiendo...');
    
    // Small delay before logout
    setTimeout(() => {
      logout();
      navigate('/');
    }, 1000);
  };

  /**
   * Toggles the user dropdown menu
   * @function
   */
  const toggleDropdown = (): void => {
    setShowDropdown(!showDropdown);
  };

  /**
   * Gets the first letter of the user's name for the avatar
   * @function
   * @returns {string} First letter of the user's name
   */
  const getUserInitial = (): string => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return 'U';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          {/* Mobile auth buttons */}
          {!isAuthenticated ? (
            <>
              <li className="navbar__mobile-btns">
                <Link to="/login" onClick={handleCloseNav} className="navbar__mobile-login">
                  Iniciar Sesión
                </Link>
              </li>
              <li className="navbar__mobile-btns">
                <Link to="/register" onClick={handleCloseNav} className="btn">
                  Registrarse
                </Link>
              </li>
            </>
          ) : (
            <li className="navbar__mobile-btns">
              <button onClick={handleLogout} className="btn">
                Cerrar Sesión
              </button>
            </li>
          )}
        </ul>

        {/* Desktop auth section */}
        <div className="navbar__btns">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar__login-btn">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn">
                Registrarse
              </Link>
            </>
          ) : (
            <div className="navbar__user-dropdown" ref={dropdownRef}>
              <button 
                className="navbar__user-btn" 
                onClick={toggleDropdown}
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <div className="navbar__user-avatar">
                  {getUserInitial()}
                </div>
                <span className="navbar__user-name">
                  {user?.firstName || user?.name || 'Usuario'} {user?.lastName || ''}
                </span>
              </button>

              {showDropdown && (
                <div className="navbar__dropdown-menu">
                  <Link 
                    to="/profile" 
                    className="navbar__dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Editar perfil
                  </Link>
                  <button 
                    className="navbar__dropdown-item navbar__dropdown-item--logout"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
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
