"use client";

import { useRef, useEffect, useState } from "react";

export default function SignPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    const getPos = (e: any) => {
      const rect = canvas.getBoundingClientRect();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const start = (e: any) => {
      e.preventDefault();
      drawingRef.current = true;

      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const move = (e: any) => {
      if (!drawingRef.current) return;

      e.preventDefault();

      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stop = () => {
      drawingRef.current = false;
      ctx.closePath();
    };

    // mouse
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);

    // touch (IMPORTANTE: passive false)
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);

      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL("image/png");

    const params = new URLSearchParams(window.location.search);
    const caseId = params.get("caseId");
    const phoneNumber = params.get("phoneNumber");

    if (!caseId || !phoneNumber) {
      alert("Missing required data");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/send-signed-doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId,
          phoneNumber,
          signature,
        }),
      });

      if (!res.ok) {
        alert("Error sending signature");
        return;
      }

      alert("Signature sent successfully");
    } catch (err) {
      console.error(err);
      alert("Error sending signature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Food With Care</h2>
      <p>Please Leave The Box</p>
      <p>Por Favor Deje La Caja</p>

      <h3>Signature / Firma</h3>

      <canvas
        ref={canvasRef}
        width={350}
        height={200}
        style={{
          border: "2px solid black",
          borderRadius: 10,
          background: "white",
          touchAction: "none", // 🔥 CRÍTICO
        }}
      />

      <p>Sign with your finger / Firme con su dedo</p>

      <button onClick={handleClear} disabled={loading}>
        Clear / Limpiar
      </button>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginLeft: 10 }}
      >
        {loading ? "Sending..." : "Submit / Enviar"}
      </button>
    </div>
  );
}