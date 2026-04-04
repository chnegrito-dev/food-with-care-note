import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { stopReference, phoneNumber, signature } = body; // ✅ FIX

    if (!stopReference || !phoneNumber || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk)); // ✅ FIX

    return await new Promise<Response>((resolve) => { // ✅ FIX
      doc.on("end", async () => {
        try {
          const pdfData = Buffer.concat(buffers);

          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.OFFICE_EMAIL,
            subject: `Signed Delivery - ${stopReference}`,
            text: `Stop: ${stopReference}\nPhone: ${phoneNumber}`,
            attachments: [
              {
                filename: `delivery-${stopReference}.pdf`,
                content: pdfData,
              },
            ],
          });

          resolve(
            NextResponse.json({ success: true }, { status: 200 })
          );
        } catch (err) {
          console.error(err);
          resolve(
            NextResponse.json(
              { error: "Email/PDF error" },
              { status: 500 }
            )
          );
        }
      });

      // 📄 CONTENIDO PDF
      doc.fontSize(18).text("Delivery Confirmation", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Stop ID: ${stopReference}`);
      doc.text(`Phone: ${phoneNumber}`);
      doc.text(`Date: ${new Date().toLocaleString()}`);

      doc.moveDown();
      doc.text("Signature:");

      const base64Data = signature.replace(
        /^data:image\/png;base64,/,
        ""
      );

      const buffer = Buffer.from(base64Data, "base64");

      doc.image(buffer, { width: 200 });

      doc.end();
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}