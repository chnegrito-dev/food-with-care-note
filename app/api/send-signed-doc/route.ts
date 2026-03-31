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
}: SignedPayload) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 50;
  let y = height - 50;

  const logoPath = path.join(process.cwd(), "public", "food-with-care-logo.png");
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.33);
    page.drawImage(logoImage, {
      x: (width - logoDims.width) / 2,
      y: y - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });
    y -= logoDims.height + 24;
  }

  page.drawText("Food With Care Delivery Authorization", {
    x: marginX,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  page.drawText(`Stop Reference: ${stopReference || "-"}`, {
    x: marginX,
    y,
    size: 12,
    font: fontRegular,
  });
  y -= 20;

  page.drawText(`Phone Number: ${phoneNumber || "-"}`, {
    x: marginX,
    y,
    size: 12,
    font: fontRegular,
  });
  y -= 20;

  page.drawText(`Signed At: ${signedAt || "-"}`, {
    x: marginX,
    y,
    size: 12,
    font: fontRegular,
  });
  y -= 35;

  page.drawText("Please Leave The Box", {
    x: marginX,
    y,
    size: 18,
    font: fontBold,
  });
  y -= 24;

  page.drawText("Por Favor Deje La Caja", {
    x: marginX,
    y,
    size: 16,
    font: fontBold,
  });
  y -= 28;

  page.drawLine({
    start: { x: marginX, y },
    end: { x: width - marginX, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  page.drawText("Signature / Firma", {
    x: marginX,
    y,
    size: 16,
    font: fontBold,
  });
  y -= 170;

  const signatureBytes = dataUrlToBytes(signatureDataUrl);
  const signatureImage = await pdfDoc.embedPng(signatureBytes);

  const maxSigWidth = width - marginX * 2;
  const maxSigHeight = 140;
  const sigDims = signatureImage.scale(1);

  const sigScale = Math.min(
    maxSigWidth / sigDims.width,
    maxSigHeight / sigDims.height
  );

  page.drawImage(signatureImage, {
    x: marginX,
    y,
    width: sigDims.width * sigScale,
    height: sigDims.height * sigScale,
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