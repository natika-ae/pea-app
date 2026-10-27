// Registration rules for spec 003 (BR-01 – BR-05, AU-01, AU-02).
// Kept free of Next.js and Supabase imports so it can be unit tested directly.

import { affiliations } from "../../content/affiliations";
import { messages } from "./messages";

export const MEMBER_TYPES = ["EMPLOYEE", "PUBLIC"] as const;
export type MemberType = (typeof MEMBER_TYPES)[number];

export const FULL_NAME_LENGTH = { min: 2, max: 100 };
export const MIN_PASSWORD_LENGTH = 8;
// bcrypt (used by Supabase Auth) ignores everything past 72 bytes.
const MAX_PASSWORD_BYTES = 72;
const EMPLOYEE_EMAIL_DOMAIN = "@pea.co.th";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
// ASCII digits only, so Thai digits (๑๒๓) are rejected.
const EMPLOYEE_ID_PATTERN = /^[0-9]{6}$/;

/** Raw form values, as submitted. */
export type RegisterInput = {
  memberType: string;
  fullName: string;
  email: string;
  employeeId: string;
  affiliation: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
};

export type RegisterField = keyof RegisterInput;
export type FieldErrors = Partial<Record<RegisterField, string>>;

/** Normalized values that would be stored (AU-02). */
export type NewMember = {
  memberType: MemberType;
  fullName: string;
  email: string;
  /** Always null for PUBLIC, even if the request sent one (BR-04). */
  employeeId: string | null;
  affiliation: string | null;
  password: string;
};

/** Counts code points, so Thai vowels and tone marks count as 1 each. */
export function characterCount(value: string): number {
  return [...value].length;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isMemberType(value: string): value is MemberType {
  return (MEMBER_TYPES as readonly string[]).includes(value);
}

/**
 * Checks the format of every field at once (AU-06). Uniqueness is checked
 * separately, against the database, once the format is valid.
 */
export function validateRegistration(input: RegisterInput): {
  member: NewMember;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const memberType = isMemberType(input.memberType) ? input.memberType : null;
  const isEmployee = memberType === "EMPLOYEE";

  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);
  const employeeId = isEmployee ? input.employeeId.trim() : null;
  const affiliation = isEmployee ? input.affiliation : null;
  const { password } = input;

  if (!memberType) errors.memberType = messages.memberType;

  const nameLength = characterCount(fullName);
  if (nameLength < FULL_NAME_LENGTH.min || nameLength > FULL_NAME_LENGTH.max) {
    errors.fullName = messages.fullName;
  }

  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = messages.email;
  } else if (isEmployee && !email.endsWith(EMPLOYEE_EMAIL_DOMAIN)) {
    errors.email = messages.EMPLOYEE_EMAIL_REQUIRED;
  }

  if (isEmployee) {
    if (!EMPLOYEE_ID_PATTERN.test(employeeId ?? "")) {
      errors.employeeId = messages.employeeId;
    }
    if (!affiliations.some((a) => a.code === affiliation)) {
      errors.affiliation = messages.affiliation;
    }
  }

  // Passwords are never trimmed (AU-02).
  if (characterCount(password) < MIN_PASSWORD_LENGTH) {
    errors.password = messages.password;
  } else if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    errors.password = messages.passwordTooLong;
  }
  if (input.confirmPassword !== password) {
    errors.confirmPassword = messages.confirmPassword;
  }

  if (!input.consent) errors.consent = messages.consent;

  return {
    // memberType is only null when there are errors, so the fallback is never stored.
    member: {
      memberType: memberType ?? "PUBLIC",
      fullName,
      email,
      employeeId,
      affiliation,
      password,
    },
    errors,
  };
}
