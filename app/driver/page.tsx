'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

function generateLinkId() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);
  return `lnk-${timePart}-${randomPart}`;
}

function dataUrlToFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

export default function DriverPage() {
  const [caseId, setCaseId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [calledClient, setCalledClient] = useState<boolean | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [openingSms, setOpeningSms] = useState(false);
  const [openingCamera, setOpeningCamera] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const cleanedPhone = useMemo(() => {
    return phoneNumber.replace(/[^\d]/g, '');
  }, [phoneNumber]);

  const baseClientUrl =
    typeof window !== 'undefined'
      ? window.location.origin.replace(/\/driver$/, '')
      : 'https://food-care-clean.vercel.app';

  const canSendSms = useMemo(() => {
    return Boolean(
      caseId.trim() &&
        cleanedPhone &&
        calledClient === true &&
        uploadedPhotoUrl &&
        !uploadingPhoto &&
        !openingCamera
    );
  }, [
    caseId,
    cleanedPhone,
    calledClient,
    uploadedPhotoUrl,
    uploadingPhoto,
    openingCamera,
  ]);

  const uploadDriverPhoto = async (file: File, currentCaseId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', currentCaseId);

    const response = await fetch('/api/upload-driver-photo', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Failed uploading driver photo');
    }

    return data.url as string;
  };

  const loadPreview = (file: File | null) => {
    if (!file) {
      setPhotoPreview('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectedFile = async (file: File | null) => {
    if (!file) return;

    if (!caseId.trim()) {
      alert('Enter Case ID first / Escriba primero el Case ID');
      return;
    }

    setPhotoFile(file);
    setUploadedPhotoUrl('');
    loadPreview(file);

    try {
      setUploadingPhoto(true);
      const url = await uploadDriverPhoto(file, caseId.trim());
      setUploadedPhotoUrl(url);
    } catch (error) {
      console.error(error);
      alert('Error uploading photo / Error subiendo la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    await handleSelectedFile(file);
  };

  const handleTakePhoto = async () => {
    if (!caseId.trim()) {
      alert('Enter Case ID first / Escriba primero el Case ID');
      return;
    }

    try {
      setOpeningCamera(true);

      if (Capacitor.isNativePlatform()) {
        const image = await Camera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });

        if (!image.dataUrl) {
          setOpeningCamera(false);
          return;
        }

        const filename = `${caseId.trim()}-${Date.now()}.jpg`;
        const file = dataUrlToFile(image.dataUrl, filename);
        await handleSelectedFile(file);
      } else {
        uploadInputRef.current?.click();
      }
    } catch (error) {
      console.error(error);
      alert('Could not open camera / No se pudo abrir la cámara');
    } finally {
      setOpeningCamera(false);
    }
  };

  const handleUploadPhoto = () => {
    uploadInputRef.current?.click();
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setUploadedPhotoUrl('');

    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
  };

  const handleNewCase = () => {
    setCaseId('');
    setPhoneNumber('');
    setCalledClient(null);
    setPhotoFile(null);
    setPhotoPreview('');
    setUploadedPhotoUrl('');
    setUploadingPhoto(false);
    setOpeningSms(false);
    setOpeningCamera(false);

    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
  };

  const handleSendSms = () => {
    if (!caseId.trim()) {
      alert('Please enter Case ID / Por favor escriba el Case ID');
      return;
    }

    if (!phoneNumber.trim()) {
      alert('Please enter phone number / Por favor escriba el número de teléfono');
      return;
    }

    if (!cleanedPhone) {
      alert('Phone number is not valid / El número de teléfono no es válido');
      return;
    }

    if (calledClient !== true) {
      alert('You must call the client first / Debe llamar al cliente primero');
      return;
    }

    if (!uploadedPhotoUrl) {
      alert('Photo must finish uploading first / La foto debe terminar de subir primero');
      return;
    }

    const linkId = generateLinkId();

    const params = new URLSearchParams();
    params.set('caseId', caseId.trim());
    params.set('phoneNumber', phoneNumber.trim());
    params.set('driverPhotoUrl', uploadedPhotoUrl);
    params.set('linkId', linkId);

    const signLink = `${baseClientUrl}/?${params.toString()}`;
    const smsBody = `Food With Care: secure link to sign for your delivery.\n${signLink}`;
    const smsHref = `sms:${cleanedPhone}?body=${encodeURIComponent(smsBody)}`;

    setOpeningSms(true);

    try {
      window.location.href = smsHref;
    } finally {
      setTimeout(() => {
        setOpeningSms(false);
      }, 500);
    }
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '18px',
    background: '#fafafa',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '18px',
    lineHeight: 1.2,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#111827',
    WebkitTextFillColor: '#111827',
    opacity: 1,
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#eef2f7',
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 18px 40px rgba(0,0,0,0.10)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: '#0f172a',
          }}
        >
          <img
            src="/food-with-care-driver.png"
            alt="Food With Care"
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(15,23,42,0.12), rgba(15,23,42,0.55))',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: '24px',
              right: '24px',
              bottom: '20px',
              color: '#ffffff',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: '34px',
                fontWeight: 800,
                textShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}
            >
              Driver Page
            </h1>

            <p
              style={{
                margin: '8px 0 0 0',
                fontSize: '15px',
                opacity: 0.97,
                textShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}
            >
              Capture evidence and send the signing link.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '24px',
            display: 'grid',
            gap: '18px',
          }}
        >
          <section style={cardStyle}>
            <label
              htmlFor="caseId"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#111827',
              }}
            >
              Case ID
            </label>

            <input
              id="caseId"
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Enter case ID"
              style={inputStyle}
            />
          </section>

          <section style={cardStyle}>
            <label
              htmlFor="phoneNumber"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#111827',
              }}
            >
              Phone Number
            </label>

            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              style={inputStyle}
            />
          </section>

          <section style={cardStyle}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                marginBottom: '12px',
                color: '#111827',
              }}
            >
              Did you call the client?
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setCalledClient(true)}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border:
                    calledClient === true
                      ? '2px solid #111827'
                      : '1px solid #d1d5db',
                  background: calledClient === true ? '#111827' : '#ffffff',
                  color: calledClient === true ? '#ffffff' : '#111827',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '18px',
                }}
              >
                Yes / Sí
              </button>

              <button
                type="button"
                onClick={() => setCalledClient(false)}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border:
                    calledClient === false
                      ? '2px solid #991b1b'
                      : '1px solid #d1d5db',
                  background: calledClient === false ? '#991b1b' : '#ffffff',
                  color: calledClient === false ? '#ffffff' : '#111827',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '18px',
                }}
              >
                No
              </button>
            </div>

            {calledClient === false && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#fff7ed',
                  border: '1px solid #fdba74',
                  color: '#9a3412',
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                Call the client before sending the SMS.
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                marginBottom: '12px',
                color: '#111827',
              }}
            >
              Take Photo
            </div>

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadChange}
              style={{ display: 'none' }}
            />

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '14px',
              }}
            >
              <button
                type="button"
                onClick={handleTakePhoto}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '16px 16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  background: '#0f172a',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '18px',
                }}
              >
                {openingCamera ? 'Opening Camera...' : 'Take Photo'}
              </button>

              <button
                type="button"
                onClick={handleUploadPhoto}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '16px 16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#111827',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '18px',
                }}
              >
                Upload Photo
              </button>
            </div>

            {photoPreview ? (
              <div
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '14px',
                  padding: '12px',
                  background: '#fff',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Driver photo preview"
                  style={{
                    width: '100%',
                    maxHeight: '360px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    display: 'block',
                  }}
                />

                <div
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#4b5563',
                    }}
                  >
                    {uploadingPhoto
                      ? 'Uploading photo...'
                      : uploadedPhotoUrl
                      ? 'Photo uploaded'
                      : photoFile?.name ?? 'Photo ready'}
                  </span>

                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    style={{
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: '14px',
                  padding: '24px',
                  textAlign: 'center',
                  color: '#6b7280',
                  background: '#fff',
                }}
              >
                No photo captured yet
              </div>
            )}
          </section>

          <section
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleNewCase}
              style={{
                minWidth: '180px',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#111827',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              New Case / Clear
            </button>

            <button
              type="button"
              onClick={handleSendSms}
              disabled={!canSendSms || openingSms}
              style={{
                minWidth: '220px',
                padding: '14px 18px',
                borderRadius: '14px',
                border: 'none',
                background: !canSendSms || openingSms ? '#9ca3af' : '#111827',
                color: '#fff',
                fontWeight: 800,
                fontSize: '15px',
                cursor:
                  !canSendSms || openingSms ? 'not-allowed' : 'pointer',
                opacity: !canSendSms || openingSms ? 0.8 : 1,
              }}
            >
              {uploadingPhoto
                ? 'Uploading Photo...'
                : openingSms
                ? 'Opening Messages...'
                : 'Send SMS'}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}