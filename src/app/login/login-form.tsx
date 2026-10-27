"use client";

import { useActionState, useEffect, useRef } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import {
  FormAlert,
  inputClass,
  labelClass,
  SubmitButton,
} from "@/components/auth/form-parts";
import { NextInput } from "@/components/auth/next-param";
import { PasswordInput } from "@/components/auth/password-input";

const initialState: LoginState = { submission: 0, email: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  // Remount on every response: the email comes back, the password doesn't (AS-13).
  return (
    <form key={state.submission} action={formAction} className="space-y-5">
      <LoginFields state={state} pending={pending} />
    </form>
  );
}

function LoginFields({
  state,
  pending,
}: {
  state: LoginState;
  pending: boolean;
}) {
  const passwordRef = useRef<HTMLInputElement>(null);

  // After a failed attempt, the email is still there; go straight to the password.
  useEffect(() => {
    if (state.error) passwordRef.current?.focus();
  }, [state.error]);

  return (
    <>
      {/* The message doesn't say which field is wrong (AU-07). */}
      <FormAlert message={state.error} />
      <NextInput />

      <div>
        <label htmlFor="email" className={labelClass}>
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          รหัสผ่าน
        </label>
        <PasswordInput
          ref={passwordRef}
          id="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>

      <SubmitButton pending={pending}>เข้าสู่ระบบ</SubmitButton>
    </>
  );
}
