"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  registerAction,
  type RegisterState,
  type RegisterValues,
} from "@/app/actions/auth";
import {
  errorProps,
  FieldError,
  FormAlert,
  inputClass,
  labelClass,
  SubmitButton,
} from "@/components/auth/form-parts";
import { NextInput } from "@/components/auth/next-param";
import { PasswordInput } from "@/components/auth/password-input";
import { affiliations } from "@/content/affiliations";
import type { FieldErrors } from "@/lib/auth/validation";
import { characterCount, FULL_NAME_LENGTH } from "@/lib/auth/validation";

const initialState: RegisterState = {
  submission: 0,
  values: {
    memberType: "",
    fullName: "",
    email: "",
    employeeId: "",
    affiliation: "",
    consent: false,
  },
  errors: {},
};

const memberTypeOptions = [
  { value: "EMPLOYEE", label: "พนักงาน กฟภ." },
  { value: "PUBLIC", label: "บุคคลภายนอก" },
];

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  // Remount on every response so the fields start from the values the
  // server sent back, with both password fields empty (AS-09).
  return (
    <form key={state.submission} action={formAction} noValidate>
      <RegisterFields
        values={state.values}
        errors={state.errors}
        formError={state.formError}
        pending={pending}
      />
    </form>
  );
}

function RegisterFields({
  values,
  errors,
  formError,
  pending,
}: {
  values: RegisterValues;
  errors: FieldErrors;
  formError?: string;
  pending: boolean;
}) {
  const [memberType, setMemberType] = useState(values.memberType);
  const [nameLength, setNameLength] = useState(
    characterCount(values.fullName.trim()),
  );
  const isEmployee = memberType === "EMPLOYEE";
  const fieldsRef = useRef<HTMLDivElement>(null);

  // Move focus to the first field with an error after a failed submit.
  useEffect(() => {
    fieldsRef.current
      ?.querySelector<HTMLElement>("[aria-invalid=true]")
      ?.focus();
  }, []);

  return (
    <div ref={fieldsRef} className="space-y-5">
      <FormAlert message={formError} />
      <NextInput />

      <fieldset>
        <legend className={labelClass}>ประเภทผู้สมัคร</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {memberTypeOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-800 transition has-checked:border-purple-700 has-checked:bg-purple-50 has-checked:font-semibold has-checked:text-purple-900 has-focus-visible:ring-2 has-focus-visible:ring-purple-200"
            >
              <input
                type="radio"
                name="memberType"
                value={option.value}
                checked={memberType === option.value}
                onChange={(e) => setMemberType(e.target.value)}
                className="size-4 accent-purple-800"
                {...errorProps("memberType", errors.memberType)}
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldError field="memberType" error={errors.memberType} />
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="fullName" className={labelClass}>
            ชื่อ-นามสกุล
          </label>
          <span className="text-xs text-zinc-600" aria-hidden="true">
            {nameLength}/{FULL_NAME_LENGTH.max}
          </span>
        </div>
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={values.fullName}
          onChange={(e) => setNameLength(characterCount(e.target.value.trim()))}
          className={inputClass}
          {...errorProps("fullName", errors.fullName)}
        />
        <FieldError field="fullName" error={errors.fullName} />
      </div>

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
          defaultValue={values.email}
          className={inputClass}
          {...errorProps("email", errors.email)}
        />
        {isEmployee && !errors.email && (
          <p className="mt-1.5 text-sm text-zinc-600">
            พนักงานต้องใช้อีเมล @pea.co.th
          </p>
        )}
        <FieldError field="email" error={errors.email} />
      </div>

      {/* Hidden and disabled for PUBLIC, so the values aren't submitted but
          come back if the user switches again (AS-08). */}
      <fieldset
        hidden={!isEmployee}
        disabled={!isEmployee}
        className="space-y-5"
      >
        <div>
          <label htmlFor="employeeId" className={labelClass}>
            รหัสพนักงาน
          </label>
          <input
            id="employeeId"
            name="employeeId"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            defaultValue={values.employeeId}
            className={inputClass}
            {...errorProps("employeeId", errors.employeeId)}
          />
          <FieldError field="employeeId" error={errors.employeeId} />
        </div>

        <div>
          <label htmlFor="affiliation" className={labelClass}>
            สังกัด
          </label>
          <select
            id="affiliation"
            name="affiliation"
            defaultValue={values.affiliation}
            className={inputClass}
            {...errorProps("affiliation", errors.affiliation)}
          >
            <option value="">เลือกสังกัด</option>
            {affiliations.map((a) => (
              <option key={a.code} value={a.code}>
                {a.label}
              </option>
            ))}
          </select>
          <FieldError field="affiliation" error={errors.affiliation} />
        </div>
      </fieldset>

      <div>
        <label htmlFor="password" className={labelClass}>
          รหัสผ่าน
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          {...errorProps("password", errors.password)}
        />
        <FieldError field="password" error={errors.password} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          ยืนยันรหัสผ่าน
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          {...errorProps("confirmPassword", errors.confirmPassword)}
        />
        <FieldError field="confirmPassword" error={errors.confirmPassword} />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            defaultChecked={values.consent}
            className="mt-1 size-4 shrink-0 accent-purple-800"
            {...errorProps("consent", errors.consent)}
          />
          <label htmlFor="consent" className="text-sm text-zinc-800">
            ข้าพเจ้ายินยอมตาม
            <Link
              href="/privacy"
              target="_blank"
              className="mx-1 font-semibold text-purple-800 underline underline-offset-4"
            >
              นโยบายคุ้มครองข้อมูลส่วนบุคคล
              <span className="sr-only"> (เปิดในแท็บใหม่)</span>
            </Link>
          </label>
        </div>
        <FieldError field="consent" error={errors.consent} />
      </div>

      <SubmitButton pending={pending}>สมัครสมาชิก</SubmitButton>
    </div>
  );
}
