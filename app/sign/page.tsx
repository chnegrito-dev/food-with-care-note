"use client";

import { useEffect, useRef, useState } from "react";

export default function SignPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get("caseId");

    if (!caseId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-case/${caseId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => alert("Error loading case"));
  }, []);

  const startDraw = () => setDrawing(true);
  const endDraw = () => setDrawing(false);

  const draw = (e: any) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();

    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleSign = async () => {
    if (!data) return;

    try {
      setLoading(true);

      const signature = canvasRef.current?.toDataURL("image/png");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/send-signed-doc`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caseId: data.caseId,
            signatureDataUrl: signature,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Error sending signature");
      }

      alert("Signed and sent!");
    } catch (err) {
      console.error(err);
      alert("Error signing");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h2>Sign Delivery</h2>

      <p>Stop: {data.stopId}</p>

      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        style={{ border: "1px solid black" }}
        onMouseDown={startDraw}
        onMouseUp={endDraw}
        onMouseMove={draw}
      />

      <br /><br />

      <button onClick={handleSign} disabled={loading}>
        {loading ? "Sending..." : "Submit Signature"}
      </button>
    </main>
  );
}