"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema } from "../schemas/auth";
import { demoUsers } from "../data/mockData";

export interface ActionResponse {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Menerbitkan kuki sesi aman (HttpOnly, Secure, SameSite=Lax, Path=/)
 */
export async function createSession(userId: string): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = `sv_sess_${userId}_${Date.now()}`;

  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 jam dalam detik
  });

  return sessionId;
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

  const { email } = validation.data;
  const account = demoUsers.find((user) => user.email === email);
  if (!account) {
    return {
      success: false,
      message: "Autentikasi gagal: akun mitra tidak terdaftar pada sistem.",
    };
  }

  await createSession(account.id);
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
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  revalidatePath("/");
}
