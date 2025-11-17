import type { FC } from 'react';
import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { IoMenu } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import Logo from '../../assets/JoinUs.png';
import './Navbar.scss';

type NavLink = {
  label: string;
  path: string;
};

const NAV_LINKS: readonly NavLink[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Sobre Nosotros', path: '/about' },
  { label: 'Mapa del Sitio', path: '/sitemap' },
] as const;

const Navbar: FC = () => {
  const [showNav, setShowNav] = useState<boolean>(false);

  const handleToggleNav = (): void => {
    setShowNav((prev: boolean): boolean => !prev);
  };

  const handleCloseNav = (): void => {
    setShowNav(false);
  };

  return (
    <header className="navbar" role="banner">
      <nav
        className="navbar__container wrapper"
        aria-label="Navegación principal"
      >
        <Link
          to="/"
          className="navbar__logo"
          onClick={handleCloseNav}
          aria-label="JoinUs - Ir a inicio"
        >
          <img src={Logo} alt="JoinUs" />
        </Link>

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

        <div className="navbar__btns" aria-label="Acciones de usuario">
          <Link to="/login" className="navbar__login-btn">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="btn">
            Registrarse
          </Link>
        </div>

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
