import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function usePresentationMode() {
  const [active, setActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        navigate('/console');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return { presentationActive: active, setPresentationActive: setActive };
}
