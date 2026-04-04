"use client";

import { useState } from "react";

export default function DriverPage() {
  const [form, setForm] = useState({
    caseId: "",
    phoneNumber: "",
    clientAnswered: false,
    photoTaken: false,
  });

  const [status, setStatus] = useState("Not sent");
  const [generatedLink, setGeneratedLink] = useState("");

  const canSendSMS =
    form.caseId &&
    form.phoneNumber &&
    form.clientAnswered &&
    form.photoTaken;

  const handleOpenSMS = () => {
    const cleanPhone = form.phoneNumber.replace(/\D/g, "");

    const link = `${process.env.NEXT_PUBLIC_SIGN_BASE_URL}/sign?caseId=${form.caseId}&phoneNumber=${cleanPhone}`;

    const message = encodeURIComponent(
      `Please sign your delivery:\n${link}`
    );

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const smsURL = isIOS
      ? `sms:${cleanPhone}&body=${message}`
      : `sms:${cleanPhone}?body=${message}`;

    setGeneratedLink(link);
    setStatus("Prepared");

    window.location.href = smsURL;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Food With Care Note — Driver</h1>

      <p>
        Llegas, llamas, si contesta y autoriza, tomas foto del papel y
        abres el SMS con el link.
      </p>

      {/* INPUTS */}
      <div>
        <label>Case ID</label>
        <br />
        <input
          value={form.caseId}
          onChange={(e) =>
            setForm({ ...form, caseId: e.target.value })
          }
        />
      </div>

      <div>
        <label>Phone Number</label>
        <br />
        <input
          value={form.phoneNumber}
          onChange={(e) =>
            setForm({ ...form, phoneNumber: e.target.value })
          }
        />
      </div>

      {/* CLIENT ANSWERED */}
      <div>
        <label>Client answered?</label>
        <br />
        <button
          onClick={() =>
            setForm({ ...form, clientAnswered: true })
          }
          style={{
            backgroundColor: form.clientAnswered ? "green" : "#ccc",
            color: "white",
            marginRight: 10,
          }}
        >
          Yes
        </button>

        <button
          onClick={() =>
            setForm({ ...form, clientAnswered: false })
          }
          style={{
            backgroundColor: !form.clientAnswered ? "red" : "#ccc",
            color: "white",
          }}
        >
          No
        </button>
      </div>

      {/* PHOTO */}
      <div>
        <label>Paper Photo</label>
        <br />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setForm({ ...form, photoTaken: true });
            }
          }}
        />

        <p>
          Photo captured:{" "}
          {form.photoTaken ? "Yes" : "No"}
        </p>
      </div>

      {/* SMS BUTTON */}
      <button
        onClick={handleOpenSMS}
        disabled={!canSendSMS}
        style={{
          backgroundColor: canSendSMS ? "#007bff" : "#ccc",
          color: "white",
          marginRight: 10,
        }}
      >
        Open SMS
      </button>

      <button
        onClick={() => {
          setForm({
            caseId: "",
            phoneNumber: "",
            clientAnswered: false,
            photoTaken: false,
          });
          setStatus("Not sent");
          setGeneratedLink("");
        }}
      >
        Cancel
      </button>

      {/* STATUS */}
      <h2>Status</h2>
      <p>{status}</p>
      <p>Case ID: {form.caseId}</p>
      <p>Phone Number: {form.phoneNumber}</p>
      <p>
        Client answered:{" "}
        {form.clientAnswered ? "Yes" : "No"}
      </p>
      <p>
        Prepared at:{" "}
        {status === "Prepared"
          ? new Date().toLocaleTimeString()
          : "-"}
      </p>

      {generatedLink && (
        <>
          <p>Last generated link:</p>
          <p style={{ wordBreak: "break-all" }}>
            {generatedLink}
          </p>
        </>
      )}

      {/* PREVIEW */}
      <h2>Client Signing Note Preview</h2>
      <p>Food With Care</p>
      <p>Please Leave The Box</p>
      <p>Por Favor Deje La Caja</p>
      <p>Signature / Firma</p>
      <p>Cliente firma aquí desde el link.</p>
    </div>
  );
}