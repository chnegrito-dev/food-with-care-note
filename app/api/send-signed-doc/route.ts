import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { stopReference, phoneNumber, signature } = await req.json();

    if (!stopReference || !phoneNumber || !signature) {
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
            secure: true, // 🔥 IMPORTANTE (465 = true)
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"Food With Care" <${process.env.SMTP_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: `Signed Document - ${stopReference}`,
            text: `
Stop Reference: ${stopReference}
Phone Number: ${phoneNumber}
            `,
            attachments: [
              {
                filename: "signature.pdf",
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

      // PDF
      doc.fontSize(18).text("Food With Care", { align: "center" });

      doc.moveDown();
      doc.fontSize(12).text("Please Leave The Box");
      doc.text("Por Favor Deje La Caja");

      doc.moveDown();
      doc.text(`Stop Reference: ${stopReference}`);
      doc.text(`Phone Number: ${phoneNumber}`);

      doc.moveDown();
      doc.text("Signature:");

      let base64Data = signature;
      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }

      const imgBuffer = Buffer.from(base64Data, "base64");

      doc.image(imgBuffer, {
        fit: [250, 150],
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