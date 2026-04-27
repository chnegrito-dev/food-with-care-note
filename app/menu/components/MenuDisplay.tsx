'use client';

import { useState } from 'react';
import { CustomerData } from './MenuOnboarding';
import { menuSections } from '../../customer-menu/menuData';

interface MenuDisplayProps {
  customerData: CustomerData;
  onBack: () => void;
  caseId?: string;
  token?: string;
}

interface OrderSummary {
  token: string;
  caseId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  selectedItems: Array<{ name: string; quantity: number; diets: string[] }>;
  timestamp: string;
}

export function MenuDisplay({ customerData, onBack, caseId = '', token = '' }: MenuDisplayProps) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionError, setSubmissionError] = useState('');
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  const handleQuantityChange = (itemName: string, value: string) => {
    if (/^\d*$/.test(value)) {
      setQuantities((prev) => ({
        ...prev,
        [itemName]: value,
      }));
    }
  };

  const selectedItems = menuSections.flatMap((section) =>
    section.items
      .map((item) => {
        const value = quantities[item.name]?.trim() || '';
        const quantity = value === '' ? 0 : parseInt(value, 10);
        return quantity > 0
          ? {
              name: item.name,
              quantity,
              diets: item.diets,
            }
          : null;
      })
      .filter(Boolean)
  ) as Array<{ name: string; quantity: number; diets: string[] }>;

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setSubmissionError('Please add at least one item before submitting.');
      setSubmissionState('error');
      return;
    }

    setSubmissionError('');
    setSubmissionState('submitting');

    try {
      const payload: OrderSummary = {
        token,
        caseId,
        customer: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phoneNumber,
          address: `${customerData.addressLine1}, ${customerData.city}, ${customerData.state} ${customerData.zipCode}`,
        },
        selectedItems,
        timestamp: new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York',
        }),
      };

      const response = await fetch('/api/menu-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit order');
      }

      setOrderSummary(payload);
      setSubmissionState('success');
    } catch (error) {
      console.error(error);
      setSubmissionError('Unable to submit your order. Please try again.');
      setSubmissionState('error');
    }
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (submissionState === 'success' && orderSummary) {
    return (
      <div
        style={{
          background: '#f3f4f6',
          minHeight: '100vh',
          padding: '16px',
        }}
      >
        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '22px',
              borderRadius: '20px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '24px', color: '#111827' }}>
              Order submitted successfully
            </h2>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '15px', lineHeight: 1.6 }}>
              Thank you, {orderSummary.customer.firstName}. Your menu selection has been saved.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#111827' }}>
                Order summary
              </h3>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                  {orderSummary.customer.firstName} {orderSummary.customer.lastName}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#374151' }}>
                  {orderSummary.customer.email} • {orderSummary.customer.phone}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#374151' }}>
                  {orderSummary.customer.address}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              {orderSummary.selectedItems.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', color: '#111827' }}>{item.name}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                      {item.diets.join(', ') || 'Unrestricted'}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '15px', color: '#111827' }}>Qty {item.quantity}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSubmissionState('idle')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#1f2937',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Edit order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#f3f4f6',
        minHeight: '100vh',
        padding: '16px',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '18px',
            borderRadius: '16px',
            marginBottom: '18px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '22px', color: '#111827' }}>Menu Selection</h2>
          <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
            {customerData.firstName} {customerData.lastName} • {customerData.email}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
            <strong>Legend:</strong> D = Diabetic | LF/LC = Low Fat/Low Cholesterol | NAS = No Added Salt | R = Regular | RS = Reduced Sodium | No label = Unrestricted
          </p>
        </div>

        {menuSections.map((section) => (
          <section key={section.title} style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#111827' }}>{section.title}</h3>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              {section.items.map((item, index) => {
                const value = quantities[item.name] ?? '';
                return (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderBottom: index < section.items.length - 1 ? '1px solid #e2e8f0' : 'none',
                      background: 'white',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                      <div style={{ fontSize: '15px', lineHeight: 1.4, color: '#1f2937' }}>{item.name}</div>
                      {item.diets.length > 0 && (
                        <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                          {item.diets.join(', ')}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={value}
                      onChange={(e) => handleQuantityChange(item.name, e.target.value)}
                      placeholder="Qty"
                      style={{
                        width: '68px',
                        padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '15px',
                      textAlign: 'center',
                      color: '#1f2937',
                      background: 'white',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {submissionState === 'error' && submissionError ? (
          <div
            style={{
              marginBottom: '18px',
              padding: '14px',
              borderRadius: '14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '14px',
            }}
          >
            {submissionError}
          </div>
        ) : null}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={onBack}
            style={{
              width: '100%',
              padding: '14px',
              marginBottom: '12px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#0f172a',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={totalItems === 0}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: totalItems > 0 ? '#000000' : '#cbd5e1',
              color: totalItems > 0 ? 'white' : '#6b7280',
              fontSize: '16px',
              fontWeight: 600,
              cursor: totalItems > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Submit Order ({totalItems})
          </button>
        </div>
      </div>
    </div>
  );
}
