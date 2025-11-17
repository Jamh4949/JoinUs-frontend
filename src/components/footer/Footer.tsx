import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/JoinUs.png';
import './Footer.scss';

const Footer: FC = () => {
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container wrapper" data-aos="fade-up">
        <div className="footer__col">
          <img src={Logo} alt="JoinUs" />
          <p className="footer__copyright">JoinUs © 2024.</p>
          <p className="footer__copyright">All rights reserved.</p>
        </div>

        <nav className="footer__col" aria-label="Navegación del sitio">
          <h3>Accede a:</h3>
          <Link to="/">Inicio</Link>
          <Link to="/about">Sobre Nosotros</Link>
          <Link to="/sitemap">Mapa del Sitio</Link>
        </nav>

        <nav className="footer__col" aria-label="Opciones de cuenta">
          <h3>Opciones del Usuario:</h3>
          <Link to="/login">Login</Link>
          <Link to="/register">Registro</Link>
          <Link to="/forgot-password">Olvidé mi Contraseña</Link>
        </nav>

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
