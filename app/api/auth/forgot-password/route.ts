/**
 * Forgot Password API Route
 * 
 * POST /api/auth/forgot-password - Send password reset email
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a password reset email has been sent.",
      });
    }

    // Check if user has a password (not OAuth-only)
    if (!user.password) {
      return NextResponse.json({
        message: "If an account exists, a password reset email has been sent.",
      });
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // In production, you would send an email here
    // For now, we'll log the URL (remove in production!)
    console.log("Password reset URL:", resetUrl);

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: "noreply@bioinformaticshub.io",
    //   to: email,
    //   subject: "Reset your password",
    //   html: `
    //     <h1>Reset your password</h1>
    //     <p>Click the link below to reset your password:</p>
    //     <a href="${resetUrl}">Reset Password</a>
    //     <p>This link will expire in 1 hour.</p>
    //   `,
    // });

    return NextResponse.json({
      message: "If an account exists, a password reset email has been sent.",
      // Remove in production - only for development
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
