import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SiteMap.scss';

const SiteMap: FC = () => {
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section className="sitemap" aria-labelledby="sitemap-title">
      <div className="sitemap__container wrapper">
        <h1 id="sitemap-title" data-aos="fade-up">
          Mapa del Sitio
        </h1>
        <p data-aos="fade-up" className="sitemap__intro">
          Encuentra todas las páginas y secciones de JoinUs.
        </p>
        <div className="sitemap__content" data-aos="fade-up">
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

          <nav
            className="sitemap__section"
            aria-labelledby="sitemap-nav-meetings"
          >
            <h2 id="sitemap-nav-meetings">Reuniones</h2>
            <ul>
              <li>
                <Link to="/new-meeting">Iniciar Nueva Reunión</Link>
              </li>
              <li>
                <Link to="/join-meeting">Unirse a Reunión</Link>
              </li>
            </ul>
          </nav>

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
  );
};

export default SiteMap;
