/**
 * Register Page Component
 *
 * User registration page featuring:
 * - Multi-field registration form
 * - Real-time validation with visual feedback
 * - Password strength requirements display
 * - Accessibility-compliant form controls
 * - AOS animations for visual appeal
 *
 * Validation includes:
 * - Name fields: Letters and spaces only, minimum 2 characters
 * - Age: Must be between 18 and 120
 * - Email: Standard email format
 * - Password: Complex requirements (8+ chars, uppercase, lowercase, number, special char)
 * - Confirm password: Must match password field
 *
 * @component
 * @module Register
 */

import AOS from 'aos';
import 'aos/dist/aos.css';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/footer/Footer';
import Navbar from '../../components/navbar/Navbar';
import './Register.scss';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

/**
 * Type definition for registration form data
 * @typedef {Object} RegisterFormData
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} age - User's age (as string for form handling)
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {string} confirmPassword - Password confirmation
 */
interface RegisterFormData {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Type definition for form validation errors
 * @typedef {Object} FormErrors
 * @property {string} [firstName] - First name validation error
 * @property {string} [lastName] - Last name validation error
 * @property {string} [age] - Age validation error
 * @property {string} [email] - Email validation error
 * @property {string} [password] - Password validation error
 * @property {string} [confirmPassword] - Password confirmation error
 */
interface FormErrors {
  firstName?: string;
  lastName?: string;
  age?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Registration page component with comprehensive form validation
 *
 * State Management:
 * - formData: Stores all form field values
 * - errors: Validation error messages for each field
 * - touched: Tracks which fields have been interacted with
 *
 * Features:
 * - Real-time validation feedback
 * - Password strength indicator
 * - Accessible error messages
 * - Responsive design
 *
 * @returns {JSX.Element} Rendered registration page
 */
const Register: FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialize AOS (Animate On Scroll) library
   * Runs once on component mount
   */
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  /**
   * Validates a single form field based on field-specific rules
   *
   * @param {string} name - Field name to validate
   * @param {string} value - Field value to validate
   * @returns {string | undefined} Error message if validation fails, undefined otherwise
   */
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        // Names must contain only letters and spaces
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'Solo se permiten letras y espacios';
        }
        // Names must be at least 2 characters
        if (value.trim().length < 2) {
          return 'Debe tener al menos 2 caracteres';
        }
        break;

      case 'age':
        const age = parseInt(value);
        // Age must be a valid number
        if (isNaN(age)) {
          return 'Debe ser un número válido';
        }
        // Age must be between 18 and 120
        if (age < 18 || age > 120) {
          return 'La edad debe estar entre 18 y 120 años';
        }
        break;

      case 'email':
        // Email must match standard email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Correo electrónico inválido';
        }
        break;

      case 'password':
        // Password must be at least 8 characters
        if (value.length < 8) {
          return 'Debe tener al menos 8 caracteres';
        }
        // Password must contain at least one uppercase letter
        if (!/[A-Z]/.test(value)) {
          return 'Debe contener al menos una mayúscula';
        }
        // Password must contain at least one lowercase letter
        if (!/[a-z]/.test(value)) {
          return 'Debe contener al menos una minúscula';
        }
        // Password must contain at least one number
        if (!/[0-9]/.test(value)) {
          return 'Debe contener al menos un número';
        }
        // Password must contain at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return 'Debe contener al menos un carácter especial';
        }
        break;

      case 'confirmPassword':
        // Confirm password must match password field
        if (value !== formData.password) {
          return 'Las contraseñas no coinciden';
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
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof RegisterFormData]);
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

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age),
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la cuenta');
      }

      const data = await response.json();

      if (data) {
        alert('¡Cuenta creada con éxito! Redirigiendo...');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      alert(error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="register">
      <div className="register__container wrapper">
        <div className="register__card" data-aos="zoom-in">
          {/* Page heading */}
          <h1>Crear Cuenta</h1>
          <p className="register__subtitle">
            Únete a JoinUs y comienza a conectar
          </p>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="register__form" noValidate>
            {/* First name field */}
            <div className="register__field">
              <label htmlFor="firstName">Nombres</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Juan"
                className={errors.firstName && touched.firstName ? 'error' : ''}
                aria-invalid={
                  errors.firstName && touched.firstName ? 'true' : 'false'
                }
                aria-describedby={
                  errors.firstName && touched.firstName
                    ? 'firstName-error'
                    : undefined
                }
                disabled={isLoading}
              />
              {errors.firstName && touched.firstName && (
                <span
                  className="register__error"
                  id="firstName-error"
                  role="alert"
                >
                  {errors.firstName}
                </span>
              )}
            </div>

            {/* Last name field */}
            <div className="register__field">
              <label htmlFor="lastName">Apellidos</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Pérez"
                className={errors.lastName && touched.lastName ? 'error' : ''}
                aria-invalid={
                  errors.lastName && touched.lastName ? 'true' : 'false'
                }
                aria-describedby={
                  errors.lastName && touched.lastName
                    ? 'lastName-error'
                    : undefined
                }
                disabled={isLoading}
              />
              {errors.lastName && touched.lastName && (
                <span
                  className="register__error"
                  id="lastName-error"
                  role="alert"
                >
                  {errors.lastName}
                </span>
              )}
            </div>

            {/* Age field */}
            <div className="register__field">
              <label htmlFor="age">Edad</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="18"
                min="18"
                max="120"
                className={errors.age && touched.age ? 'error' : ''}
                aria-invalid={errors.age && touched.age ? 'true' : 'false'}
                aria-describedby={
                  errors.age && touched.age ? 'age-error' : undefined
                }
                disabled={isLoading}
              />
              {errors.age && touched.age && (
                <span className="register__error" id="age-error" role="alert">
                  {errors.age}
                </span>
              )}
            </div>

            {/* Email field */}
            <div className="register__field">
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
                disabled={isLoading}
              />
              {errors.email && touched.email && (
                <span className="register__error" id="email-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password field with requirements indicator */}
            <div className="register__field">
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
                    ? 'password-error password-requirements'
                    : 'password-requirements'
                }
              />
              {errors.password && touched.password && (
                <span
                  className="register__error"
                  id="password-error"
                  role="alert"
                >
                  {errors.password}
                </span>
              )}
              {/* Password strength requirements with live validation feedback */}
              <div
                className="register__requirements"
                id="password-requirements"
                aria-live="polite"
              >
                <p>La contraseña debe contener:</p>
                <ul>
                  <li className={formData.password.length >= 8 ? 'valid' : ''}>
                    Mínimo 8 caracteres
                  </li>
                  <li
                    className={/[A-Z]/.test(formData.password) ? 'valid' : ''}
                  >
                    Una letra mayúscula
                  </li>
                  <li
                    className={/[a-z]/.test(formData.password) ? 'valid' : ''}
                  >
                    Una letra minúscula
                  </li>
                  <li
                    className={/[0-9]/.test(formData.password) ? 'valid' : ''}
                  >
                    Un número
                  </li>
                  <li
                    className={
                      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                        ? 'valid'
                        : ''
                    }
                  >
                    Un carácter especial
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm password field */}
            <div className="register__field">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="••••••••"
                className={
                  errors.confirmPassword && touched.confirmPassword
                    ? 'error'
                    : ''
                }
                aria-invalid={
                  errors.confirmPassword && touched.confirmPassword
                    ? 'true'
                    : 'false'
                }
                aria-describedby={
                  errors.confirmPassword && touched.confirmPassword
                    ? 'confirmPassword-error'
                    : undefined
                }
                disabled={isLoading}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <span
                  className="register__error"
                  id="confirmPassword-error"
                  role="alert"
                >
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Submit button */}
            <button type="submit" className="btn register__submit" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          {/* Link to login page */}
          <p className="register__login">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default Register;
