/**
 * Meeting Page Component
 * 
 * Allows users to create new meetings or join existing ones by ID.
 * Integrates with the chat server to manage meeting rooms.
 * 
 * Features:
 * - Create new meeting with unique 6-digit ID
 * - Join existing meeting by entering ID
 * - Redirect to conference page with meeting ID
 * - Authentication required
 * 
 * @component
 * @module Meeting
 */

import { useState, useEffect, type FC, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Meeting.scss';

/**
 * Meeting page component
 * 
 * Provides interface for creating or joining meetings.
 * Requires user authentication.
 * 
 * @returns {JSX.Element} Rendered meeting page
 */
const Meeting: FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handles creating a new meeting
   * Calls the chat server API to generate a meeting ID
   */
  const handleCreateMeeting = async (): Promise<void> => {
    setIsCreating(true);
    setError('');

    try {
      const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';

      const response = await fetch(`${CHAT_SERVER_URL}/api/meetings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createdBy: user?.uid,
          creatorName: user?.firstName || user?.name || 'Usuario',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();

      // Redirect to conference page with meeting ID
      navigate(`/conference/${data.meetingId}`);
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Error al crear la reunión. Por favor, intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handles joining an existing meeting
   * Validates meeting ID and redirects to conference page
   * 
   * @param {FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleJoinMeeting = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsJoining(true);
    setError('');

    // Validate meeting ID format (6 digits)
    if (!/^\d{6}$/.test(meetingId)) {
      setError('El ID de la reunión debe tener 6 dígitos');
      setIsJoining(false);
      return;
    }

    try {
      const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';

      // Check if meeting exists
      const response = await fetch(`${CHAT_SERVER_URL}/api/meetings/${meetingId}`);

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
      navigate(`/conference/${meetingId}`);
    } catch (err) {
      console.error('Error joining meeting:', err);
      setError('Reunión no encontrada. Verifica el ID e intenta de nuevo.');
    } finally {
      setIsJoining(false);
    }
  };

  /**
   * Handles meeting ID input change
   * 
   * @param {ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleMeetingIdChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setMeetingId(value);
    setError('');
  };

  return (
    <>
      <Navbar />
      <section className="meeting" aria-labelledby="meeting-title">
        <div className="meeting__container wrapper">
          <h1 id="meeting-title" data-aos="fade-up">
            Reuniones
          </h1>

          <p className="meeting__subtitle" data-aos="fade-up">
            Crea una nueva reunión o únete a una existente
          </p>

          <div className="meeting__content" data-aos="zoom-in">
            {/* Create Meeting Section */}
            <div className="meeting__section">
              <div className="meeting__icon">➕</div>
              <h2>Crear Nueva Reunión</h2>
              <p>Inicia una reunión instantánea y comparte el ID con tus participantes</p>
              <button
                onClick={handleCreateMeeting}
                disabled={isCreating}
                className="btn meeting__btn"
                aria-label="Crear nueva reunión"
              >
                {isCreating ? 'Creando...' : 'Crear Reunión'}
              </button>
            </div>

            {/* Divider */}
            <div className="meeting__divider">
              <span>O</span>
            </div>

            {/* Join Meeting Section */}
            <div className="meeting__section">
              <div className="meeting__icon">🔗</div>
              <h2>Unirse a una Reunión</h2>
              <p>Ingresa el ID de 6 dígitos de la reunión</p>

              <form onSubmit={handleJoinMeeting} className="meeting__form">
                <input
                  type="text"
                  value={meetingId}
                  onChange={handleMeetingIdChange}
                  placeholder="123456"
                  maxLength={6}
                  className="meeting__input"
                  aria-label="ID de la reunión"
                  aria-describedby={error ? 'meeting-error' : undefined}
                  aria-invalid={!!error}
                />

                <button
                  type="submit"
                  disabled={isJoining || meetingId.length !== 6}
                  className="btn meeting__btn"
                  aria-label="Unirse a la reunión"
                >
                  {isJoining ? 'Uniéndose...' : 'Unirse'}
                </button>
              </form>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="meeting__error"
              id="meeting-error"
              role="alert"
              data-aos="fade-up"
            >
              {error}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Meeting;

