import './Navbar.scss';
import { IoMenu } from 'react-icons/io5';
import { IoMdClose } from 'react-icons/io';
import { useState } from 'react';
import Logo from '../../assets/JoinUs.png';
import type { FC } from 'react';
import { Link } from "react-router-dom";

type NavLink = {
    label: string;
    href: string;
};

const NAV_LINKS: readonly NavLink[] = [
    { label: 'Inicio', href: '#' },
    { label: 'Sobre Nosotros', href: '#' },
    { label: 'Mapa del Sitio', href: '#' },
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
        <header className="navbar">
            <nav className="navbar__container wrapper">
                <a 
                    href="#" 
                    className="navbar__logo" 
                    onClick={handleCloseNav}
                >
                    <img src={Logo} alt="Logo de JoinUs" />
                </a>

                <ul className={`navbar__links ${showNav ? 'show' : ''}`}>
                    {NAV_LINKS.map((link: NavLink) => (
                        <li key={link.label}>
                            <a href={link.href} onClick={handleCloseNav}>
                                {link.label}
                            </a>
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

                <button
                    type="button"
                    className="navbar__menu"
                    onClick={handleToggleNav}
                    aria-expanded={showNav}
                    aria-label="Abrir o cerrar menú"
                >
                    {showNav ? <IoMdClose /> : <IoMenu />}
                </button>
            </nav>
        </header>
    );
};

export default Navbar;
