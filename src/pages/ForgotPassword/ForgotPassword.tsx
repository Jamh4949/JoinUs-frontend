/**
 * ForgotPassword Page Component
 *
 * Password recovery page that allows users to:
 * - Request a password reset link via email
 * - View success confirmation after submission
 * - Navigate back to login
 *
 * Features:
 * - Email validation
 * - Success state management
 * - Accessibility-compliant form
 * - Clear user feedback
 * - AOS animations
 *
 * @component
 * @module ForgotPassword
 */

import AOS from 'aos';
import 'aos/dist/aos.css';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.scss';

/**
 * Password recovery page component
 *
 * State Management:
 * - email: Stores the entered email address
 * - error: Stores validation error message
 * - touched: Tracks if the field has been interacted with
 * - submitted: Controls display of success message
 *
 * Flow:
 * 1. User enters email
 * 2. Email is validated
 * 3. On successful submission, shows confirmation message
 * 4. Provides link to return to login
 *
 * @returns {JSX.Element} Rendered forgot password page
 */
const ForgotPassword: FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  /**
   * Initialize AOS (Animate On Scroll) library
   * Runs once on component mount
   */
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  /**
   * Validates email address format
   *
   * @param {string} value - Email address to validate
   * @returns {string | undefined} Error message if validation fails, undefined otherwise
   */
  const validateEmail = (value: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      return 'El correo electrónico es requerido';
    }
    if (!emailRegex.test(value)) {
      return 'Correo electrónico inválido';
    }
    return undefined;
  };

  /**
   * Handles email input changes
   * Updates state and validates if field was already touched
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setEmail(value);

    // Validate field if it was already touched
    if (touched) {
      const validationError = validateEmail(value);
      setError(validationError);
    }
  };

  /**
   * Handles input field blur event
   * Marks field as touched and validates
   */
  const handleBlur = (): void => {
    setTouched(true);
    const validationError = validateEmail(email);
    setError(validationError);
  };

  /**
   * Handles form submission
   * Validates email and shows success message if valid
   *
   * @param {FormEvent<HTMLFormElement>} e - Form submission event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Validate the field
    const validationError = validateEmail(email);
    setTouched(true);

    if (validationError) {
      setError(validationError);
      return;
    }

    // If no errors, simulate email sending
    console.log('Recovery email sent to:', email);
    setSubmitted(true);

    // TODO: Implement backend integration for password recovery
  };

  // Success state - shown after form submission
  if (submitted) {
    return (
      <section className="forgot-password">
        <div className="forgot-password__container wrapper">
          <div
            className="forgot-password__card forgot-password__card--success"
            data-aos="zoom-in"
            role="status"
            aria-live="polite"
          >
            {/* Success icon */}
            <div className="forgot-password__success-icon" aria-hidden="true">
              ✓
            </div>

            {/* Success heading */}
            <h1>Correo Enviado</h1>

            {/* Confirmation message */}
            <p className="forgot-password__message">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              . Por favor, revisa tu bandeja de entrada y sigue las
              instrucciones.
            </p>

            {/* Additional note */}
            <p className="forgot-password__note">
              Si no recibes el correo en los próximos minutos, revisa tu carpeta
              de spam.
            </p>

            {/* Return to login link */}
            <Link to="/login" className="btn forgot-password__back-btn">
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Form state - initial view
  return (
    <section className="forgot-password">
      <div className="forgot-password__container wrapper">
        <div className="forgot-password__card" data-aos="zoom-in">
          {/* Page heading */}
          <h1>Recuperar Contraseña</h1>
          <p className="forgot-password__subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>

          {/* Password recovery form */}
          <form
            onSubmit={handleSubmit}
            className="forgot-password__form"
            noValidate
          >
            {/* Email field */}
            <div className="forgot-password__field">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="tu@email.com"
                className={error && touched ? 'error' : ''}
                aria-invalid={error && touched ? 'true' : 'false'}
                aria-describedby={error && touched ? 'email-error' : undefined}
              />
              {error && touched && (
                <span
                  className="forgot-password__error"
                  id="email-error"
                  role="alert"
                >
                  {error}
                </span>
              )}
            </div>

            {/* Submit button */}
            <button type="submit" className="btn forgot-password__submit">
              Enviar Enlace de Recuperación
            </button>
          </form>

          {/* Link back to login */}
          <p className="forgot-password__back">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
