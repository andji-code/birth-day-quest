'use client';

import { useEffect } from 'react';

export default function TouchPreventer() {
  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      // Only prevent pull-to-refresh when swiping down from the top
      if (deltaY > 0 && startY < 50) {
        e.preventDefault();
      }
      
      // Also prevent if we're at the top and trying to scroll down
      if (window.scrollY === 0 && deltaY > 0) {
        e.preventDefault();
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup function
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return null; // This component doesn't render anything
} 