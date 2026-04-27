'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type ViewState = 'sign' | 'signed' | 'closed';

export default function SignaturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [drawing, setDrawing] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signature, setSignature] = useState('');
  const [date, setDate] = useState('');
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<ViewState>('sign');

  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;

  const caseId = useMemo(() => {
    const value = searchParams?.get('caseId')?.trim();
    return value || '12345';
  }, [searchParams]);

  const phoneNumber = useMemo(() => {
    const value = searchParams?.get('phoneNumber')?.trim();
    return value || '';
  }, [searchParams]);

  const driverPhotoUrl = useMemo(() => {
    const value = searchParams?.get('driverPhotoUrl')?.trim();
    return value || '';
  }, [searchParams]);

  const linkId = useMemo(() => {
    const value = searchParams?.get('linkId')?.trim();
    return value || '';
  }, [searchParams]);

  const signedStorageKey = useMemo(
    () => `fwc-signed-${linkId || caseId}`,
    [linkId, caseId]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const alreadySigned = window.localStorage.getItem(signedStorageKey);
    if (alreadySigned === 'true') {
      setView('closed');
    }
  }, [signedStorageKey]);

  const getPoint = (e: any) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: any) => {
    setDrawing(true);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const point = getPoint(e);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const stopDrawing = () => {
    setDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: any) => {
    if (!drawing) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const point = getPoint(e);

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  };

  const handleSubmit = async () => {
    if (view !== 'sign' || sending) return;

    const canvas = canvasRef.current!;
    const sig = canvas.toDataURL('image/png');

    if (!sig || sig === 'data:,') {
      alert('Please sign first / Por favor firme primero');
      return;
    }

    const now = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    setSending(true);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: sig,
          caseId,
          logoUrl: `${window.location.origin}/food-care-logo.png`,
          driverPhotoUrl,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error sending email:', errorText);
        alert('Error sending signature');
        setSending(false);
        return;
      }

      setSignature(sig);
      setDate(now);
      setSigned(true);
      setView('signed');

      window.localStorage.setItem(signedStorageKey, 'true');
    } catch (error) {
      console.error(error);
      alert('Error sending signature');
    } finally {
      setSending(false);
    }
  };

  const handleDone = () => {
    setView('closed');
  };

  if (view === 'closed') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#eef2f7',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '28px',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              marginBottom: '16px',
            }}
          >
            <img
              src="/food-care-logo.png"
              alt="Food With Care logo"
              width="96"
              style={{
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>

          <h2
            style={{
              marginTop: 0,
              marginBottom: '18px',
              fontSize: '22px',
              lineHeight: 1.3,
              fontWeight: 800,
              color: '#111827',
            }}
          >
            Thank you for choosing Food With Care
          </h2>

          <p
            style={{
              marginTop: '0px',
              marginBottom: '18px',
              fontSize: '16px',
              lineHeight: 1.7,
              color: '#374151',
              fontWeight: 500,
            }}
          >
            Reminder: You may leave a note on the door, just like the one you
            signed.
          </p>

          {signature ? (
            <div
              style={{
                marginTop: '20px',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '12px',
                background: '#ffffff',
              }}
            >
              <img
                src={signature}
                alt="Signed note preview"
                style={{
                  width: '100%',
                  display: 'block',
                  borderRadius: '8px',
                }}
              />
            </div>
          ) : null}

          <hr style={{ margin: '20px 0', borderColor: '#d1d5db' }} />

          <h3
            style={{
              margin: '0 0 14px 0',
              fontSize: '19px',
              lineHeight: 1.4,
              fontWeight: 800,
              color: '#111827',
            }}
          >
            Gracias por seleccionar Food With Care
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: '16px',
              lineHeight: 1.7,
              color: '#374151',
              fontWeight: 500,
            }}
          >
            Recuerde que puede dejar una nota como la que firmó en la puerta.
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
        alignItems: 'center',
        background: '#eef2f7',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          padding: '25px',
          borderRadius: '16px',
          width: '350px',
          textAlign: 'center',
          boxShadow: '0 14px 30px rgba(0,0,0,0.10)',
          border: '1px solid #d1d5db',
        }}
      >
        <h2
          style={{
            marginBottom: '10px',
            color: '#111827',
            fontWeight: 800,
          }}
        >
          Food With Care
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            marginBottom: '10px',
          }}
        >
          <img
            src="/food-care-logo.png"
            alt="Food With Care logo"
            width="90"
            style={{
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>

        <h2
          style={{
            margin: 0,
            color: '#111827',
            fontWeight: 800,
          }}
        >
          Please Leave The Box
        </h2>

        <p
          style={{
            marginTop: '5px',
            color: '#374151',
            fontWeight: 600,
          }}
        >
          Por Favor Deje La Caja
        </p>

        <hr style={{ margin: '15px 0', borderColor: '#d1d5db' }} />

        <h3
          style={{
            color: '#111827',
            fontWeight: 800,
          }}
        >
          Signature / Firma
        </h3>

        {!signed && (
          <>
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              style={{
                border: '2px solid #cbd5e1',
                borderRadius: '10px',
                touchAction: 'none',
                background: '#ffffff',
              }}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
            />

            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <button
                onClick={clearCanvas}
                disabled={sending}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#374151',
                  fontWeight: 700,
                  cursor: sending ? 'not-allowed' : 'pointer',
                }}
              >
                Limpiar
              </button>

              <button
                onClick={handleSubmit}
                disabled={sending}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#000000',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: sending ? 'not-allowed' : 'pointer',
                }}
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        )}

        {signed && view === 'signed' && (
          <>
            <h3
              style={{
                marginTop: 0,
                marginBottom: '10px',
                fontSize: '18px',
                fontWeight: 800,
                color: '#111827',
              }}
            >
              Thank you / Gracias
            </h3>

            <p
              style={{
                marginTop: 0,
                marginBottom: '16px',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#374151',
                fontWeight: 500,
              }}
            >
              Your signature was received successfully.
            </p>

            <div
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '10px',
                background: '#ffffff',
              }}
            >
              <img
                src={signature}
                alt="signature"
                style={{ width: '100%', display: 'block', borderRadius: '8px' }}
              />
            </div>

            <p
              style={{
                marginTop: '10px',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: 600,
              }}
            >
              Signed at / Firmado: {date}
            </p>

            <button
              onClick={handleDone}
              style={{
                marginTop: '15px',
                background: '#000000',
                color: '#ffffff',
                padding: '12px',
                width: '100%',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Done / Cerrar
            </button>
          </>
        )}

        {phoneNumber ? (
          <p
            style={{
              marginTop: '12px',
              fontSize: '11px',
              color: '#6b7280',
              fontWeight: 600,
            }}
          >
            {phoneNumber}
          </p>
        ) : null}
      </div>
    </main>
  );
}