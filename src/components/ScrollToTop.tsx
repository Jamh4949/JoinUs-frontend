import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: FC = () => {
  const { pathname } = useLocation();
  const previousPathname = useRef<string>(pathname);

  useEffect((): void => {
    if (previousPathname.current !== pathname) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });

      // Mover foco al contenido principal para lectores de pantalla
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
      }

      previousPathname.current = pathname;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
