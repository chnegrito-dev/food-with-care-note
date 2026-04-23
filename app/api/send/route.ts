import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;
const emailTo = (process.env.EMAIL_TO || '')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);

const resend = resendApiKey ? new Resend(resendApiKey) : null;

type RequestBody = {
  signature?: string;
  caseId?: string;
  logoUrl?: string;
  driverPhotoUrl?: string;
};

function dataUrlToBuffer(dataUrl: string): Buffer {
  const parts = dataUrl.split(',');
  if (parts.length < 2) {
    throw new Error('Invalid data URL');
  }
  return Buffer.from(parts[1], 'base64');
}

async function fetchImageAsBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function getOrlandoTimestamp() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

async function generateStyledPdf(params: {
  caseId: string;
  signature: string;
  logoUrl?: string;
}) {
  const { caseId, signature, logoUrl } = params;
  const signedAt = getOrlandoTimestamp();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 90;
  const cardWidth = width - marginX * 2;
  const cardTop = height - 70;
  const cardHeight = 610;
  const cardBottom = cardTop - cardHeight;

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.95, 0.96, 0.98),
  });

  page.drawRectangle({
    x: marginX,
    y: cardBottom,
    width: cardWidth,
    height: cardHeight,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.86, 0.88, 0.9),
    borderWidth: 1,
  });

  let currentY = cardTop - 36;

  if (logoUrl) {
    try {
      const logoBytes = await fetchImageAsBytes(logoUrl);
      let logoImage;

      try {
        logoImage = await pdfDoc.embedPng(logoBytes);
      } catch {
        logoImage = await pdfDoc.embedJpg(logoBytes);
      }

      const scaled = logoImage.scaleToFit(110, 110);

      page.drawImage(logoImage, {
        x: (width - scaled.width) / 2,
        y: currentY - scaled.height + 8,
        width: scaled.width,
        height: scaled.height,
      });
    } catch (error) {
      console.error('Logo load failed:', error);
    }
  }

  currentY -= 122;

  const line1 = 'Please Leave The Box';
  const line2 = 'Por Favor Deje La Caja';

  const line1Size = 20;
  const line2Size = 18;

  const line1Width = boldFont.widthOfTextAtSize(line1, line1Size);
  const line2Width = boldFont.widthOfTextAtSize(line2, line2Size);

  page.drawText(line1, {
    x: (width - line1Width) / 2,
    y: currentY,
    size: line1Size,
    font: boldFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  currentY -= 30;

  page.drawText(line2, {
    x: (width - line2Width) / 2,
    y: currentY,
    size: line2Size,
    font: boldFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  currentY -= 28;

  page.drawLine({
    start: { x: marginX + 35, y: currentY },
    end: { x: width - marginX - 35, y: currentY },
    thickness: 1,
    color: rgb(0.45, 0.45, 0.45),
  });

  currentY -= 34;

  const sigTitle = 'Signature / Firma';
  const sigTitleSize = 17;
  const sigTitleWidth = boldFont.widthOfTextAtSize(sigTitle, sigTitleSize);

  page.drawText(sigTitle, {
    x: (width - sigTitleWidth) / 2,
    y: currentY,
    size: sigTitleSize,
    font: boldFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  currentY -= 24;

  const signatureBoxX = marginX + 36;
  const signatureBoxY = currentY - 170;
  const signatureBoxWidth = cardWidth - 72;
  const signatureBoxHeight = 150;

  page.drawRectangle({
    x: signatureBoxX,
    y: signatureBoxY,
    width: signatureBoxWidth,
    height: signatureBoxHeight,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.78, 0.8, 0.83),
    borderWidth: 1,
  });

  const signatureBytes = dataUrlToBuffer(signature);
  const signatureImage = await pdfDoc.embedPng(signatureBytes);

  const signatureScaled = signatureImage.scaleToFit(
    signatureBoxWidth - 28,
    signatureBoxHeight - 28
  );

  page.drawImage(signatureImage, {
    x: signatureBoxX + 14,
    y: signatureBoxY + (signatureBoxHeight - signatureScaled.height) / 2,
    width: signatureScaled.width,
    height: signatureScaled.height,
  });

  currentY = signatureBoxY - 28;

  const footerText = 'Sign with your finger. / Firme con su dedo.';
  const footerSize = 11;
  const footerWidth = font.widthOfTextAtSize(footerText, footerSize);

  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: currentY,
    size: footerSize,
    font,
    color: rgb(0.35, 0.38, 0.42),
  });

  currentY -= 34;

  page.drawText(`Case ID: ${caseId}`, {
    x: marginX + 36,
    y: currentY,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  currentY -= 14;

  page.drawText(`Signed At: ${signedAt}`, {
    x: marginX + 36,
    y: currentY,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function buildHtml(params: {
  caseId: string;
  logoUrl?: string;
  signature: string;
  driverPhotoUrl?: string;
}) {
  const { caseId, logoUrl, signature, driverPhotoUrl } = params;
  const signedAt = getOrlandoTimestamp();

  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;">
          <div style="text-align:center;">
            ${
              logoUrl
                ? `<img src="${logoUrl}" alt="Food With Care Logo" style="max-width:100px;display:block;margin:0 auto 16px auto;" />`
                : ''
            }
            <p style="margin:0;color:#374151;font-size:15px;">Delivery signature received</p>
          </div>

          ${
            driverPhotoUrl
              ? `
                <div style="margin-top:24px;">
                  <p style="margin:0 0 12px 0;font-size:14px;color:#111827;"><strong>Driver photo</strong></p>
                  <div style="border:1px solid #d1d5db;border-radius:12px;padding:10px;background:#ffffff;">
                    <img src="${driverPhotoUrl}" alt="Driver Photo" style="width:100%;max-width:420px;display:block;margin:0 auto;border-radius:8px;" />
                  </div>
                </div>
              `
              : ''
          }

          <div style="margin-top:24px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
            <p style="margin:0 0 10px 0;font-size:14px;color:#111827;"><strong>Case ID:</strong> ${caseId}</p>
            <p style="margin:0;font-size:14px;color:#111827;"><strong>Signed At:</strong> ${signedAt}</p>
          </div>

          <div style="margin-top:24px;">
            <p style="margin:0 0 12px 0;font-size:14px;color:#111827;"><strong>Signed note preview</strong></p>
            <div style="border:1px solid #d1d5db;border-radius:12px;padding:10px;background:#ffffff;">
              <img src="${signature}" alt="Signature" style="width:100%;max-width:320px;display:block;margin:0 auto;" />
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    if (!resendApiKey || !emailFrom || !emailTo || !resend) {
      return NextResponse.json(
        {
          error: 'Missing environment variables: RESEND_API_KEY, EMAIL_FROM, EMAIL_TO',
        },
        { status: 500 }
      );
    }

    const body: RequestBody = await request.json();

    const signature = body.signature?.trim();
    const caseId = body.caseId?.trim();
    const logoUrl = body.logoUrl?.trim();
    const driverPhotoUrl = body.driverPhotoUrl?.trim();

    if (!signature) {
      return NextResponse.json({ error: 'signature is required' }, { status: 400 });
    }

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    if (!signature.startsWith('data:image/png;base64,')) {
      return NextResponse.json(
        { error: 'signature must be a PNG data URL' },
        { status: 400 }
      );
    }

    const pdfBuffer = await generateStyledPdf({
      caseId,
      signature,
      logoUrl,
    });

    const html = buildHtml({
      caseId,
      logoUrl,
      signature,
      driverPhotoUrl,
    });

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: emailTo,
      subject: `Delivery Signature - Case ${caseId}`,
      html,
      attachments: [
        {
          filename: `delivery-signature-${caseId}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        {
          error: error.message || 'Resend failed sending email',
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id ?? null,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Route error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown route error',
      },
      { status: 500 }
    );
  }
}