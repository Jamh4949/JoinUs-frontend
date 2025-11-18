import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Meeting.scss';
import type { FC } from 'react';

const Meeting: FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const userName = user?.firstName || user?.name || 'Usuario';

  return (
    <section className="meeting">
      <div className="meeting__container wrapper">
        <div className="meeting__card" data-aos="zoom-in">
          <div className="meeting__icon">✓</div>
          <h1 className="meeting__title">¡Reunión Iniciada!</h1>
          <p className="meeting__message">
            <strong>{userName}</strong>, te has unido exitosamente a la reunión
          </p>
          <div className="meeting__info">
            <p className="meeting__detail">
              <span className="meeting__label">Estado:</span>
              <span className="meeting__status">Conectado</span>
            </p>
            <p className="meeting__detail">
              <span className="meeting__label">Usuario:</span>
              <span>{userName}</span>
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="btn meeting__btn"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </section>
  );
};

export default Meeting;
