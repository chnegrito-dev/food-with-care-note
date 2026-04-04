"use client";

import { useRef, useEffect, useState } from "react";

export default function SignPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

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
      return {
        x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
        y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top,
      };
    };

    const start = (e: any) => {
      setDrawing(true);
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const move = (e: any) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stop = () => {
      setDrawing(false);
      ctx.closePath();
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", stop);

    canvas.addEventListener("touchstart", start);
    canvas.addEventListener("touchmove", move);
    canvas.addEventListener("touchend", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", stop);

      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", stop);
    };
  }, [drawing]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL("image/png");

    console.log("Signature:", signature);

    alert("Signature captured (next step: send to API)");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Food With Care</h2>
      <p>Please Leave The Box</p>
      <p>Por Favor Deje La Caja</p>

      <h3>Signature / Firma</h3>

      {/* 🔥 CANVAS REAL */}
      <canvas
        ref={canvasRef}
        width={350}
        height={200}
        style={{
          border: "2px solid black",
          borderRadius: 10,
          background: "white",
        }}
      />

      <p>Sign with your finger / Firme con su dedo</p>

      <button onClick={handleClear}>
        Clear / Limpiar
      </button>

      <button onClick={handleSubmit} style={{ marginLeft: 10 }}>
        Submit / Enviar
      </button>
    </div>
  );
}