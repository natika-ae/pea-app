// Types, validation and formatting for the About page (spec 002).
// Kept free of Next.js imports so it can be unit tested directly.

export type AboutContent = {
  name: string;
  shortName: string;
  tagline: string;
  vision: string;
  missions: string[];
  benefits: { title: string; description: string }[];
  /** Buddhist Era year, e.g. 2560 */
  foundedYear: number;
  stats: {
    courses: number;
    learners: number;
    certificates: number;
    /** ISO date (YYYY-MM-DD) the numbers were last updated */
    asOf: string;
  };
  contact: {
    address: string;
    /** Digits only, e.g. "021234567". Formatted for display. */
    phone: string;
    email: string;
    hours: string;
  };
};

const TAGLINE_MAX_LENGTH = 120;
const BENEFIT_DESCRIPTION_MAX_LENGTH = 200;
const BENEFIT_COUNT = 3;
const MISSION_COUNT = { min: 1, max: 5 };
// Plausible Buddhist Era range; catches years entered as CE (e.g. 2017).
const FOUNDED_YEAR_BE = { min: 2400, max: 2700 };
const BE_OFFSET = 543;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Thai landline (9 digits, 0X) or mobile (10 digits, 0X).
const PHONE_PATTERN = /^0\d{8,9}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const numberFormat = new Intl.NumberFormat("th-TH");
const thaiDateFormat = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Length in characters (code points), not UTF-16 units. */
function charLength(value: string) {
  return [...value].length;
}

function isNonEmpty(value: string) {
  return value.trim().length > 0;
}

function isCount(value: number) {
  return Number.isInteger(value) && value >= 0;
}

function isIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects dates like 2026-02-30 that Date silently rolls over.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** Returns every rule the content breaks; an empty array means valid (AB-05). */
export function validateAboutContent(content: AboutContent): string[] {
  const errors: string[] = [];
  const check = (ok: boolean, message: string) => {
    if (!ok) errors.push(message);
  };

  check(isNonEmpty(content.name), "name ต้องไม่ว่าง");
  check(isNonEmpty(content.shortName), "shortName ต้องไม่ว่าง");
  check(isNonEmpty(content.tagline), "tagline ต้องไม่ว่าง");
  check(
    charLength(content.tagline) <= TAGLINE_MAX_LENGTH,
    `tagline ยาวเกิน ${TAGLINE_MAX_LENGTH} ตัวอักษร`,
  );
  check(isNonEmpty(content.vision), "vision ต้องไม่ว่าง");

  check(
    content.missions.length >= MISSION_COUNT.min &&
      content.missions.length <= MISSION_COUNT.max,
    `missions ต้องมี ${MISSION_COUNT.min}–${MISSION_COUNT.max} ข้อ`,
  );
  content.missions.forEach((mission, i) =>
    check(isNonEmpty(mission), `missions[${i}] ต้องไม่ว่าง`),
  );

  check(
    content.benefits.length === BENEFIT_COUNT,
    `benefits ต้องมี ${BENEFIT_COUNT} ใบพอดี`,
  );
  content.benefits.forEach((benefit, i) => {
    check(isNonEmpty(benefit.title), `benefits[${i}].title ต้องไม่ว่าง`);
    check(
      isNonEmpty(benefit.description),
      `benefits[${i}].description ต้องไม่ว่าง`,
    );
    check(
      charLength(benefit.description) <= BENEFIT_DESCRIPTION_MAX_LENGTH,
      `benefits[${i}].description ยาวเกิน ${BENEFIT_DESCRIPTION_MAX_LENGTH} ตัวอักษร`,
    );
  });

  check(
    Number.isInteger(content.foundedYear) &&
      content.foundedYear >= FOUNDED_YEAR_BE.min &&
      content.foundedYear <= FOUNDED_YEAR_BE.max,
    "foundedYear ต้องเป็นปี พ.ศ. (เช่น 2560)",
  );

  const { stats, contact } = content;
  check(isCount(stats.courses), "stats.courses ต้องเป็นจำนวนเต็มไม่ติดลบ");
  check(isCount(stats.learners), "stats.learners ต้องเป็นจำนวนเต็มไม่ติดลบ");
  check(
    isCount(stats.certificates),
    "stats.certificates ต้องเป็นจำนวนเต็มไม่ติดลบ",
  );
  check(isIsoDate(stats.asOf), "stats.asOf ต้องอยู่ในรูปแบบ YYYY-MM-DD");

  check(isNonEmpty(contact.address), "contact.address ต้องไม่ว่าง");
  check(
    PHONE_PATTERN.test(contact.phone),
    "contact.phone ต้องเป็นตัวเลขล้วน 9–10 หลัก ขึ้นต้นด้วย 0",
  );
  check(EMAIL_PATTERN.test(contact.email), "contact.email รูปแบบไม่ถูกต้อง");
  check(isNonEmpty(contact.hours), "contact.hours ต้องไม่ว่าง");

  return errors;
}

export function assertValidAboutContent(content: AboutContent): AboutContent {
  const errors = validateAboutContent(content);
  if (errors.length > 0) {
    throw new Error(`เนื้อหาหน้าเกี่ยวกับเราไม่ถูกต้อง:\n- ${errors.join("\n- ")}`);
  }
  return content;
}

/** AB-01: 12500 → "12,500" */
export function formatCount(value: number) {
  return numberFormat.format(value);
}

/** AB-02: "2026-09-30" → "30 กันยายน 2569" */
export function formatThaiDate(isoDate: string) {
  return thaiDateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

/** "021234567" → "02-123-4567", "0812345678" → "081-234-5678" */
export function formatPhone(digits: string) {
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** AB-03: current Buddhist Era year in Thai time minus the founding year, never negative. */
export function yearsInOperation(foundedYearBE: number, now: Date) {
  const bangkokYearBE =
    new Date(now.getTime() + BANGKOK_OFFSET_MS).getUTCFullYear() + BE_OFFSET;
  return Math.max(0, bangkokYearBE - foundedYearBE);
}
