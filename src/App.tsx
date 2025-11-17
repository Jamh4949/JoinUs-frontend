import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/footer/Footer';
import Navbar from './components/navbar/Navbar';
import RegisterProvider from './pages/Register';
import Login from './pages/Login';
import Startmeet from './components/startmeet/Startmeet';
import Hero from './components/hero/Hero';

/**
 * Root component that orchestrates the entire application
 *
 * Main features:
 * - Skip link for WCAG 2.1 accessibility compliance
 * - Automatic scroll on page change
 * - Persistent navigation (Navbar and Footer)
 * - Declarative routing with React Router
 *
 * @returns {JSX.Element} Complete application structure
 */
const App: FC = () => {
  return (
    <>
      <Navbar />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Startmeet />
              <Footer />
            </>
          }
        />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/*REGISTROS*/}
        <Route path="/registroExterno" element={<RegisterProvider />} />
      </Routes>
    </>
  );
};

export default App;
