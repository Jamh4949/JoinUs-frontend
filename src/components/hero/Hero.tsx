import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero1 from '../../assets/hero1.png';
import './Hero.scss';

const Hero: FC = () => {
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__container wrapper">
        <div className="hero__left" data-aos="fade-right">
          <img
            src={Hero1}
            alt="Ilustración de videoconferencia con múltiples usuarios conectados"
          />
        </div>
        <div className="hero__right" data-aos="zoom-in-up">
          <h1 id="hero-heading">Videoconferencias simplificadas</h1>
          <p>
            Crea y gestiona tus reuniones con facilidad. Únete a JoinUs y
            transforma tu experiencia de comunicación.
          </p>
          <div className="hero__cta">
            <Link
              to="/register"
              className="btn"
              aria-label="Registrarse en JoinUs"
            >
              Únete ahora
            </Link>
            <span className="hero__cta-alt" aria-hidden="true">
              O
            </span>
            <div className="hero__login">
              <Link
                to="/login"
                className="hero__login-btn"
                aria-label="Iniciar sesión en JoinUs"
              >
                Inicia Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
