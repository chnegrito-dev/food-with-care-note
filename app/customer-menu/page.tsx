'use client';

import { useState, useMemo } from 'react';
import { MenuOnboarding, CustomerData } from '../menu/components/MenuOnboarding';
import { MenuDisplay } from '../menu/components/MenuDisplay';

type MenuStep = 'onboarding' | 'menu';

const INITIAL_CUSTOMER_DATA: CustomerData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  addressLine1: '',
  city: '',
  state: '',
  zipCode: '',
};

export default function CustomerMenuPage() {
  const [step, setStep] = useState<MenuStep>('onboarding');
  const [customerData, setCustomerData] = useState<CustomerData>(INITIAL_CUSTOMER_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Extract token from URL
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;

  const token = useMemo(() => {
    return searchParams?.get('token') || '';
  }, [searchParams]);

  const caseId = useMemo(() => {
    return searchParams?.get('caseId') || '';
  }, [searchParams]);

  // Validate token
  const isValidToken = useMemo(() => {
    return token.startsWith('menu-') && token.length > 10;
  }, [token]);

  const handleCustomerDataChange = (field: keyof CustomerData, value: string) => {
    setCustomerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOnboardingSubmit = async () => {
    setIsLoading(true);
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
    setStep('menu');
  };

  const handleBackToOnboarding = () => {
    setStep('onboarding');
  };

  if (!isValidToken) {
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
            borderRadius: '16px',
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
              marginBottom: '20px',
            }}
          >
            <img
              src="/food-care-logo.png"
              alt="Food With Care logo"
              width="100"
              style={{
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>

          <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>
            Invalid or Expired Link
          </h2>

          <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '15px' }}>
            The menu link you used is invalid or has expired. Please ask your service provider to send you a new link.
          </p>

          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
            If you continue to have issues, contact customer support.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: step === 'onboarding' ? 'center' : 'flex-start',
        background: '#f3f4f6',
        padding: '20px',
        paddingTop: step === 'onboarding' ? '20px' : '40px',
      }}
    >
      {step === 'onboarding' && (
        <MenuOnboarding
          data={customerData}
          onChange={handleCustomerDataChange}
          onSubmit={handleOnboardingSubmit}
          isLoading={isLoading}
        />
      )}

      {step === 'menu' && (
        <MenuDisplay
          customerData={customerData}
          onBack={handleBackToOnboarding}
          caseId={caseId}
          token={token}
        />
      )}
    </main>
  );
}
