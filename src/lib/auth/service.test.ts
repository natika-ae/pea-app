import { beforeEach, describe, expect, it } from "vitest";
import { UNLOCKED, type LockState } from "./lockout";
import { accountLockedMessage } from "./messages";
import {
  login,
  register,
  type AuthDeps,
  type CreateMemberResult,
  type MemberRepository,
} from "./service";
import type { NewMember, RegisterInput } from "./validation";

type StoredMember = NewMember & {
  userId: string;
  role: string;
  consentedAt: Date;
  lock: LockState;
};

class FakeMembers implements MemberRepository {
  rows: StoredMember[] = [];

  async isEmailTaken(email: string) {
    return this.rows.some((r) => r.email === email);
  }

  async isEmployeeIdTaken(employeeId: string) {
    return this.rows.some((r) => r.employeeId === employeeId);
  }

  // Synchronous body, so it is atomic like a database unique constraint.
  async createMember(
    member: NewMember,
    consentedAt: Date,
  ): Promise<CreateMemberResult> {
    if (this.rows.some((r) => r.email === member.email)) {
      return { ok: false, error: "EMAIL_TAKEN" };
    }
    if (
      member.employeeId &&
      this.rows.some((r) => r.employeeId === member.employeeId)
    ) {
      return { ok: false, error: "EMPLOYEE_ID_TAKEN" };
    }
    this.rows.push({
      ...member,
      userId: `user-${this.rows.length + 1}`,
      role: "LEARNER",
      consentedAt,
      lock: UNLOCKED,
    });
    return { ok: true };
  }

  async findLockStateByEmail(email: string) {
    const row = this.rows.find((r) => r.email === email);
    return row ? { userId: row.userId, lock: row.lock } : null;
  }

  async getLockState(userId: string) {
    return this.byId(userId).lock;
  }

  async updateLockState(
    userId: string,
    expectedFailedCount: number | null,
    next: LockState,
  ) {
    const row = this.byId(userId);
    if (
      expectedFailedCount !== null &&
      row.lock.failedCount !== expectedFailedCount
    ) {
      return false;
    }
    row.lock = next;
    return true;
  }

  byEmail(email: string) {
    return this.rows.find((r) => r.email === email);
  }

  private byId(userId: string) {
    const row = this.rows.find((r) => r.userId === userId);
    if (!row) throw new Error(`no user ${userId}`);
    return row;
  }
}

let members: FakeMembers;
let clock: Date;
let sessions: string[];
let deps: AuthDeps;

beforeEach(() => {
  members = new FakeMembers();
  clock = new Date("2026-10-27T10:00:00+07:00");
  sessions = [];
  deps = {
    members,
    now: () => clock,
    async signIn(email, password) {
      const ok = members.byEmail(email)?.password === password;
      if (ok) sessions.push(email);
      return ok;
    },
  };
});

const publicInput: RegisterInput = {
  memberType: "PUBLIC",
  fullName: "สมหญิง ใจดี",
  email: "somying@example.com",
  employeeId: "",
  affiliation: "",
  password: "secret123",
  confirmPassword: "secret123",
  consent: true,
};

const employeeInput: RegisterInput = {
  ...publicInput,
  memberType: "EMPLOYEE",
  fullName: "สมชาย ใจดี",
  email: "somchai@pea.co.th",
  employeeId: "123456",
  affiliation: "HQ",
};

describe("register (US-01)", () => {
  it("AS-01 creates a PUBLIC learner and signs them in (AU-09)", async () => {
    expect(await register(publicInput, deps)).toEqual({ ok: true });
    expect(members.byEmail("somying@example.com")).toMatchObject({
      memberType: "PUBLIC",
      role: "LEARNER",
      employeeId: null,
      affiliation: null,
      consentedAt: clock,
    });
    expect(sessions).toEqual(["somying@example.com"]);
  });

  it("AS-02 creates an EMPLOYEE with employee ID and affiliation", async () => {
    expect(await register(employeeInput, deps)).toEqual({ ok: true });
    expect(members.byEmail("somchai@pea.co.th")).toMatchObject({
      memberType: "EMPLOYEE",
      employeeId: "123456",
      affiliation: "HQ",
    });
  });

  it.each(["Somchai@PEA.co.th", "  somchai@pea.co.th  "])(
    "AS-04 %j is already taken",
    async (email) => {
      await register(employeeInput, deps);
      expect(await register({ ...publicInput, email }, deps)).toEqual({
        ok: false,
        errors: { email: "อีเมลนี้ถูกใช้แล้ว" },
      });
    },
  );

  it("AS-04 a different email is fine", async () => {
    await register(employeeInput, deps);
    expect(
      await register(
        { ...employeeInput, email: "somchai2@pea.co.th", employeeId: "222222" },
        deps,
      ),
    ).toEqual({ ok: true });
  });

  it("AS-06 employee ID already taken", async () => {
    await register({ ...employeeInput, employeeId: "654321" }, deps);
    expect(
      await register(
        { ...employeeInput, email: "other@pea.co.th", employeeId: "654321" },
        deps,
      ),
    ).toEqual({
      ok: false,
      errors: { employeeId: "รหัสพนักงานนี้ถูกใช้แล้ว" },
    });
  });

  it("AU-06 reports duplicates together with other field errors", async () => {
    await register(employeeInput, deps);
    const result = await register(
      { ...employeeInput, fullName: "ก", confirmPassword: "nope" },
      deps,
    );
    expect(result).toEqual({
      ok: false,
      errors: {
        fullName: "ชื่อ-นามสกุลต้องยาว 2–100 ตัวอักษร",
        email: "อีเมลนี้ถูกใช้แล้ว",
        employeeId: "รหัสพนักงานนี้ถูกใช้แล้ว",
        confirmPassword: "รหัสผ่านไม่ตรงกัน",
      },
    });
  });

  it("AS-08 a PUBLIC request with employee fields doesn't reserve the ID", async () => {
    await register(
      { ...publicInput, employeeId: "123456", affiliation: "HQ" },
      deps,
    );
    expect(members.byEmail("somying@example.com")?.employeeId).toBeNull();
    expect(await register(employeeInput, deps)).toEqual({ ok: true });
  });

  it("AS-10 doesn't create an account without consent", async () => {
    await register({ ...publicInput, consent: false }, deps);
    expect(members.rows).toEqual([]);
  });

  it("AS-11 concurrent sign-ups with one email create one account", async () => {
    const input = { ...publicInput, email: "new@example.com" };
    const results = await Promise.all([
      register(input, deps),
      register(input, deps),
    ]);
    expect(members.rows).toHaveLength(1);
    expect(results).toContainEqual({ ok: true });
    expect(results).toContainEqual({
      ok: false,
      errors: { email: "อีเมลนี้ถูกใช้แล้ว" },
    });
  });

  it("AS-12 a role sent with the request is ignored", async () => {
    await register({ ...publicInput, role: "ADMIN" } as RegisterInput, deps);
    expect(members.byEmail("somying@example.com")?.role).toBe("LEARNER");
  });
});

describe("login (US-02)", () => {
  beforeEach(async () => {
    await register(employeeInput, deps);
    sessions = [];
  });

  const at = (time: string) => {
    clock = new Date(`2026-10-27T${time}+07:00`);
  };
  const attempt = (password: string, email = "somchai@pea.co.th") =>
    login({ email, password }, deps);
  const failTimes = async (n: number) => {
    for (let i = 0; i < n; i++) await attempt("wrong-pass");
  };

  it.each([
    ["somchai@pea.co.th", "secret123", true],
    ["  SOMCHAI@pea.co.th ", "secret123", true],
    ["somchai@pea.co.th", "Secret123", false],
    ["nobody@pea.co.th", "secret123", false],
  ])("AS-13 %j / %j → ok: %s", async (email, password, ok) => {
    expect(await attempt(password, email)).toEqual(
      ok ? { ok: true } : { ok: false, error: "INVALID_CREDENTIALS" },
    );
  });

  it("AS-14 locks for 15 minutes after the 5th failure", async () => {
    const lockedUntil = new Date("2026-10-27T10:20:00+07:00");
    const locked = { ok: false, error: "ACCOUNT_LOCKED", lockedUntil };

    for (const time of ["10:00:00", "10:01:00", "10:02:00", "10:04:00"]) {
      at(time);
      expect(await attempt("wrong-pass")).toEqual({
        ok: false,
        error: "INVALID_CREDENTIALS",
      });
    }

    at("10:05:00");
    expect(await attempt("wrong-pass")).toEqual(locked);

    at("10:10:00");
    expect(await attempt("secret123")).toEqual(locked);

    at("10:15:00");
    expect(await attempt("wrong-pass")).toEqual(locked); // not extended

    at("10:19:59");
    expect(await attempt("secret123")).toEqual(locked);
    expect(sessions).toEqual([]);

    at("10:20:00");
    expect(await attempt("secret123")).toEqual({ ok: true });
    expect(sessions).toEqual(["somchai@pea.co.th"]);
  });

  it("AS-14 message shows the unlock time in Thai time", () => {
    expect(accountLockedMessage(new Date("2026-10-27T10:20:00+07:00"))).toBe(
      "บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่หลังเวลา 10:20 น.",
    );
    // Rounded up so the user never retries too early.
    expect(accountLockedMessage(new Date("2026-10-27T10:20:30+07:00"))).toBe(
      "บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่หลังเวลา 10:21 น.",
    );
  });

  it("AS-15 a success resets the count", async () => {
    await failTimes(4);
    expect(await attempt("secret123")).toEqual({ ok: true });
    await failTimes(3);
    expect(await attempt("wrong-pass")).toEqual({
      ok: false,
      error: "INVALID_CREDENTIALS",
    });
  });

  it("AS-15 the count restarts at 0 after a lock expires", async () => {
    await failTimes(5);
    at("10:20:00");
    expect(await attempt("wrong-pass")).toEqual({
      ok: false,
      error: "INVALID_CREDENTIALS",
    });
    expect(await members.getLockState("user-1")).toEqual({
      failedCount: 1,
      lockedUntil: null,
    });
  });

  it("AS-15 failures count with no time window", async () => {
    clock = new Date("2026-10-26T10:00:00+07:00"); // yesterday
    await failTimes(4);
    at("10:00:00");
    expect(await attempt("wrong-pass")).toMatchObject({
      error: "ACCOUNT_LOCKED",
    });
  });

  it("unknown emails aren't counted or locked", async () => {
    for (let i = 0; i < 6; i++) {
      expect(await attempt("x", "nobody@pea.co.th")).toEqual({
        ok: false,
        error: "INVALID_CREDENTIALS",
      });
    }
  });

  it("parallel wrong guesses can't slip past the limit", async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () => attempt("wrong-pass")),
    );
    expect(await members.getLockState("user-1")).toMatchObject({
      failedCount: 5,
    });
    expect(
      results.filter((r) => !r.ok && r.error === "ACCOUNT_LOCKED"),
    ).toHaveLength(4);
  });
});
