"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const OFFICE_TEST_EMAIL = "hnegrito@yahoo.com";
const ACTIVE_CASE_KEY = "fwc_active_case";

type CaseStatus =
  | "Not sent"
  | "Prepared"
  | "Signed"
  | "Expired"
  | "Escalated to office";

type ActiveCase = {
  caseId: string;
  stopReference: string;
  phoneNumber: string;
  clientAnswered: "Yes" | "No";
  photoName: string;
  status: CaseStatus;
  preparedAt: string;
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 10);

  if (digits.length <= 3) return p1;
  if (digits.length <= 6) return `(${p1}) ${p2}`;
  return `(${p1}) ${p2}-${p3}`;
}

function statusClass(status: CaseStatus) {
  switch (status) {
    case "Prepared":
      return "bg-blue-100 text-blue-800";
    case "Signed":
      return "bg-green-100 text-green-800";
    case "Expired":
      return "bg-red-100 text-red-800";
    case "Escalated to office":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function createCaseId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `fwc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function FoodWithCareNotePage() {
  const [stopReference, setStopReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [clientAnswered, setClientAnswered] = useState<"Yes" | "No">("No");
  const [photoName, setPhotoName] = useState("");
  const [status, setStatus] = useState<CaseStatus>("Not sent");
  const [preparedAt, setPreparedAt] = useState("");
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [lastLink, setLastLink] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const resetAllFields = () => {
    setStopReference("");
    setPhoneNumber("");
    setClientAnswered("No");
    setPhotoName("");
    setStatus("Not sent");
    setPreparedAt("");
    setLastLink("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const saveCase = (updates: Partial<ActiveCase>) => {
    const raw = localStorage.getItem(ACTIVE_CASE_KEY);
    const current: ActiveCase = raw
      ? JSON.parse(raw)
      : {
          caseId: "",
          stopReference: "",
          phoneNumber: "",
          clientAnswered: "No",
          photoName: "",
          status: "Not sent",
          preparedAt: "",
        };

    localStorage.setItem(
      ACTIVE_CASE_KEY,
      JSON.stringify({ ...current, ...updates })
    );
  };

  const syncFromStorage = () => {
    const raw = localStorage.getItem(ACTIVE_CASE_KEY);

    if (!raw) {
      resetAllFields();
      setIsCreatingCase(false);
      return;
    }

    const activeCase: ActiveCase = JSON.parse(raw);

    setStopReference(activeCase.stopReference || "");
    setPhoneNumber(activeCase.phoneNumber || "");
    setClientAnswered(activeCase.clientAnswered || "No");
    setPhotoName(activeCase.photoName || "");
    setStatus(activeCase.status || "Not sent");
    setPreparedAt(activeCase.preparedAt || "");
    setIsCreatingCase(false);
  };

  useEffect(() => {
    syncFromStorage();

    const onFocus = () => syncFromStorage();
    const onStorage = () => syncFromStorage();

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const canOpenSms = useMemo(() => {
    const digits = phoneNumber.replace(/\D/g, "");
    return (
      digits.length === 10 &&
      clientAnswered === "Yes" &&
      !!photoName
    );
  }, [phoneNumber, clientAnswered, photoName]);

  const handleTakePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
  };

  const handleStartNewCase = () => {
    localStorage.removeItem(ACTIVE_CASE_KEY);
    resetAllFields();
    setIsCreatingCase(true);
  };

  const handleCancelNewCase = () => {
    localStorage.removeItem(ACTIVE_CASE_KEY);
    resetAllFields();
    setIsCreatingCase(false);
  };

  const handleOpenSms = () => {
    if (!canOpenSms) return;

    const digits = phoneNumber.replace(/\D/g, "");
    const caseId = createCaseId();
    const now = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const signBaseUrl =
      process.env.NEXT_PUBLIC_SIGN_BASE_URL || window.location.origin;

    const signUrl =
      `${signBaseUrl}/sign` +
      `?caseId=${encodeURIComponent(caseId)}` +
      `&stopReference=${encodeURIComponent(stopReference)}`;

    const message =
      `Food With Care: secure link to sign for your delivery. ${signUrl}`;

    saveCase({
      caseId,
      stopReference,
      phoneNumber,
      clientAnswered,
      photoName,
      status: "Prepared",
      preparedAt: now,
    });

    setStatus("Prepared");
    setPreparedAt(now);
    setLastLink(signUrl);
    setIsCreatingCase(false);

    const smsUrl = `sms:${digits}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  const handleEscalate = () => {
    setStatus("Escalated to office");

    saveCase({
      caseId: "",
      stopReference,
      phoneNumber,
      clientAnswered,
      photoName,
      status: "Escalated to office",
      preparedAt,
    });

    setIsCreatingCase(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
  Food With Care Note — Driver
</h1>
<p className="mt-2 text-base text-slate-800">
  Llegas, llamas, si contesta y autoriza, tomas foto del papel y abres el SMS con el link.
</p>

          {!isCreatingCase ? (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Ready for the next stop. Press Start New Case to capture authorization details.
              </div>

              <button
                type="button"
                className="w-full rounded-2xl bg-black px-4 py-4 text-base font-medium text-white"
                onClick={handleStartNewCase}
              >
                Start New Case
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="stopReference" className="mb-2 block text-base font-semibold text-slate-900">
                    Stop Reference
                  </label>
                  <input
                    id="stopReference"
                    value={stopReference}
                    onChange={(e) => setStopReference(e.target.value)}
                    placeholder="Sergio Coto / ID 27237 / 126 Mobile St"
                    className="w-full rounded-xl border border-slate-400 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="mb-2 block text-base font-semibold text-slate-900">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                    placeholder="(786) 319-7894"
                    inputMode="tel"
                    className="w-full rounded-xl border border-slate-400 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 text-base font-semibold text-slate-900">Client answered?</div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`rounded-2xl px-4 py-2 ${
                      clientAnswered === "Yes"
                        ? "bg-black text-white"
                        : "border border-slate-300 bg-white"
                    }`}
                    onClick={() => setClientAnswered("Yes")}
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    className={`rounded-2xl px-4 py-2 ${
                      clientAnswered === "No"
                        ? "bg-black text-white"
                        : "border border-slate-300 bg-white"
                    }`}
                    onClick={() => setClientAnswered("No")}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 text-base font-semibold text-slate-900">Paper Photo</div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleTakePhoto}
                />

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <button
                    type="button"
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2"
                    onClick={() => fileRef.current?.click()}
                  >
                    Take Photo
                  </button>

                  <div className="text-base text-slate-800">
                    {photoName ? `Photo captured: ${photoName}` : "Photo captured: No"}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  className="rounded-2xl bg-black px-4 py-3 text-white disabled:opacity-50"
                  disabled={!canOpenSms}
                  onClick={handleOpenSms}
                >
                  Open SMS
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
                  onClick={handleEscalate}
                >
                  Escalate to Office
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
                  onClick={handleCancelNewCase}
                >
                  Cancel
                </button>
              </div>

              {!canOpenSms && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Para abrir el SMS necesitas: teléfono válido, cliente contestó = Yes, y foto del papel.
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Status</h2>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClass(
                  status
                )}`}
              >
                {status}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600">Test email target: {OFFICE_TEST_EMAIL}</p>

            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <div>
                <span className="font-medium">Stop Reference:</span> {stopReference || "—"}
              </div>
              <div>
                <span className="font-medium">Phone Number:</span> {phoneNumber || "—"}
              </div>
              <div>
                <span className="font-medium">Client answered:</span> {clientAnswered}
              </div>
              <div>
                <span className="font-medium">Prepared at:</span> {preparedAt || "—"}
              </div>
            </div>

            {lastLink && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium">Last generated link</div>
                <div className="mt-2 break-all text-xs text-slate-600">{lastLink}</div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Client Signing Note Preview</h2>

            <div className="mx-auto mt-4 max-w-md rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-8 flex justify-center">
                <img
                  src="/food-with-care-logo.png"
                  alt="Food With Care logo"
                  className="h-24 w-auto object-contain"
                />
              </div>

              <div className="mb-12 text-center text-xl font-semibold leading-tight">
                Please Leave The Box
                <br />
                Por Favor Deje La Caja
              </div>

              <div className="mx-auto mb-3 h-px w-11/12 bg-black" />

              <div className="text-center text-2xl font-semibold tracking-tight">
                Signature / Firma
              </div>

              <div className="mt-10 text-center text-xs text-slate-500">
                Cliente firma aquí desde el link.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}