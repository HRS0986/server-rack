'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

// This component ensures the children are only rendered on the client side
export default function ClientOnly({ children, fallback = <LoadingSpinner /> }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return fallback;
  }

  return (
    <div suppressHydrationWarning>{children}</div>
  );
}
