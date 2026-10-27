import { describe, expect, it } from "vitest";
import { validateRegistration, type RegisterInput } from "./validation";

const validPublic: RegisterInput = {
  memberType: "PUBLIC",
  fullName: "สมหญิง ใจดี",
  email: "somying@example.com",
  employeeId: "",
  affiliation: "",
  password: "secret123",
  confirmPassword: "secret123",
  consent: true,
};

const validEmployee: RegisterInput = {
  ...validPublic,
  memberType: "EMPLOYEE",
  fullName: "สมชาย ใจดี",
  email: "somchai@pea.co.th",
  employeeId: "123456",
  affiliation: "HQ",
};

function errorsFor(change: Partial<RegisterInput>, base = validPublic) {
  return validateRegistration({ ...base, ...change }).errors;
}

describe("valid input", () => {
  it("AS-01 public member has no errors and no employee fields", () => {
    const { member, errors } = validateRegistration(validPublic);
    expect(errors).toEqual({});
    expect(member).toMatchObject({
      memberType: "PUBLIC",
      employeeId: null,
      affiliation: null,
    });
  });

  it("AS-02 employee keeps employee ID and affiliation", () => {
    const { member, errors } = validateRegistration(validEmployee);
    expect(errors).toEqual({});
    expect(member).toMatchObject({
      memberType: "EMPLOYEE",
      employeeId: "123456",
      affiliation: "HQ",
    });
  });
});

describe("member type", () => {
  it.each(["", "ADMIN", "employee"])("%j is rejected", (memberType) => {
    expect(errorsFor({ memberType }).memberType).toBe(
      "กรุณาเลือกประเภทผู้สมัคร",
    );
  });
});

describe("AS-03 full name length (BR-01)", () => {
  it.each([
    ["ก", false],
    ["กข", true],
    ["   ก   ", false],
    ["   ", false],
    ["นิ", true],
    ["ก".repeat(100), true],
    ["ก".repeat(101), false],
  ])("%j → valid: %s", (fullName, valid) => {
    expect(errorsFor({ fullName }).fullName).toBe(
      valid ? undefined : "ชื่อ-นามสกุลต้องยาว 2–100 ตัวอักษร",
    );
  });

  it("stores the trimmed name (AU-02)", () => {
    const { member } = validateRegistration({
      ...validPublic,
      fullName: "  สมหญิง ใจดี  ",
    });
    expect(member.fullName).toBe("สมหญิง ใจดี");
  });
});

describe("AS-04 email format (BR-02)", () => {
  it.each(["somchai@", "@example.com", "somchai pea.co.th", ""])(
    "%j is rejected",
    (email) => {
      expect(errorsFor({ email }).email).toBe("รูปแบบอีเมลไม่ถูกต้อง");
    },
  );

  it("stores the email trimmed and lowercased (AU-02)", () => {
    const { member } = validateRegistration({
      ...validPublic,
      email: "  Somying@Example.COM ",
    });
    expect(member.email).toBe("somying@example.com");
  });
});

describe("AS-05 password (BR-03)", () => {
  it.each([
    ["abc1234", "abc1234", "password", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"],
    ["abc12345", "abc12345", null, null],
    ["abc12345", "abc12346", "confirmPassword", "รหัสผ่านไม่ตรงกัน"],
    ["Abc12345", "abc12345", "confirmPassword", "รหัสผ่านไม่ตรงกัน"],
    [" abc1234", " abc1234", null, null],
  ] as const)("%j / %j", (password, confirmPassword, field, message) => {
    const errors = errorsFor({ password, confirmPassword });
    if (field) expect(errors[field]).toBe(message);
    else expect(errors).toEqual({});
  });

  it("is never trimmed (AU-02)", () => {
    const { member } = validateRegistration({
      ...validPublic,
      password: " abc1234",
      confirmPassword: " abc1234",
    });
    expect(member.password).toBe(" abc1234");
  });

  it("rejects passwords over bcrypt's 72-byte limit", () => {
    const password = "ก".repeat(25); // 75 bytes in UTF-8
    expect(errorsFor({ password, confirmPassword: password }).password).toBe(
      "รหัสผ่านยาวเกินไป",
    );
  });
});

describe("AS-06 employee ID (BR-04)", () => {
  it.each(["", "12345", "1234567", "12345a", "๑๒๓๔๕๖"])(
    "%j is rejected",
    (employeeId) => {
      expect(errorsFor({ employeeId }, validEmployee).employeeId).toBe(
        "รหัสพนักงานต้องเป็นตัวเลข 6 หลัก",
      );
    },
  );

  it.each([
    ["012345", "012345"],
    [" 123456 ", "123456"],
  ])("%j is stored as %j", (employeeId, stored) => {
    const { member, errors } = validateRegistration({
      ...validEmployee,
      employeeId,
    });
    expect(errors).toEqual({});
    expect(member.employeeId).toBe(stored);
  });

  it.each(["", "UNKNOWN"])("affiliation %j is rejected", (affiliation) => {
    expect(errorsFor({ affiliation }, validEmployee).affiliation).toBe(
      "กรุณาเลือกสังกัด",
    );
  });
});

describe("AS-07 employee email domain (BR-05)", () => {
  it.each([
    ["EMPLOYEE", "somchai@pea.co.th", undefined],
    ["EMPLOYEE", "Somchai@PEA.CO.TH", undefined],
    ["EMPLOYEE", "somchai@gmail.com", "พนักงานต้องใช้อีเมล @pea.co.th"],
    ["EMPLOYEE", "somchai@mail.pea.co.th", "พนักงานต้องใช้อีเมล @pea.co.th"],
    [
      "EMPLOYEE",
      "somchai@pea.co.th.example.com",
      "พนักงานต้องใช้อีเมล @pea.co.th",
    ],
    ["PUBLIC", "somchai@pea.co.th", undefined],
  ])("%s %s", (memberType, email, message) => {
    expect(errorsFor({ memberType, email }, validEmployee).email).toBe(message);
  });
});

describe("AS-08 public members never get employee fields (BR-04)", () => {
  it("drops employee ID and affiliation sent with a PUBLIC request", () => {
    const { member, errors } = validateRegistration({
      ...validPublic,
      employeeId: "123456",
      affiliation: "HQ",
    });
    expect(errors).toEqual({});
    expect(member.employeeId).toBeNull();
    expect(member.affiliation).toBeNull();
  });

  it("doesn't validate employee fields for PUBLIC", () => {
    expect(errorsFor({ employeeId: "abc", affiliation: "" })).toEqual({});
  });
});

describe("AS-09 all errors at once (AU-06)", () => {
  it("reports name and confirm-password together", () => {
    expect(
      Object.keys(errorsFor({ fullName: "ก", confirmPassword: "nope" })),
    ).toEqual(["fullName", "confirmPassword"]);
  });

  it("reports every field of an empty employee form", () => {
    const errors = validateRegistration({
      memberType: "EMPLOYEE",
      fullName: "",
      email: "",
      employeeId: "",
      affiliation: "",
      password: "",
      confirmPassword: "",
      consent: false,
    }).errors;
    expect(Object.keys(errors).sort()).toEqual(
      [
        "fullName",
        "email",
        "employeeId",
        "affiliation",
        "password",
        "consent",
      ].sort(),
    );
  });
});

describe("AS-10 consent (AU-01)", () => {
  it("is required", () => {
    expect(errorsFor({ consent: false })).toEqual({
      consent: "กรุณายอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล",
    });
  });
});
