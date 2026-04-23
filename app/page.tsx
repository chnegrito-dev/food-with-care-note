'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f3f4f6',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px 30px',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow: '0 10px 35px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            marginBottom: '30px',
          }}
        >
          <img
            src="/food-care-logo.png"
            alt="Food With Care logo"
            width="110"
            style={{
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>

        <h1
          style={{
            marginTop: 0,
            marginBottom: '12px',
            fontSize: '28px',
            lineHeight: 1.2,
            fontWeight: 'bold',
          }}
        >
          Food With Care
        </h1>

        <p
          style={{
            margin: '0 0 40px 0',
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#6b7280',
          }}
        >
          Secure delivery tracking and menu selection
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <button
            onClick={() => router.push('/signature')}
            style={{
              padding: '18px 24px',
              borderRadius: '14px',
              border: 'none',
              background: '#000',
              color: 'white',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = '#1f2937';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = '#000';
            }}
          >
            📋 Prepare Signature Link
          </button>

          <button
            onClick={() => router.push('/menu-send')}
            style={{
              padding: '18px 24px',
              borderRadius: '14px',
              border: '2px solid #000',
              background: 'white',
              color: '#000',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'white';
            }}
          >
            🍽️ Prepare Menu Link
          </button>
        </div>

        <p
          style={{
            marginTop: '30px',
            fontSize: '13px',
            color: '#9ca3af',
          }}
        >
          Choose an option above to get started
        </p>
      </div>
    </main>
  );
}
