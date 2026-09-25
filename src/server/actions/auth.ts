"use server";

import { redirect } from "next/navigation";
import db from "@/server/databases/db";
import { createSession, destroySession } from "@/server/lib/auth";
import { EmailNotConfiguredError } from "@/server/lib/email";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/server/lib/password";
import { completeReset, findResetToken, sendResetLink } from "@/server/services/auth/passwordReset";
import { clearAttempts, clientIp, recordAttempt, retryAfterMinutes } from "@/server/lib/rateLimit";
import { safeNextPath } from "@/constants/safeRedirect";
import type { AuthFormState, ResetPasswordState, ResetRequestState } from "@/types/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = readField(formData, "email").toLowerCase();
  const displayName = readField(formData, "displayName");
  const password = formData.get("password");

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address.", email, displayName };
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, email, displayName };
  }

  const existing = await db.users.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "An account with that email already exists — sign in instead.", email, displayName };

  const user = await db.users.create({
    data: { email, display_name: displayName || null, password_hash: await hashPassword(password) },
    select: { id: true },
  });
  await createSession(user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = readField(formData, "email").toLowerCase();
  const password = formData.get("password");
  // One message for both "no such user" and "wrong password", so the form
  // can't be used to discover which emails have accounts.
  const invalid = { error: "Incorrect email or password.", email };

  if (!email || typeof password !== "string" || !password) return invalid;
  const ip = await clientIp();
  const wait = await retryAfterMinutes("login", email, ip);
  if (wait > 0) {
    return { error: `Too many failed attempts. Try again in ${wait} minute${wait === 1 ? "" : "s"}, or reset your password.`, email };
  }
  const user = await db.users.findUnique({ where: { email }, select: { id: true, password_hash: true } });
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await recordAttempt("login", email, ip);
    return invalid;
  }

  await clearAttempts("login", email);
  await createSession(user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function requestPasswordReset(_prev: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const email = readField(formData, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address.", email };
  const ip = await clientIp();
  const wait = await retryAfterMinutes("reset", email, ip);
  if (wait > 0) return { error: `Too many reset requests. Try again in ${wait} minute${wait === 1 ? "" : "s"}.`, email };
  await recordAttempt("reset", email, ip);

  const user = await db.users.findUnique({ where: { email }, select: { id: true, email: true, display_name: true } });
  if (user) {
    try {
      await sendResetLink(user);
    } catch (e) {
      console.error("Password reset email failed:", e);
      return { error: e instanceof EmailNotConfiguredError ? e.message : "The reset email couldn't be sent. Please try again shortly.", email };
    }
  }
  // Same answer whether or not the account exists.
  return { sent: true, email };
}

export async function resetPassword(_prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const token = readField(formData, "token");
  const password = formData.get("password");
  const confirm = formData.get("confirm");
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const record = await findResetToken(token);
  if (!record) return { error: "This reset link is invalid or has expired — request a new one." };
  await completeReset(record.id, record.user_id, await hashPassword(password));
  await createSession(record.user_id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
