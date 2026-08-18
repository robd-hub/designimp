import { NextResponse } from "next/server";
import { Resend } from "resend";

const FROM_ADDRESS = "Design Imp <hello@designimp.com>";
const TO_ADDRESS = "rob@designimp.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, businessName, businessType, businessUrl, company } = body;

  // Honeypot: bots fill this hidden field, real users never see it.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !businessName || !businessType || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: email,
      subject: `New mockup request — ${businessName}`,
      text: `Name: ${name}\nEmail: ${email}\nBusiness: ${businessName}\nType: ${businessType}\nWebsite: ${businessUrl || "—"}`,
    });

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
