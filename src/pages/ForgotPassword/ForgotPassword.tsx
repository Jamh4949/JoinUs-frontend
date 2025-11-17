import AOS from 'aos';
import 'aos/dist/aos.css';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.scss';

const ForgotPassword: FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setEmail(value);

    // Validar el campo si ya fue tocado
    if (touched) {
      const validationError = validateEmail(value);
      setError(validationError);
    }
  };

  const handleBlur = (): void => {
    setTouched(true);
    const validationError = validateEmail(email);
    setError(validationError);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Validar el campo
    const validationError = validateEmail(email);
    setTouched(true);

    if (validationError) {
      setError(validationError);
      return;
    }

    // Si no hay errores, simular envío
    console.log('Recovery email sent to:', email);
    setSubmitted(true);

    // Aquí irá la lógica de envío al backend
    // Por ahora solo mostramos el mensaje de éxito
  };

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
            <div className="forgot-password__success-icon" aria-hidden="true">
              ✓
            </div>
            <h1>Correo Enviado</h1>
            <p className="forgot-password__message">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              . Por favor, revisa tu bandeja de entrada y sigue las
              instrucciones.
            </p>
            <p className="forgot-password__note">
              Si no recibes el correo en los próximos minutos, revisa tu carpeta
              de spam.
            </p>
            <Link to="/login" className="btn forgot-password__back-btn">
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="forgot-password">
      <div className="forgot-password__container wrapper">
        <div className="forgot-password__card" data-aos="zoom-in">
          <h1>Recuperar Contraseña</h1>
          <p className="forgot-password__subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>

          <form
            onSubmit={handleSubmit}
            className="forgot-password__form"
            noValidate
          >
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

            <button type="submit" className="btn forgot-password__submit">
              Enviar Enlace de Recuperación
            </button>
          </form>

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
