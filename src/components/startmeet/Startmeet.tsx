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
import type { FC, FormEvent, ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [meetingCode, setMeetingCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  /**
   * Initialize AOS (Animate On Scroll) library
   * Runs once on component mount
   */
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  /**
   * Handles meeting code input change
   * Only allows digits and limits to 6 characters
   */
  const handleMeetingCodeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setMeetingCode(value);
    setError('');
  };

  /**
   * Handles form submission for joining a meeting
   * Validates meeting code and redirects to conference page
   *
   * @param {FormEvent<HTMLFormElement>} e - Form submission event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Validate meeting code format (6 digits)
    if (!/^\d{6}$/.test(meetingCode)) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';

      // Check if meeting exists
      const response = await fetch(`${CHAT_SERVER_URL}/api/meetings/${meetingCode}`);

      if (!response.ok) {
        throw new Error('Meeting not found');
      }

      const data = await response.json();

      // Check if meeting is full
      if (data.participantCount >= 10) {
        setError('La reunión está llena (máximo 10 participantes)');
        setIsJoining(false);
        return;
      }

      // Redirect to conference page
      navigate(`/conference/${meetingCode}`);
    } catch (err) {
      console.error('Error joining meeting:', err);
      setError('Reunión no encontrada. Verifica el código e intenta de nuevo.');
    } finally {
      setIsJoining(false);
    }
  };

  /**
   * Handles starting a new meeting
   * Redirects to login if not authenticated, otherwise to meeting page
   */
  const handleStartMeeting = (): void => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/meeting');
    }
  };

  return (
    <section id="reuniones" className="startmeet" aria-labelledby="startmeet-heading">
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
            value={meetingCode}
            onChange={handleMeetingCodeChange}
            placeholder="Ingresa el código de 6 dígitos..."
            aria-label="Ingresar código de reunión"
            aria-invalid={!!error}
            aria-describedby={error ? 'meeting-code-error' : undefined}
            maxLength={6}
            required
          />

          {/* Submit button to join meeting */}
          <button
            type="submit"
            className="btn"
            disabled={isJoining || meetingCode.length !== 6}
          >
            {isJoining ? 'Uniéndose...' : 'Unirse a la reunión'}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div
            className="startmeet__error"
            id="meeting-code-error"
            role="alert"
            data-aos="fade-up"
          >
            {error}
          </div>
        )}

        {/* Alternative option - Start new meeting */}
        <div className="startmeet__alt" data-aos="fade-up">
          <p>O también puedes</p>
          <button
            type="button"
            className="btn"
            onClick={handleStartMeeting}
          >
            Iniciar una nueva reunión
          </button>
        </div>
      </div>
    </section>
  );
};

export default Startmeet;
