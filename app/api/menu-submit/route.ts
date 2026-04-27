import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { token, caseId, customer, selectedItems, timestamp } = body;

    if (!customer?.email) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      );
    }

    if (!selectedItems || selectedItems.length === 0) {
      return NextResponse.json(
        { error: 'No items selected' },
        { status: 400 }
      );
    }

    const itemsList = selectedItems
      .map(
        (item: any) =>
          `<li><strong>${item.name}</strong> (Qty: ${item.quantity})${item.diets && item.diets.length > 0 ? ` - ${item.diets.join(', ')}` : ''}</li>`
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 12px; }
    .header { text-align: center; margin-bottom: 24px; }
    h1 { color: #111827; font-size: 24px; margin: 0 0 8px 0; }
    .content { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 12px; }
    .info-row { display: flex; margin-bottom: 8px; }
    .info-label { font-weight: 600; color: #374151; min-width: 120px; }
    .info-value { color: #1f2937; }
    ul { margin: 0; padding-left: 20px; }
    li { margin-bottom: 8px; color: #1f2937; }
    .total { font-size: 14px; color: #6b7280; margin-top: 12px; font-weight: 600; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
      <p style="color: #6b7280; margin: 0;">Menu selection received</p>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${customer.firstName} ${customer.lastName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${customer.email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${customer.phone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Address:</span>
          <span class="info-value">${customer.address}</span>
        </div>
        ${caseId ? `<div class="info-row">
          <span class="info-label">Case ID:</span>
          <span class="info-value">${caseId}</span>
        </div>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">Selected Items</div>
        <ul>
          ${itemsList}
        </ul>
        <div class="total">Total items: ${selectedItems.reduce((sum: number, item: any) => sum + item.quantity, 0)}</div>
      </div>

      <div class="section">
        <div class="info-row">
          <span class="info-label">Submitted:</span>
          <span class="info-value">${timestamp}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from Food With Care. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;

    const emailFrom = process.env.EMAIL_FROM;

if (!emailFrom) {
  return NextResponse.json(
    { error: 'EMAIL_FROM is missing' },
    { status: 500 }
  );
}

const emailTo = process.env.EMAIL_TO || 'delivery@example.com';

const response = await resend.emails.send({
  from: `Food With Care <${emailFrom}>`,
  to: emailTo,
  subject: `Menu Selection - ${customer.firstName} ${customer.lastName}${caseId ? ` (Case ${caseId})` : ''}`,
  html: htmlContent,
});

    if (response.error) {
      console.error('Resend error:', response.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order submitted successfully',
        timestamp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Menu submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
