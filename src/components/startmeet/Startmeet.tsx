/**
 * Startmeet Component
 *
 * Meeting management section that allows users to:
 * - Join existing meetings using a code
 * - Start new private meetings
 * - Quick access to meeting functionality
 *
 * @component
 * @module Startmeet
 */

import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC, FormEvent } from 'react';
import { useEffect } from 'react';
import './Startmeet.scss';

/**
 * Start or join meeting section component
 *
 * Features:
 * - Meeting code input with validation
 * - Quick join functionality
 * - New meeting creation
 * - AOS animations for visual appeal
 * - Accessibility-compliant form
 *
 * @returns {JSX.Element} Rendered start meeting section
 */
const Startmeet: FC = () => {
  /**
   * Initialize AOS (Animate On Scroll) library
   * Runs once on component mount
   */
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  /**
   * Handles form submission for joining a meeting
   * Prevents default form behavior and processes the meeting code
   *
   * @param {FormEvent<HTMLFormElement>} e - Form submission event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // TODO: Implement meeting join logic with backend integration
  };

  return (
    <section className="startmeet" aria-labelledby="startmeet-heading">
      <div className="startmeet__container wrapper">
        {/* Section heading */}
        <h2 id="startmeet-heading" data-aos="fade-up">
          ¡Comienza o únete a tu reunión con un solo click!
        </h2>

        {/* Description text */}
        <p data-aos="fade-up">
          ¿Listo para conectar? Usa el código de invitación para unirte
          rápidamente a cualquier sala o crea una nueva reunión privada en este
          momento para empezar a hablar con quien quieras.
        </p>

        {/* Meeting code form */}
        <form
          action="#"
          data-aos="fade-up"
          onSubmit={handleSubmit}
          role="search"
        >
          {/* Screen reader only label */}
          <label htmlFor="meeting-code" className="sr-only">
            Código de reunión
          </label>

          {/* Meeting code input field */}
          <input
            type="text"
            id="meeting-code"
            name="meetingCode"
            placeholder="Ingresa el código..."
            aria-label="Ingresar código de reunión"
            required
          />

          {/* Submit button to join meeting */}
          <button type="submit" className="btn">
            Unirse a la reunión
          </button>
        </form>

        {/* Alternative option - Start new meeting */}
        <div className="startmeet__alt" data-aos="fade-up">
          <p>O también puedes</p>
          <button
            type="button"
            className="btn"
            onClick={() => console.log('Nueva reunión')}
          >
            Iniciar una nueva reunión
          </button>
        </div>
      </div>
    </section>
  );
};

export default Startmeet;
