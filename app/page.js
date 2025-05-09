'use client';

import dynamic from 'next/dynamic';
import LoadingSpinner from './components/LoadingSpinner';

// Dynamically import components with SSR disabled to prevent hydration issues
const HomeContent = dynamic(() => import('./components/HomeContent'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function Home() {
  return <HomeContent />;
}
