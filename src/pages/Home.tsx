import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Hero from '../components/hero/Hero';
import Startmeet from '../components/startmeet/Startmeet';
import Footer from '../components/footer/Footer';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if there's a hash in the URL
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      
      if (element) {
        // Small delay to ensure the page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <Navbar />
      {!isAuthenticated && <Hero />}
      <Startmeet />
      <Footer />
    </>
  );
};

export default Home;
