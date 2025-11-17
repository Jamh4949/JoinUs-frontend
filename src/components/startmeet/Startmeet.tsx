import AOS from 'aos';
import 'aos/dist/aos.css';
import type { FC, FormEvent } from 'react';
import { useEffect } from 'react';
import './Startmeet.scss';

const Startmeet: FC = () => {
  useEffect((): void => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  return (
    <section className="startmeet" aria-labelledby="startmeet-heading">
      <div className="startmeet__container wrapper">
        <h2 id="startmeet-heading" data-aos="fade-up">
          ¡Comienza o únete a tu reunión con un solo click!
        </h2>
        <p data-aos="fade-up">
          ¿Listo para conectar? Usa el código de invitación para unirte
          rápidamente a cualquier sala o crea una nueva reunión privada en este
          momento para empezar a hablar con quien quieras.
        </p>
        <form
          action="#"
          data-aos="fade-up"
          onSubmit={handleSubmit}
          role="search"
        >
          <label htmlFor="meeting-code" className="sr-only">
            Código de reunión
          </label>
          <input
            type="text"
            id="meeting-code"
            name="meetingCode"
            placeholder="Ingresa el código..."
            aria-label="Ingresar código de reunión"
            required
          />
          <button type="submit" className="btn">
            Unirse a la reunión
          </button>
        </form>
        <div className="startmeet__alt" data-aos="fade-up">
          <p>O también puedes</p>
          <button
            type="button"
            className="btn"
            onClick={() => console.log('Nueva reunión')}
          >
            Iniciar una nueva reunión
          </button>
        </div>
      </div>
    </section>
  );
};

export default Startmeet;
