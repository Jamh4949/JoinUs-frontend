import './Login/Login.scss';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC, FormEvent, ChangeEvent } from 'react';
import { loginWithGoogle, loginWithGithub, loginWithEmail } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      const token = await result.getIdToken();
      
      const response = await fetch(`${API_URL}/users/userExist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Error al verificar el usuario');
      }

      const res = await response.json();

      if (!res.exists) {
        navigate('/registroExterno', {
          state: { googleData: res.googleData }
        });
      } else {
        // User exists, login with backend JWT token
        const userData = {
          uid: result.uid,
          email: result.email || '',
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          name: result.displayName || '',
          photo: result.photoURL || '',
          token: res.token, // Use backend JWT token
        };
        login(userData);
        alert('¡Inicio de sesión exitoso! Redirigiendo...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      alert('Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginWithGithub();
      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/users/userExist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Error al verificar el usuario');
      }

      const res = await response.json();

      if (!res.exists) {
        navigate('/registroExterno', {
          state: { googleData: res.googleData }
        });
      } else {
        // User exists, login with backend JWT token
        const userData = {
          uid: user.uid,
          email: user.email || '',
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          name: user.displayName || '',
          photo: user.photoURL || '',
          token: res.token, // Use backend JWT token
        };
        login(userData);
        alert('¡Inicio de sesión exitoso! Redirigiendo...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      alert('Error al iniciar sesión con GitHub');
    } finally {
      setIsLoading(false);
    }
  };
  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof LoginFormData]);
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
      const firebaseUser = await loginWithEmail(formData.email, formData.password);
      const firebaseToken = await firebaseUser.getIdToken();
      
      // Get backend JWT token
      const response = await fetch(`${API_URL}/users/userExist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: firebaseToken }),
      });

      if (!response.ok) {
        throw new Error('Error al verificar el usuario');
      }

      const res = await response.json();
      
      if (res.exists && res.token) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          name: firebaseUser.displayName || `${res.user.firstName} ${res.user.lastName}`,
          photo: firebaseUser.photoURL || '',
          token: res.token, // Use backend JWT token
        };
        login(userData);
        alert('¡Inicio de sesión exitoso! Redirigiendo...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        alert('Error al iniciar sesión. Usuario no encontrado.');
      }
    } catch (err) {
      console.error(err);
      alert('Correo o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="login" aria-labelledby="login-heading">
      <div className="login__container wrapper">
        <div className="login__card" data-aos="zoom-in">
          <h1 id="login-heading">Iniciar Sesión</h1>
          <p className="login__subtitle">Accede a tu cuenta de JoinUs</p>

          {/* Formulario de email/password */}
          <form className="login__form" onSubmit={handleEmailLogin} noValidate>
            <div className="login__field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email && touched.email ? 'error' : ''}
                placeholder="tu@email.com"
                aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                disabled={isLoading}
              />
              {errors.email && touched.email && (
                <span className="login__error" id="email-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="login__field">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password && touched.password ? 'error' : ''}
                placeholder="Mínimo 8 caracteres"
                aria-invalid={errors.password && touched.password ? 'true' : 'false'}
                aria-describedby={errors.password && touched.password ? 'password-error' : undefined}
                disabled={isLoading}
              />
              {errors.password && touched.password && (
                <span className="login__error" id="password-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="login__options">
              <Link to="/forgot-password" className="login__forgot">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className="btn login__submit" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="login__divider">
            <span>O</span>
          </div>

          {/* Botones de login social */}
          <div className="login__social">
            <button
              type="button"
              className="login__social-btn login__social-btn--google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              aria-label="Iniciar sesión con Google"
            >
              <FcGoogle size={20} />
              <span>Continuar con Google</span>
            </button>

            <button
              type="button"
              className="login__social-btn login__social-btn--github"
              onClick={handleGithubLogin}
              disabled={isLoading}
              aria-label="Iniciar sesión con GitHub"
            >
              <FaGithub size={20} />
              <span>Continuar con GitHub</span>
            </button>
          </div>

          {/* Link a registro */}
          <p className="login__register">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default Login;
