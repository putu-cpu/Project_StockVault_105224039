"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema } from "../schemas/auth";
import { demoUsers } from "../data/mockData";
import { demoPasswordHashes } from "../data/demoCredentials";
import { createSessionToken } from "../lib/session";
import { verifyPassword } from "../lib/password";

export interface ActionResponse {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

async function storeSession(userId: string): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = createSessionToken(userId);

  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 jam dalam detik
  });

  return sessionId;
}

export async function createSession(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string }> {
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { success: false, message: "Enter a valid partner email and a non-empty password." };
  }

  const account = demoUsers.find((user) => user.email === validation.data.email);
  const passwordHash = demoPasswordHashes[validation.data.email];
  if (!account || !passwordHash || !(await verifyPassword(validation.data.password, passwordHash))) {
    return { success: false, message: "Invalid email or password." };
  }

  await storeSession(account.id);
  return { success: true };
}

/**
 * Server Action: loginAction
 */
export async function loginAction(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const validation = loginSchema.safeParse({
    email: typeof rawEmail === "string" ? rawEmail : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
  });

  if (!validation.success) {
    return {
      success: false,
      message: "Validasi formulir gagal. Harap periksa masukan Anda.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validation.data;
  const account = demoUsers.find((user) => user.email === email);
  const passwordHash = demoPasswordHashes[email];
  if (!account || !passwordHash || !(await verifyPassword(password, passwordHash))) {
    return {
      success: false,
      message: "Autentikasi gagal: email atau kata sandi tidak valid.",
    };
  }

  await storeSession(account.id);
  revalidatePath("/");
  redirect("/");
}

/**
 * Server Action: logoutAction
 * Menghapus kuki sesi aktif
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  revalidatePath("/");
}
