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

export function MenuDisplay({ customerData, onBack, caseId = '', token = '' }: MenuDisplayProps) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});

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

  const handleSubmit = () => {
    const orderSummary = {
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

    console.log('Order Summary:', orderSummary);
    alert(`Thank you! Your menu selection has been saved.\n\nItems selected: ${selectedItems.length}`);
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      style={{
        background: '#f8fafc',
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
            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.06)',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '22px' }}>Menu Selection</h2>
          <p style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '14px' }}>
            {customerData.firstName} {customerData.lastName} • {customerData.email}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
            <strong>Legend:</strong> D = Diabetic | LF/LC = Low Fat/Low Cholesterol | NAS = No Added Salt | R = Regular | RS = Reduced Sodium | No label = Unrestricted
          </p>
        </div>

        {menuSections.map((section) => (
          <section key={section.title} style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#0f172a' }}>{section.title}</h3>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
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
                      <div style={{ fontSize: '15px', lineHeight: 1.4, color: '#0f172a' }}>{item.name}</div>
                      {item.diets.length > 0 && (
                        <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
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
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        fontSize: '15px',
                        textAlign: 'center',
                        color: '#0f172a',
                        background: '#f8fafc',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}

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
              background: totalItems > 0 ? '#0f172a' : '#cbd5e1',
              color: 'white',
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
