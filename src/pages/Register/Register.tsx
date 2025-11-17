import AOS from 'aos';
import 'aos/dist/aos.css';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.scss';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  age?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register: FC = () => {
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

  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'Solo se permiten letras y espacios';
        }
        if (value.trim().length < 2) {
          return 'Debe tener al menos 2 caracteres';
        }
        break;

      case 'age':
        const age = parseInt(value);
        if (isNaN(age)) {
          return 'Debe ser un número válido';
        }
        if (age < 18 || age > 120) {
          return 'La edad debe estar entre 18 y 120 años';
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Correo electrónico inválido';
        }
        break;

      case 'password':
        if (value.length < 8) {
          return 'Debe tener al menos 8 caracteres';
        }
        if (!/[A-Z]/.test(value)) {
          return 'Debe contener al menos una mayúscula';
        }
        if (!/[a-z]/.test(value)) {
          return 'Debe contener al menos una minúscula';
        }
        if (!/[0-9]/.test(value)) {
          return 'Debe contener al menos un número';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return 'Debe contener al menos un carácter especial';
        }
        break;

      case 'confirmPassword':
        if (value !== formData.password) {
          return 'Las contraseñas no coinciden';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar el campo si ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof RegisterFormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    // Marcar todos los campos como tocados
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Si hay errores, no enviar el formulario
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Register data:', formData);
    // Aquí irá la lógica de registro con el backend
  };

  return (
    <section className="register">
      <div className="register__container wrapper">
        <div className="register__card" data-aos="zoom-in">
          <h1>Crear Cuenta</h1>
          <p className="register__subtitle">
            Únete a JoinUs y comienza a conectar
          </p>
          <form onSubmit={handleSubmit} className="register__form" noValidate>
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
              />
              {errors.age && touched.age && (
                <span className="register__error" id="age-error" role="alert">
                  {errors.age}
                </span>
              )}
            </div>

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
              />
              {errors.email && touched.email && (
                <span className="register__error" id="email-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

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

            <button type="submit" className="btn register__submit">
              Registrarse
            </button>
          </form>

          <p className="register__login">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
