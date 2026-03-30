"use client";

import React, { useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignPage() {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [signedAt, setSignedAt] = useState("");

  const canSubmit = useMemo(() => {
    if (!sigRef.current) return false;
    return !sigRef.current.isEmpty();
  }, [signatureDataUrl]);

  const handleClear = () => {
    sigRef.current?.clear();
    setSignatureDataUrl("");
    setSignedAt("");
    setSubmitted(false);
  };

  const handleEnd = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    setSignatureDataUrl(sigRef.current.toDataURL("image/png"));
  };

  const handleSubmit = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;

    const dataUrl = sigRef.current.toDataURL("image/png");
    setSignatureDataUrl(dataUrl);
    setSignedAt(
      new Date().toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
      })
    );
    setSubmitted(true);
  };

  const handleDone = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center text-2xl font-semibold">Food With Care</div>

          <div className="mt-8 flex justify-center">
            <img
              src="/food-with-care-logo.png"
              alt="Food With Care logo"
              className="h-24 w-auto object-contain"
            />
          </div>

          <div className="mt-8 text-center text-4xl font-semibold leading-tight">
            Please Leave The Box
            <br />
            <span className="text-3xl">Por Favor Deje La Caja</span>
          </div>

          <div className="mx-auto mt-8 h-px w-11/12 bg-black" />

          <div className="mt-4 text-center text-3xl font-semibold">
            Signature / Firma
          </div>

          {!submitted ? (
            <>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="black"
                  canvasProps={{
                    className:
                      "h-64 w-full rounded-xl border border-slate-200 bg-white",
                  }}
                  onEnd={handleEnd}
                />
                <div className="mt-4 text-center text-sm text-slate-500">
                  Sign with your finger. / Firme con su dedo.
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
                  onClick={handleClear}
                >
                  Clear / Limpiar
                </button>

                <button
                  type="button"
                  className="rounded-2xl bg-black px-4 py-3 text-white disabled:opacity-50"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  Submit / Enviar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900">
                Thank you. Your authorization has been received. / Gracias. Su autorización ha sido recibida.
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-center text-3xl font-semibold leading-tight">
                  Please Leave The Box
                  <br />
                  <span className="text-2xl">Por Favor Deje La Caja</span>
                </div>

                <div className="mx-auto mt-8 h-px w-11/12 bg-black" />

                <div className="mt-4 text-center text-3xl font-semibold">
                  Signature / Firma
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                  {signatureDataUrl ? (
                    <img
                      src={signatureDataUrl}
                      alt="Captured signature"
                      className="mx-auto max-h-48 w-auto object-contain"
                    />
                  ) : null}

                  <div className="mt-4 text-center text-sm text-slate-500">
                    Signed at / Firmado: {signedAt}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-black px-4 py-3 text-white"
                onClick={handleDone}
              >
                Done / Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}