import { useState, useEffect } from 'react';

export function usePerPage(desktopLimit: number, mobileLimit: number) {
  const [perPage, setPerPage] = useState(desktopLimit);

  useEffect(() => {
    const handleResize = () => {
      setPerPage(window.innerWidth < 640 ? mobileLimit : desktopLimit);
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [desktopLimit, mobileLimit]);

  return perPage;
}
