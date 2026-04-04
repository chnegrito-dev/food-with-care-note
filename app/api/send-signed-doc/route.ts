import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { caseId, phoneNumber, signature } = await req.json();

    if (!caseId || !phoneNumber || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    return await new Promise<Response>((resolve) => {
      doc.on("end", async () => {
        try {
          const pdfData = Buffer.concat(buffers);

          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465, // 🔥 automático
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"Food With Care" <${process.env.SMTP_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: `Signed Document - ${caseId}`,
            text: `
Case ID: ${caseId}
Phone Number: ${phoneNumber}
            `,
            attachments: [
              {
                filename: `signed-${caseId}.pdf`,
                content: pdfData,
              },
            ],
          });

          resolve(NextResponse.json({ success: true }));
        } catch (error) {
          console.error("EMAIL ERROR:", error);

          resolve(
            NextResponse.json(
              { error: "Email failed" },
              { status: 500 }
            )
          );
        }
      });

      // PDF CONTENT
      doc.fontSize(18).text("Food With Care", { align: "center" });

      doc.moveDown();
      doc.fontSize(12).text("Please Leave The Box");
      doc.text("Por Favor Deje La Caja");

      doc.moveDown();
      doc.text(`Case ID: ${caseId}`);
      doc.text(`Phone Number: ${phoneNumber}`);

      doc.moveDown();
      doc.text("Signature:");

      // 🔥 LIMPIEZA BASE64 CORRECTA
      const base64Data = signature.includes(",")
        ? signature.split(",")[1]
        : signature;

      const imgBuffer = Buffer.from(base64Data, "base64");

      if (!imgBuffer || imgBuffer.length === 0) {
        throw new Error("Invalid signature image");
      }

      doc.moveDown();

      // 🔥 FORMA SEGURA (sin errores de PDFKit)
      doc.image(imgBuffer, 50, doc.y, {
        width: 200,
      });

      doc.end();
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}