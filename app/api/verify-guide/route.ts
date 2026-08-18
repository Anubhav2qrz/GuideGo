import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      city,
      hourlyRate,
      specialties,
      upiId,
      govDocType,
      govDocNumber,
      docImageBase64,
      selfieImageBase64,
    } = body;

    const adminEmail = "goonanubhav@gmail.com";

    // Setup Nodemailer transporter with environment credentials or fallback
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    const attachments: Array<{ filename: string; content: Buffer }> = [];

    // Parse Document base64 attachment
    if (docImageBase64 && docImageBase64.includes("base64,")) {
      const parts = docImageBase64.split("base64,");
      const ext = docImageBase64.includes("pdf") ? "pdf" : "jpg";
      const buffer = Buffer.from(parts[1], "base64");
      attachments.push({
        filename: `Govt_Document_${(govDocType || "ID").replace(/\s+/g, "_")}.${ext}`,
        content: buffer,
      });
    }

    // Parse Selfie base64 attachment
    if (selfieImageBase64 && selfieImageBase64.includes("base64,")) {
      const parts = selfieImageBase64.split("base64,");
      const buffer = Buffer.from(parts[1], "base64");
      attachments.push({
        filename: `Live_Verification_Selfie_${(fullName || "Guide").replace(/\s+/g, "_")}.jpg`,
        content: buffer,
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">GuideGo — New Guide KYC Application</h2>
        <p style="font-size: 14px; color: #475569;">A new guide has submitted their KYC documents and verification details for review:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1; width: 40%;">Guide Full Name:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${fullName || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1;">Email Address:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${email || "—"}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1;">Registered City:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${city || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1;">Hourly Rate:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">₹${hourlyRate || "800"} / hour</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1;">Specialties:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${specialties || "Local Culture"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1; color: #059669;">Personal UPI ID (85% Payouts):</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; font-family: monospace;">${upiId || "—"}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1;">Government Document Type:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${govDocType || "Aadhaar Card"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1;">Document / ID Number:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${govDocNumber || "—"}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 13px; color: #166534;">
          <strong>Attachments:</strong> The Government ID document image and live verification face photo are attached to this email for administrative verification.
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">GuideGo Admin Verification Dispatch</p>
      </div>
    `;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"GuideGo Verification" <${smtpUser}>`,
        to: adminEmail,
        subject: `[GuideGo KYC] New Guide Application Verification: ${fullName} (${city})`,
        html: htmlContent,
        attachments: attachments,
      });
    } else {
      console.log(`[KYC EMAIL DISPATCH to ${adminEmail}] Guide: ${fullName}, Doc: ${govDocType} (${govDocNumber}), Attachments: ${attachments.length}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("KYC email dispatch error:", error);
    // Return 200 so guide signup is not blocked even if SMTP is not configured
    return NextResponse.json({ success: true, warning: error.message });
  }
}
