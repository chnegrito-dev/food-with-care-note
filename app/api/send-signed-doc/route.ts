import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type SignedPayload = {
  stopReference: string;
  phoneNumber: string;
  signedAt: string;
  signatureDataUrl: string;
  photoDataUrl?: string;
};

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

async function buildPdf({
  stopReference,
  phoneNumber,
  signedAt,
  signatureDataUrl,
  photoDataUrl,
}: SignedPayload) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 50;
  let y = height - 50;

  // 🔷 LOGO CENTRADO GRANDE
  const logoPath = path.join(process.cwd(), "public", "food-with-care-logo.png");
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    const logoWidth = 180;
    const logoHeight = 80;

    page.drawImage(logoImage, {
      x: (width - logoWidth) / 2,
      y: y - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });

    y -= logoHeight + 20;
  }

  // 🔷 TÍTULO
  page.drawText("DELIVERY AUTHORIZATION", {
    x: marginX,
    y,
    size: 20,
    font: fontBold,
  });

  y -= 30;

  // 🔷 CAJA DE INFORMACIÓN
  page.drawRectangle({
    x: marginX,
    y: y - 90,
    width: width - marginX * 2,
    height: 90,
    borderWidth: 1,
    borderColor: rgb(0.7, 0.7, 0.7),
  });

  let infoY = y - 25;

  page.drawText(`Stop: ${stopReference}`, {
    x: marginX + 10,
    y: infoY,
    size: 12,
    font: fontRegular,
  });

  infoY -= 20;

  page.drawText(`Phone: ${phoneNumber}`, {
    x: marginX + 10,
    y: infoY,
    size: 12,
    font: fontRegular,
  });

  infoY -= 20;

  page.drawText(`Signed: ${signedAt}`, {
    x: marginX + 10,
    y: infoY,
    size: 12,
    font: fontRegular,
  });

  y -= 120;

  // 🔷 MENSAJE CENTRAL
  page.drawText("PLEASE LEAVE THE BOX", {
    x: marginX,
    y,
    size: 18,
    font: fontBold,
  });

  y -= 25;

  page.drawText("POR FAVOR DEJE LA CAJA", {
    x: marginX,
    y,
    size: 16,
    font: fontBold,
  });

  y -= 30;

  // 🔷 LÍNEA
  page.drawLine({
    start: { x: marginX, y },
    end: { x: width - marginX, y },
    thickness: 1,
  });

  y -= 30;

  // 🔷 FIRMA
  page.drawText("Signature / Firma", {
    x: marginX,
    y,
    size: 14,
    font: fontBold,
  });

  y -= 150;

// 📸 FOTO DEL DELIVERY
if (photoDataUrl) {
  const photoBytes = dataUrlToBytes(photoDataUrl);
  let photoImage;

try {
  photoImage = await pdfDoc.embedJpg(photoBytes);
} catch {
  photoImage = await pdfDoc.embedPng(photoBytes);
}

  const photoWidth = 200;
  const photoHeight = 150;

  page.drawImage(photoImage, {
    x: width - marginX - photoWidth,
    y: y + 40,
    width: photoWidth,
    height: photoHeight,
  });
}

  const signatureBytes = dataUrlToBytes(signatureDataUrl);
  const signatureImage = await pdfDoc.embedPng(signatureBytes);

  page.drawImage(signatureImage, {
    x: marginX,
    y,
    width: 250,
    height: 100,
  });

  return Buffer.from(await pdfDoc.save());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SignedPayload;

    if (
      !body.stopReference ||
      !body.phoneNumber ||
      !body.signedAt ||
      !body.signatureDataUrl
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      SMTP_FROM,
      OFFICE_EMAIL,
    } = process.env;

    if (
      !SMTP_HOST ||
      !SMTP_PORT ||
      !SMTP_USER ||
      !SMTP_PASS ||
      !SMTP_FROM ||
      !OFFICE_EMAIL
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing email environment variables." },
        { status: 500 }
      );
    }

    const pdfBuffer = await buildPdf(body);
let photoBuffer: Buffer | null = null;

if (body.photoDataUrl) {
  const base64 = body.photoDataUrl.split(",")[1] || "";
  photoBuffer = Buffer.from(base64, "base64");
}
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: OFFICE_EMAIL,
      subject: `Food With Care Authorization Signed - ${body.stopReference}`,
      text:
        `A signed delivery authorization was received.\n\n` +
        `Stop Reference: ${body.stopReference}\n` +
        `Phone Number: ${body.phoneNumber}\n` +
        `Signed At: ${body.signedAt}\n`,
     attachments: [
  {
    filename: `food-with-care-authorization-${body.stopReference
      .replace(/[^a-z0-9-_]+/gi, "-")
      .toLowerCase()}.pdf`,
    content: pdfBuffer,
    contentType: "application/pdf",
  },
  ...(photoBuffer
    ? [
        {
          filename: "delivery-photo.jpg",
          content: photoBuffer,
          contentType: "image/jpeg",
        },
      ]
    : []),
],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("send-signed-doc error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate/send signed document." },
      { status: 500 }
    );
  }
}