import type { FC } from 'react';
import Hero from '../../components/hero/Hero';
import Startmeet from '../../components/startmeet/Startmeet';
import './Home.scss';

const Home: FC = () => {
  return (
    <div className="home">
      <h1 className="sr-only">JoinUs - Inicio</h1>
      <Hero />
      <Startmeet />
    </div>
  );
};

export default Home;
