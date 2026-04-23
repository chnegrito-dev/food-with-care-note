'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';

function generateMenuToken() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);
  return `menu-${timePart}-${randomPart}`;
}

export default function MenuSendPage() {
  const [caseId, setCaseId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const cleanedPhone = useMemo(() => {
    return phoneNumber.replace(/[^\d]/g, '');
  }, [phoneNumber]);

  const baseClientUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://food-care-clean.vercel.app';

  const canGenerateLink = useMemo(() => {
    return Boolean(caseId.trim() && cleanedPhone);
  }, [caseId, cleanedPhone]);

  const handleGenerateLink = () => {
    if (!canGenerateLink) {
      alert('Please enter both Case ID and Phone Number');
      return;
    }

    const token = generateMenuToken();
    setGeneratedToken(token);

    const params = new URLSearchParams();
    params.set('token', token);
    params.set('caseId', caseId.trim());
    params.set('phoneNumber', phoneNumber.trim());

    const menuLink = `${baseClientUrl}/customer-menu?${params.toString()}`;
    setGeneratedLink(menuLink);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;

    navigator.clipboard.writeText(generatedLink);
    setCopiedToClipboard(true);

    setTimeout(() => {
      setCopiedToClipboard(false);
    }, 2000);
  };

  const handleReset = () => {
    setCaseId('');
    setPhoneNumber('');
    setGeneratedToken('');
    setGeneratedLink('');
    setCopiedToClipboard(false);
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '16px',
    background: 'white',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
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
              width="80"
              style={{
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>

          <h2
            style={{
              marginTop: 0,
              marginBottom: '8px',
              fontSize: '22px',
              textAlign: 'center',
            }}
          >
            Prepare Menu Link
          </h2>

          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            Generate a customer menu link to send via SMS or email
          </p>

          <hr style={{ margin: '20px 0' }} />

          {!generatedLink ? (
            <>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Case ID *
              </label>
              <input
                type="text"
                placeholder="Enter case ID"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                style={inputStyle}
              />

              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={inputStyle}
              />

              <button
                onClick={handleGenerateLink}
                disabled={!canGenerateLink}
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '16px',
                  background: canGenerateLink ? '#000' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: canGenerateLink ? 'pointer' : 'not-allowed',
                }}
              >
                Generate Menu Link
              </button>
            </>
          ) : (
            <>
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>
                  ✅ Link Generated
                </h3>

                <div
                  style={{
                    background: '#f9fafb',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    wordBreak: 'break-all',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {generatedLink}
                </div>

                <button
                  onClick={handleCopyLink}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: copiedToClipboard ? '#10b981' : '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {copiedToClipboard ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>

              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '16px',
                }}
              >
                Share this link with the customer via SMS or email. The link will expire after 30 days.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <button
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'white',
                    color: '#000',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Generate Another
                </button>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          <p style={{ marginTop: 0 }}>
            <strong>Case ID:</strong> Internal reference for this delivery
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>Phone Number:</strong> Customer contact for order tracking
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Token:</strong> Unique identifier to link customer orders to this case
          </p>
        </div>
      </div>
    </main>
  );
}
