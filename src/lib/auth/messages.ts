// User-facing messages for spec 003 §4.3.

export const messages = {
  memberType: "กรุณาเลือกประเภทผู้สมัคร",
  fullName: "ชื่อ-นามสกุลต้องยาว 2–100 ตัวอักษร",
  email: "รูปแบบอีเมลไม่ถูกต้อง",
  employeeId: "รหัสพนักงานต้องเป็นตัวเลข 6 หลัก",
  affiliation: "กรุณาเลือกสังกัด",
  password: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
  // Not in the spec: Supabase Auth hashes with bcrypt, which takes at most 72 bytes.
  passwordTooLong: "รหัสผ่านยาวเกินไป",
  confirmPassword: "รหัสผ่านไม่ตรงกัน",
  consent: "กรุณายอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล",
  EMAIL_TAKEN: "อีเมลนี้ถูกใช้แล้ว",
  EMPLOYEE_ID_TAKEN: "รหัสพนักงานนี้ถูกใช้แล้ว",
  EMPLOYEE_EMAIL_REQUIRED: "พนักงานต้องใช้อีเมล @pea.co.th",
  INVALID_CREDENTIALS: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  UNEXPECTED: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
} as const;

const thaiTime = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Bangkok",
});

/**
 * ACCOUNT_LOCKED message. The time is rounded up to the minute so that
 * "after HH:mm" is never earlier than the real unlock time.
 */
export function accountLockedMessage(lockedUntil: Date): string {
  const minute = 60_000;
  const shown = new Date(Math.ceil(lockedUntil.getTime() / minute) * minute);
  return `บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่หลังเวลา ${thaiTime.format(shown)} น.`;
}
