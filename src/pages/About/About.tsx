/**
 * About Page Component
 *
 * Displays information about the JoinUs platform and team including:
 * - Mission and vision statements
 * - Key differentiators and values
 * - Team member profiles
 * - Call-to-action for registration
 *
 * Features AOS animations for enhanced user experience.
 *
 * @component
 * @module About
 */

import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import './About.scss';

/**
 * Type definition for team member objects
 * @typedef {Object} TeamMember
 * @property {string} id - Unique identifier for the team member
 * @property {string} name - Full name of the team member
 * @property {string} role - Job title or role in the team
 * @property {string} [responsibility] - Optional description of responsibilities
 */
type TeamMember = {
  id: string;
  name: string;
  role: string;
  responsibility?: string;
};

/**
 * About Us page component
 *
 * Structure:
 * - Page header with main description
 * - Two-column layout:
 *   - Left: Mission, vision, and values
 *   - Right: Team member profiles
 *
 * @returns {JSX.Element} Rendered about page
 */
const About: FC = () => {
  /**
   * Initialize AOS library and refresh on mount
   * Ensures animations work correctly on page load
   */
  useEffect((): void => {
    AOS.init({ duration: 800, once: true });
    AOS.refresh();
  }, []);

  /**
   * Array of team members with their information
   * DevUV team structure and roles
   * @constant
   * @type {TeamMember[]}
   */
  const team: TeamMember[] = [
    {
      id: 'jose',
      name: 'Jose Martínez',
      role: 'Frontend Developer & Product Owner',
      responsibility: 'Lidera el producto, prioriza HU y coordina entregas.',
    },
    {
      id: 'john',
      name: 'John Ramos',
      role: 'Frontend Developer',
      responsibility: 'Implementación UI y experiencia de usuario.',
    },
    {
      id: 'dylan',
      name: 'Dylan Morales',
      role: 'Backend Developer',
      responsibility: 'APIs, autenticación y lógica de servidor.',
    },
    {
      id: 'kevin',
      name: 'Kevin Ramírez',
      role: 'Backend Developer & Database Admin',
      responsibility: 'Diseño de BD, despliegues y performance.',
    },
    {
      id: 'miguel',
      name: 'Miguel Casanova',
      role: 'Product Admin (HU, Taiga, Figma)',
      responsibility:
        'Gestión de historias de usuario, diseño en Figma y coordinación administrativa.',
    },
  ];

  return (
    <>
      <Navbar />
      <section className="about" aria-labelledby="about-title">
      <div className="about__container wrapper">
        {/* Page header with main introduction */}
        <header className="about__header" data-aos="fade-up">
          <h1 id="about-title">Sobre Nosotros</h1>
          <p className="about__lead">
            JoinUs es una plataforma de videoconferencias pensada para facilitar
            la colaboración remota con herramientas integradas que priorizan
            la simplicidad, la seguridad y la accesibilidad.
          </p>
        </header>

        {/* Two-column content layout */}
        <div className="about__columns">
          {/* Left column - Company information */}
          <article className="about__text" data-aos="fade-up">
            {/* Mission statement */}
            <h2>Nuestra misión</h2>
            <p>
              Ofrecer una experiencia de comunicación remota que sea confiable,
              privada y fácil de usar, para equipos de todos los tamaños.
            </p>

            {/* Vision statement */}
            <h2>Nuestra visión</h2>
            <p>
              Ser la plataforma preferida por equipos académicos y startups en
              Latinoamérica, impulsando colaboración inclusiva y segura.
            </p>

            {/* Key differentiators and values */}
            <h2>Lo que nos diferencia</h2>
            <ul className="about__values">
              <li>
                <strong>Simplicidad:</strong> interfaz clara y sin
                distracciones.
              </li>
              <li>
                <strong>Seguridad:</strong> cifrado de sesiones y buenas
                prácticas de autenticación.
              </li>
              <li>
                <strong>Accesibilidad:</strong> navegación por teclado y soporte
                para lectores de pantalla.
              </li>
              <li>
                <strong>Innovación:</strong> mejoras continuas basadas en
                feedback real.
              </li>
            </ul>

            {/* Call-to-action buttons */}
            <div className="about__cta">
              <Link
                to="/register"
                className="btn"
                aria-label="Registrarse en JoinUs"
              >
                Registrarse
              </Link>
              <Link
                to="/login"
                className="about__login-btn"
                aria-label="Iniciar sesión en JoinUs"
              >
                Iniciar Sesión
              </Link>
            </div>
          </article>

          {/* Right column - Team information */}
          <aside className="about__team" data-aos="fade-left">
            <h2>Nuestro equipo — DevUV</h2>
            <p className="about__team-intro">
              Somos un equipo multidisciplinario apasionado por crear soluciones
              de comunicación innovadoras y accesibles.
            </p>

            {/* Team member list */}
            <ul className="about__team-list">
              {team.map((member: TeamMember) => (
                <li key={member.id} className="about__team-member">
                  {/* Avatar with initial */}
                  <div className="about__team-member-avatar">
                    <span>{member.name.charAt(0)}</span>
                  </div>

                  {/* Member information */}
                  <div className="about__team-member-info">
                    <h3>{member.name}</h3>
                    <p className="about__team-member-role">{member.role}</p>
                    {member.responsibility && (
                      <p className="about__team-member-desc">
                        {member.responsibility}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default About;
