"use client";

import React, { useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type ActiveCase = {
  caseId: string;
  stopReference: string;
  phoneNumber: string;
  clientAnswered: "Yes" | "No";
  photoName: string;
  status:
    | "Not sent"
    | "Prepared"
    | "Signed"
    | "Expired"
    | "Escalated to office";
  preparedAt: string;
};

export default function SignPage() {
  const sigRef = useRef<SignatureCanvas | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [signedAt, setSignedAt] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = useMemo(() => {
    if (!sigRef.current) return false;
    return !sigRef.current.isEmpty();
  }, [signatureDataUrl]);

  const handleClear = () => {
    sigRef.current?.clear();
    setSignatureDataUrl("");
    setSignedAt("");
    setSubmitted(false);
    setErrorMessage("");
  };

  const handleEnd = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    setSignatureDataUrl(sigRef.current.toDataURL("image/png"));
  };

  const handleSubmit = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;

    setSending(true);
    setErrorMessage("");

    try {
      const dataUrl = sigRef.current.toDataURL("image/png");
      const signedTimestamp = new Date().toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
      });

      const params = new URLSearchParams(window.location.search);

const stopReference = params.get("stopReference") || "";
const phoneNumber = params.get("phoneNumber") || "";

if (!stopReference || !phoneNumber) {
  throw new Error("Missing case data in link.");
}
       const apiUrl = "/api/send-signed-doc";
console.log("Submitting to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  stopReference,
  phoneNumber,
  signedAt: signedTimestamp,
  signatureDataUrl: dataUrl,
}),
      });

      const contentType = response.headers.get("content-type") || "";
const rawText = await response.text();

if (!response.ok) {
  throw new Error(`Request failed (${response.status}): ${rawText.slice(0, 200)}`);
}

if (!contentType.includes("application/json")) {
  throw new Error(`Expected JSON but got: ${rawText.slice(0, 200)}`);
}

const result = JSON.parse(rawText);

      setSignatureDataUrl(dataUrl);
      setSignedAt(signedTimestamp);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(message);
    } finally {
      setSending(false);
    }
  };

  const handleDone = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm md:p-6">
          <div className="text-center text-3xl font-bold text-slate-950">
            Food With Care
          </div>

          <div className="mt-6 flex justify-center">
            <img
              src="/food-with-care-logo.png"
              alt="Food With Care logo"
              className="h-24 w-auto object-contain"
            />
          </div>

          <div className="mt-8 text-center text-4xl font-bold leading-tight text-slate-950">
            Please Leave The Box
            <br />
            <span className="text-3xl font-bold text-slate-950">
              Por Favor Deje La Caja
            </span>
          </div>

          <div className="mx-auto mt-8 h-px w-11/12 bg-black" />

          <div className="mt-4 text-center text-3xl font-bold text-slate-950">
            Signature / Firma
          </div>

          {!submitted ? (
            <>
              <div className="mt-6 rounded-2xl border border-slate-300 bg-white p-4">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="black"
                  canvasProps={{
                    className:
                      "h-64 w-full rounded-xl border border-slate-400 bg-white",
                  }}
                  onEnd={handleEnd}
                />

                <div className="mt-4 text-center text-base text-slate-800">
                  Sign with your finger. / Firme con su dedo.
                </div>
              </div>

              {errorMessage ? (
                <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-400 bg-white px-4 py-4 text-base font-semibold text-slate-950"
                  onClick={handleClear}
                  disabled={sending}
                >
                  Clear / Limpiar
                </button>

                <button
                  type="button"
                  className="rounded-2xl bg-black px-4 py-4 text-base font-semibold text-white disabled:opacity-50"
                  disabled={!canSubmit || sending}
                  onClick={handleSubmit}
                >
                  {sending ? "Sending..." : "Submit / Enviar"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 p-4 text-base text-green-900">
                Thank you. Your authorization has been received and emailed to the office. / Gracias. Su autorización fue recibida y enviada a la oficina.
              </div>

              <div className="mt-6 rounded-2xl border border-slate-300 bg-slate-50 p-5">
                <div className="text-center text-3xl font-bold leading-tight text-slate-950">
                  Please Leave The Box
                  <br />
                  <span className="text-2xl font-bold text-slate-950">
                    Por Favor Deje La Caja
                  </span>
                </div>

                <div className="mx-auto mt-8 h-px w-11/12 bg-black" />

                <div className="mt-4 text-center text-3xl font-bold text-slate-950">
                  Signature / Firma
                </div>

                <div className="mt-6 rounded-2xl border border-slate-300 bg-white p-4">
                  {signatureDataUrl ? (
                    <img
                      src={signatureDataUrl}
                      alt="Captured signature"
                      className="mx-auto max-h-48 w-auto object-contain"
                    />
                  ) : null}

                  <div className="mt-4 text-center text-sm text-slate-700">
                    Signed at / Firmado: {signedAt}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-black px-4 py-4 text-base font-semibold text-white"
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