import './Register/Register.scss';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

interface GoogleData {
  uid: string;
  email: string;
  name: string;
  photo?: string;
  token?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  age: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  age?: string;
}

const RegisterOAuth: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const googleData = location.state?.googleData as GoogleData | undefined;

  const [formData, setFormData] = useState<FormData>({
    firstName: googleData?.name?.split(' ')[0] || '',
    lastName: googleData?.name?.split(' ').slice(1).join(' ') || '',
    age: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  if (!googleData) {
    return (
      <section className="register">
        <div className="register__container wrapper">
          <div className="register__card" data-aos="zoom-in">
            <h1>Error</h1>
            <p className="register__subtitle">No se recibieron datos de autenticación.</p>
            <Link to="/login" className="btn" style={{ marginTop: '1rem' }}>
              Volver al Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(value)) {
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
    }
    return undefined;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
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

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/registerProvider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: googleData.uid,
          email: googleData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age),
          photo: googleData.photo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al completar el registro');
      }

      const data = await response.json();

      if (data && data.token) {
        // Login with backend JWT token
        const userData = {
          uid: googleData.uid,
          email: googleData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          photo: googleData.photo || '',
          token: data.token,
          hasPassword: data.user?.hasPassword || false, // Include hasPassword flag
        };
        login(userData);
        alert('¡Perfil completado exitosamente!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error al completar perfil:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Error al completar el perfil. Por favor intenta de nuevo.');
      }
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
          <h1>Completa tu Perfil</h1>
          <p className="register__subtitle">
            Solo necesitamos algunos datos adicionales
          </p>

          {googleData.photo && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img
                src={googleData.photo}
                alt="Foto de perfil"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="register__form" noValidate>
            {/* Email (solo lectura) */}
            <div className="register__field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={googleData.email}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

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

            <button type="submit" className="btn register__submit" disabled={isLoading}>
              {isLoading ? 'Completando perfil...' : 'Completar Perfil'}
            </button>
          </form>
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default RegisterOAuth;