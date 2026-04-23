'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to menu-send page
    router.replace('/menu-send');
  }, [router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f3f4f6',
      }}
    >
      <p>Redirecting...</p>
    </main>
  );
}
