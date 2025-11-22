import { useState, type FC, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import './ResetPassword.scss';

/**
 * Reset Password page component
 * 
 * Features:
 * - Reset password with token from email link
 * - Password and confirmation validation
 * - Backend integration with POST /api/users/reset-password
 * - Success message and redirect to login
 * 
 * @returns {JSX.Element} Rendered reset password page
 */
const ResetPassword: FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handles input changes
   * @param {ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validates the form data
   * @returns {boolean} True if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas y números';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * @param {FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!token) {
      alert('Token inválido. Por favor solicita un nuevo enlace de recuperación.');
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_BACKEND_API_URL;

      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al restablecer la contraseña');
      }

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(error.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="reset-password">
        <div className="reset-password__container">
          {!success ? (
            <>
              <h1 className="reset-password__title">Recuperar Contraseña</h1>

              <form className="reset-password__form" onSubmit={handleSubmit}>
                <div className="reset-password__field">
                  <label htmlFor="password">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <span className="reset-password__error" id="password-error">
                      {errors.password}
                    </span>
                  )}
                </div>

                <div className="reset-password__field">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  {errors.confirmPassword && (
                    <span className="reset-password__error" id="confirmPassword-error">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn reset-password__submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </form>

              <div className="reset-password__links">
                <Link to="/forgot-password" className="reset-password__link">
                  Solicitar nuevo enlace
                </Link>
              </div>
            </>
          ) : (
            <div className="reset-password__success">
              <div className="reset-password__success-icon">✓</div>
              <h2>¡Contraseña cambiada!</h2>
              <p>
                Tu contraseña ha sido restablecida exitosamente.
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ResetPassword;
