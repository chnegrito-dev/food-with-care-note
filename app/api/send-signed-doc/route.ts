import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { stopReference, phoneNumber, signature } = body;

    if (!stopReference || !phoneNumber || !signature) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    console.log("DATA RECEIVED:", {
      stopReference,
      phoneNumber,
      signature: signature.slice(0, 50),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}