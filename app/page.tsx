"use client";

import { useState } from "react";

export default function Home() {
  const [caseId, setCaseId] = useState("");
  const [stopId, setStopId] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!caseId || !stopId || !phone) {
        alert("Fill all required fields");
        return;
      }

      let photoDataUrl = "";

      if (photo) {
        const reader = new FileReader();

        photoDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });
      }

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

      const text = await res.text();
      console.log("API RESPONSE:", text);

      if (!res.ok) {
        alert("ERROR:\n" + text);
        return;
      }

      const link = `${process.env.NEXT_PUBLIC_SIGN_BASE_URL}/sign?caseId=${caseId}`;

      window.location.href = `sms:${phone}?body=${encodeURIComponent(link)}`;
    } catch (error: any) {
      console.error(error);
      alert("Unexpected error:\n" + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Food With Care Driver</h1>

      <input
        placeholder="Case ID"
        value={caseId}
        onChange={(e) => setCaseId(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: 300 }}
      />

      <input
        placeholder="Stop ID"
        value={stopId}
        onChange={(e) => setStopId(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: 300 }}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: 300 }}
      />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending..." : "Send Case"}
      </button>
    </main>
  );
}