import { describe, expect, it } from "vitest";
import { isProtectedPath, nextQuery, safeNextPath } from "./paths";

describe("AS-16 safeNextPath (BR-07)", () => {
  it.each([
    ["/courses/SAF-101", "/courses/SAF-101"],
    ["/my-courses?tab=pending", "/my-courses?tab=pending"],
    [undefined, "/"],
    ["", "/"],
    ["https://evil.example.com", "/"],
    ["//evil.example.com", "/"],
    ["/\\evil.example.com", "/"],
    ["courses/SAF-101", "/"],
    ["javascript:alert(1)", "/"],
    ["/login", "/"],
    ["/register", "/"],
    ["/login?next=/x", "/"],
    // Extra escapes beyond the spec table.
    ["/\t/evil.example.com", "/"],
    ["/.//evil.example.com", "/"],
    [["/courses/SAF-101"], "/"],
  ])("%j → %s", (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });
});

describe("nextQuery", () => {
  it("passes a safe path on", () => {
    expect(nextQuery("/courses/SAF-101")).toBe("?next=%2Fcourses%2FSAF-101");
  });

  it("drops unsafe values", () => {
    expect(nextQuery("//evil.example.com")).toBe("");
    expect(nextQuery(undefined)).toBe("");
  });
});

describe("isProtectedPath (AU-11)", () => {
  it.each([
    ["/my-courses", true],
    ["/my-courses/abc", true],
    ["/my-courses-old", false],
    ["/", false],
    ["/login", false],
  ])("%s → %s", (path, expected) => {
    expect(isProtectedPath(path)).toBe(expected);
  });
});
