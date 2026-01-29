import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailTemplates } from "@/lib/email-templates";
// In a real app, use a mailer service (e.g., Resend, SendGrid)
// import { sendEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Valid security practice: Don't reveal if user exists
    if (!user) {
      return NextResponse.json({ success: true, message: "If an account exists, a reset email has been sent." });
    }

    const token = Math.random().toString(36).substr(2, 12) + Math.random().toString(36).substr(2, 12);
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
    const emailHtml = emailTemplates.passwordReset(resetLink);

    // Mock sending email
    console.log(`[EMAIL MOCK] To: ${email}, Subject: Password Reset`);
    console.log(`[EMAIL MOCK] Link: ${resetLink}`);
    
    // await sendEmail({ to: email, subject: "Reset Password", html: emailHtml });

    return NextResponse.json({ success: true, message: "If an account exists, a reset email has been sent." });

  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to initiate password reset" },
      { status: 500 }
    );
  }
}
