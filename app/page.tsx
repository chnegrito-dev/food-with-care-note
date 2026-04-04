"use client";

import { useState } from "react";

export default function DriverPage() {
  const [form, setForm] = useState({
    stopReference: "",
    phoneNumber: "",
    clientAnswered: false,
    photoTaken: false,
  });

  const [status, setStatus] = useState("Not sent");
  const [generatedLink, setGeneratedLink] = useState("");

  // 🔥 VALIDACIÓN REAL (SIN PARCHE)
  const canSendSMS =
    form.stopReference &&
    form.phoneNumber &&
    form.clientAnswered &&
    form.photoTaken;

  // 🔧 FUNCIÓN SMS (BIEN HECHA)
  const handleOpenSMS = () => {
    const cleanPhone = form.phoneNumber.replace(/\D/g, "");

    const link = `${process.env.NEXT_PUBLIC_SIGN_BASE_URL}/sign?stopReference=${form.stopReference}&phoneNumber=${cleanPhone}`;

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
        <label>Stop Reference</label>
        <br />
        <input
          value={form.stopReference}
          onChange={(e) =>
            setForm({ ...form, stopReference: e.target.value })
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
        <button
          onClick={() =>
            setForm({ ...form, photoTaken: true })
          }
        >
          Take Photo (mock)
        </button>

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
            stopReference: "",
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
      <p>Stop Reference: {form.stopReference}</p>
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