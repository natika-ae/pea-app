import { describe, expect, it } from "vitest";
import { aboutContent } from "../content/about";
import {
  formatCount,
  formatPhone,
  formatThaiDate,
  validateAboutContent,
  yearsInOperation,
  type AboutContent,
} from "./about";

function withChanges(change: (draft: AboutContent) => void): AboutContent {
  const draft = structuredClone(aboutContent);
  change(draft);
  return draft;
}

describe("about content file", () => {
  it("is valid (AB-05)", () => {
    expect(validateAboutContent(aboutContent)).toEqual([]);
  });
});

describe("AS-04 number and date formatting", () => {
  it.each([
    [12500, "12,500"],
    [48, "48"],
    [0, "0"],
    [1234567, "1,234,567"],
  ])("formatCount(%d) → %s", (value, expected) => {
    expect(formatCount(value)).toBe(expected);
  });

  it("formats asOf as a Thai Buddhist Era date", () => {
    expect(formatThaiDate("2026-09-30")).toBe("30 กันยายน 2569");
    expect(formatThaiDate("2027-01-01")).toBe("1 มกราคม 2570");
  });
});

describe("AS-05 years in operation", () => {
  it.each([
    ["2026-10-27T10:00:00+07:00", 2560, 9],
    ["2026-12-31T23:59:59.999+07:00", 2560, 9],
    ["2027-01-01T00:00:00.000+07:00", 2560, 10],
    ["2026-12-31T17:00:00Z", 2560, 10],
    ["2026-10-27T10:00:00+07:00", 2569, 0],
  ])("at %s founded %d → %d years", (now, foundedYear, expected) => {
    expect(yearsInOperation(foundedYear, new Date(now))).toBe(expected);
  });

  it("never goes below 0", () => {
    expect(yearsInOperation(2575, new Date("2026-10-27T10:00:00+07:00"))).toBe(
      0,
    );
  });
});

describe("AS-06 phone formatting", () => {
  it.each([
    ["021234567", "02-123-4567"],
    ["0812345678", "081-234-5678"],
  ])("formatPhone(%s) → %s", (digits, expected) => {
    expect(formatPhone(digits)).toBe(expected);
  });
});

describe("AS-11 malformed content is caught", () => {
  it.each<[string, (draft: AboutContent) => void]>([
    ["email without domain", (d) => void (d.contact.email = "training@")],
    ["phone with dashes", (d) => void (d.contact.phone = "02-589-9000")],
    ["negative learners", (d) => void (d.stats.learners = -1)],
    ["founded year in CE", (d) => void (d.foundedYear = 2017)],
    ["only 2 benefit cards", (d) => void d.benefits.pop()],
    ["4 benefit cards", (d) => void d.benefits.push(d.benefits[0])],
    ["asOf in Thai format", (d) => void (d.stats.asOf = "30/09/2569")],
    ["asOf not a real date", (d) => void (d.stats.asOf = "2026-02-30")],
    ["fractional course count", (d) => void (d.stats.courses = 4.5)],
    ["tagline over 120 chars", (d) => void (d.tagline = "ก".repeat(121))],
    [
      "benefit description over 200 chars",
      (d) => void (d.benefits[0].description = "ก".repeat(201)),
    ],
    ["no missions", (d) => void (d.missions = [])],
    ["6 missions", (d) => void (d.missions = Array(6).fill("พันธกิจ"))],
    ["empty address", (d) => void (d.contact.address = " ")],
  ])("%s", (_, change) => {
    expect(validateAboutContent(withChanges(change))).not.toEqual([]);
  });
});
