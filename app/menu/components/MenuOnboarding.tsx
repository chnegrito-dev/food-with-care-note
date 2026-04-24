import { ChangeEvent } from 'react';

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
}

interface MenuOnboardingProps {
  data: CustomerData;
  onChange: (field: keyof CustomerData, value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function MenuOnboarding({
  data,
  onChange,
  onSubmit,
  isLoading = false,
}: MenuOnboardingProps) {
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    onChange('phoneNumber', value);
  };

  const isFormValid = Boolean(
    data.firstName.trim() &&
      data.lastName.trim() &&
      data.email.trim() &&
      data.phoneNumber.trim() &&
      data.addressLine1.trim() &&
      data.city.trim() &&
      data.state.trim() &&
      data.zipCode.trim()
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    color: '#1f2937',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  };

  return (
    <div
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: '24px',
          fontSize: '24px',
          textAlign: 'center',
          color: '#111827',
        }}
      >
        Customer Information
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>First Name *</label>
            <input
              type="text"
              placeholder="John"
              value={data.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              style={inputStyle}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input
              type="text"
              placeholder="Doe"
              value={data.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              style={inputStyle}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            placeholder="john@example.com"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            style={inputStyle}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Phone Number *</label>
          <input
            type="text"
            placeholder="(555) 123-4567"
            value={data.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
            onChange={handlePhoneChange}
            style={inputStyle}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Address Line 1 *</label>
          <input
            type="text"
            placeholder="123 Main Street"
            value={data.addressLine1}
            onChange={(e) => onChange('addressLine1', e.target.value)}
            style={inputStyle}
            disabled={isLoading}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>City *</label>
            <input
              type="text"
              placeholder="New York"
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
              style={inputStyle}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>State *</label>
            <input
              type="text"
              placeholder="NY"
              value={data.state}
              onChange={(e) => onChange('state', e.target.value.toUpperCase())}
              style={inputStyle}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Zip Code *</label>
          <input
            type="text"
            placeholder="10001"
            value={data.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            style={inputStyle}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          style={{
            width: '100%',
            padding: '14px',
            marginTop: '20px',
            background: isFormValid ? '#000' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading ? 'Loading Menu...' : 'View Menu'}
        </button>
      </form>
    </div>
  );
}
