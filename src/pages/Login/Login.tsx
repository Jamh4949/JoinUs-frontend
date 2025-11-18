/**
 * Login Page Component
 *
 * User authentication page featuring:
 * - Email and password login form
 * - Social media authentication (Google, Facebook)
 * - Real-time form validation
 * - Password recovery link
 * - Accessibility-compliant form controls
 *
 * Implements WCAG 2.1 guidelines for form accessibility with
 * proper error handling and user feedback.
 *
 * @component
 * @module Login
 */

import AOS from 'aos';
import 'aos/dist/aos.css';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import './Login.scss';

/**
 * Type definition for login form data
 * @typedef {Object} LoginFormData
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Type definition for form validation errors
 * @typedef {Object} FormErrors
 * @property {string} [email] - Email validation error message
 * @property {string} [password] - Password validation error message
 */
interface FormErrors {
  email?: string;
  password?: string;
}

/**
 * Login page component with form validation and social auth
 *
 * State Management:
 * - formData: Stores email and password inputs
 * - errors: Validation error messages for each field
 * - touched: Tracks which fields have been interacted with
 *
 * Validation:
 * - Email: Must match standard email format
 * - Password: Minimum 8 characters
 *
 * @returns {JSX.Element} Rendered login page
 */
const Login: FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  /**
   * Initialize AOS (Animate On Scroll) library
   * Runs once on component mount
   */
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  /**
   * Validates a single form field
   *
   * @param {string} name - Field name to validate
   * @param {string} value - Field value to validate
   * @returns {string | undefined} Error message if validation fails, undefined otherwise
   */
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Correo electrónico inválido';
        }
        break;

      case 'password':
        if (value.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres';
        }
        break;
    }
    return undefined;
  };

  /**
   * Handles input field changes
   * Updates form data and validates if field was already touched
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field if it was already touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  /**
   * Handles input field blur events
   * Marks field as touched and validates its value
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Input blur event
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  /**
   * Handles form submission
   * Validates all fields and prevents submission if errors exist
   *
   * @param {FormEvent<HTMLFormElement>} e - Form submission event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof LoginFormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Don't submit if there are errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Login data:', formData);
    // TODO: Implement authentication logic with backend
  };

  /**
   * Handles Google OAuth login
   * @function
   */
  const handleGoogleLogin = (): void => {
    console.log('Login with Google');
    // TODO: Implement Google authentication
  };

  /**
   * Handles Facebook OAuth login
   * @function
   */
  const handleFacebookLogin = (): void => {
    console.log('Login with Facebook');
    // TODO: Implement Facebook authentication
  };

  return (
    <section className="login">
      <div className="login__container wrapper">
        <div className="login__card" data-aos="zoom-in">
          {/* Page heading */}
          <h1>Iniciar Sesión</h1>
          <p className="login__subtitle">Bienvenido de nuevo a JoinUs</p>

          {/* Social media authentication buttons */}
          <div className="login__social">
            <button
              type="button"
              className="login__social-btn login__social-btn--google"
              onClick={handleGoogleLogin}
              aria-label="Continuar con Google"
            >
              <FcGoogle size={24} aria-hidden="true" />
              <span>Continuar con Google</span>
            </button>
            <button
              type="button"
              className="login__social-btn login__social-btn--facebook"
              onClick={handleFacebookLogin}
              aria-label="Continuar con Facebook"
            >
              <FaFacebook size={24} aria-hidden="true" />
              <span>Continuar con Facebook</span>
            </button>
          </div>

          {/* Divider between social and manual login */}
          <div className="login__divider" role="separator" aria-label="O">
            <span aria-hidden="true">O</span>
          </div>

          {/* Manual login form */}
          <form onSubmit={handleSubmit} className="login__form" noValidate>
            {/* Email field */}
            <div className="login__field">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="tu@email.com"
                className={errors.email && touched.email ? 'error' : ''}
                aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                aria-describedby={
                  errors.email && touched.email ? 'email-error' : undefined
                }
              />
              {errors.email && touched.email && (
                <span className="login__error" id="email-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password field */}
            <div className="login__field">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="••••••••"
                className={errors.password && touched.password ? 'error' : ''}
                aria-invalid={
                  errors.password && touched.password ? 'true' : 'false'
                }
                aria-describedby={
                  errors.password && touched.password
                    ? 'password-error'
                    : undefined
                }
              />
              {errors.password && touched.password && (
                <span className="login__error" id="password-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Additional options */}
            <div className="login__options">
              <Link to="/forgot-password" className="login__forgot">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit button */}
            <button type="submit" className="btn login__submit">
              Iniciar Sesión
            </button>
          </form>

          {/* Link to registration */}
          <p className="login__register">
            ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
