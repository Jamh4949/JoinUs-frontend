/**
 * Hero Component
 *
 * Landing page hero section featuring:
 * - Main value proposition headline
 * - Descriptive content
 * - Primary call-to-action buttons
 * - Illustrative image
 * - AOS animations for visual engagement
 *
 * @component
 * @module Hero
 */

import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero1 from '../../assets/hero1.png';
import './Hero.scss';

/**
 * Hero section component for the home page
 *
 * Features:
 * - Responsive two-column layout
 * - Animated entrance with AOS
 * - Clear call-to-action buttons
 * - Accessibility-compliant structure
 *
 * @returns {JSX.Element} Rendered hero section
 */
const Hero: FC = () => {
  /**
   * Initialize AOS (Animate On Scroll) library
   * Runs once on component mount
   */
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__container wrapper">
        {/* Left column - Hero image with fade-right animation */}
        <div className="hero__left" data-aos="fade-right">
          <img
            src={Hero1}
            alt="Ilustración de videoconferencia con múltiples usuarios conectados"
          />
        </div>

        {/* Right column - Content and CTAs with zoom-in animation */}
        <div className="hero__right" data-aos="zoom-in-up">
          {/* Main headline */}
          <h1 id="hero-heading">Videoconferencias simplificadas</h1>

          {/* Description */}
          <p>
            Crea y gestiona tus reuniones con facilidad. Únete a JoinUs y
            transforma tu experiencia de comunicación.
          </p>

          {/* Call-to-action section */}
          <div className="hero__cta">
            {/* Primary CTA - Register */}
            <Link
              to="/register"
              className="btn"
              aria-label="Registrarse en JoinUs"
            >
              Únete ahora
            </Link>

            {/* Divider text */}
            <span className="hero__cta-alt" aria-hidden="true">
              O
            </span>

            {/* Secondary CTA - Login */}
            <div className="hero__login">
              <Link
                to="/login"
                className="hero__login-btn"
                aria-label="Iniciar sesión en JoinUs"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
