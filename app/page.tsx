"use client";

import { useState } from "react";

export default function Home() {
  const [stopId, setStopId] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!stopId || !phone || !photo) {
      alert("Complete all fields");
      return;
    }

    try {
      setLoading(true);

      const caseId = crypto.randomUUID();

      // Convert photo to base64
      const reader = new FileReader();

      const photoDataUrl: string = await new Promise((resolve) => {
        reader.onloadend = () => {
          resolve(typeof reader.result === "string" ? reader.result : "");
        };
        reader.readAsDataURL(photo);
      });

      // 🔥 CREATE CASE (API)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-case`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caseId,
            stopId,
            phone,
            photoDataUrl,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Error creating case");
      }

      // 🔥 LINK REAL (SIGN PAGE)
      const link = `${process.env.NEXT_PUBLIC_SIGN_BASE_URL}/sign?caseId=${caseId}`;

      // 🔥 OPEN SMS
      window.location.href = `sms:${phone}?body=${encodeURIComponent(link)}`;
    } catch (err) {
      console.error(err);
      alert("Error sending case");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Food With Care Driver</h1>

      <input
        placeholder="Stop ID"
        value={stopId}
        onChange={(e) => setStopId(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br /><br />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send SMS"}
      </button>
    </main>
  );
}