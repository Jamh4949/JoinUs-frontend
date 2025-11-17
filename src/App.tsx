import { Routes, Route } from "react-router-dom";
import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import Startmeet from './components/startmeet/Startmeet';
import Footer from './components/footer/Footer';
import Login from './pages/Login';
import RegisterProvider from './pages/Register'
import type { FC } from 'react';

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
