import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import RegisterOAuth from './pages/RegisterOAuth';
import RegisterManual from './pages/Register/Register';
import Login from './pages/Login';
import About from './pages/About/About';
import SiteMap from './pages/SiteMap/SiteMap';
import Meeting from './pages/Meeting/Meeting';
import Profile from './pages/Profile/Profile';
import Conference from './pages/Conference/Conference';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';

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
    <Routes>
      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* REGISTRO MANUAL (Email y contraseña) */}
      <Route path="/register" element={<RegisterManual />} />

      {/* REGISTRO OAUTH (Completar perfil después de Google/GitHub) */}
      <Route path="/registroExterno" element={<RegisterOAuth />} />

      {/* SOBRE NOSOTROS */}
      <Route path="/about" element={<About />} />

      {/* MAPA DEL SITIO */}
      <Route path="/sitemap" element={<SiteMap />} />

      {/* REUNIÓN */}
      <Route path="/meeting" element={<Meeting />} />

      {/* PERFIL DE USUARIO */}
      <Route path="/profile" element={<Profile />} />

      {/* CONFERENCIA */}
      <Route path="/conference/:meetingId" element={<Conference />} />

      {/* RECUPERAR CONTRASEÑA */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* RESTABLECER CONTRASEÑA */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
};

export default App;
