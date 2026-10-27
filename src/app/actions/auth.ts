"use server";

import { redirect } from "next/navigation";
import { accountLockedMessage, messages } from "@/lib/auth/messages";
import { safeNextPath } from "@/lib/auth/paths";
import { login, register } from "@/lib/auth/service";
import { authDeps } from "@/lib/auth/supabase-members";
import type { FieldErrors, RegisterInput } from "@/lib/auth/validation";
import { createSessionClient } from "@/lib/supabase/server";

// Values sent back so the form can refill itself. Passwords are left out
// on purpose, so those fields come back empty (AS-09, AS-13).
export type RegisterValues = Omit<
  RegisterInput,
  "password" | "confirmPassword"
>;

export type RegisterState = {
  /** Changes on every response, so the form remounts with these values. */
  submission: number;
  values: RegisterValues;
  errors: FieldErrors;
  formError?: string;
};

export type LoginState = {
  submission: number;
  email: string;
  error?: string;
};

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function registerAction(
  previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Only known fields are read, so extra ones such as `role` are ignored (AU-04).
  const values: RegisterValues = {
    memberType: text(formData, "memberType"),
    fullName: text(formData, "fullName"),
    email: text(formData, "email"),
    employeeId: text(formData, "employeeId"),
    affiliation: text(formData, "affiliation"),
    consent: formData.get("consent") === "on",
  };
  const input: RegisterInput = {
    ...values,
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  };
  const state = { submission: previous.submission + 1, values };

  let result;
  try {
    result = await register(input, await authDeps());
  } catch (error) {
    console.error("Registration failed", error);
    return { ...state, errors: {}, formError: messages.UNEXPECTED };
  }
  if (!result.ok) return { ...state, errors: result.errors };

  redirect(safeNextPath(text(formData, "next")));
}

export async function loginAction(
  previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = text(formData, "email");
  const state = { submission: previous.submission + 1, email };

  let result;
  try {
    result = await login(
      { email, password: text(formData, "password") },
      await authDeps(),
    );
  } catch (error) {
    console.error("Login failed", error);
    return { ...state, error: messages.UNEXPECTED };
  }
  if (!result.ok) {
    return {
      ...state,
      error:
        result.error === "ACCOUNT_LOCKED"
          ? accountLockedMessage(result.lockedUntil)
          : messages.INVALID_CREDENTIALS,
    };
  }

  redirect(safeNextPath(text(formData, "next")));
}

export async function logoutAction() {
  const supabase = await createSessionClient();
  // Local scope: only this browser, not the user's other devices.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
