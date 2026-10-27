// Register and log in (spec 003 US-01, US-02). Storage and sign-in are
// injected so the rules can be unit tested without Supabase.

import {
  activeLock,
  afterFailure,
  MAX_LOGIN_FAILURES,
  type LockState,
} from "./lockout";
import {
  normalizeEmail,
  validateRegistration,
  type FieldErrors,
  type NewMember,
  type RegisterInput,
} from "./validation";
import { messages } from "./messages";

export type CreateMemberResult =
  | { ok: true }
  | { ok: false; error: "EMAIL_TAKEN" | "EMPLOYEE_ID_TAKEN" | "EMAIL_INVALID" };

export interface MemberRepository {
  isEmailTaken(email: string): Promise<boolean>;
  isEmployeeIdTaken(employeeId: string): Promise<boolean>;
  /**
   * Creates the account with the LEARNER role. Must be atomic with respect to
   * email and employee ID, so concurrent duplicates get a conflict (AU-05).
   */
  createMember(
    member: NewMember,
    consentedAt: Date,
  ): Promise<CreateMemberResult>;
  findLockStateByEmail(
    email: string,
  ): Promise<{ userId: string; lock: LockState } | null>;
  getLockState(userId: string): Promise<LockState>;
  /**
   * Saves `next` only if the stored failed count still equals
   * `expectedFailedCount`. Returns false if another request got there first.
   */
  updateLockState(
    userId: string,
    expectedFailedCount: number | null,
    next: LockState,
  ): Promise<boolean>;
}

export type AuthDeps = {
  members: MemberRepository;
  /** Starts a session. Resolves false for a wrong email or password. */
  signIn(email: string, password: string): Promise<boolean>;
  now(): Date;
};

export type RegisterResult = { ok: true } | { ok: false; errors: FieldErrors };

export async function register(
  input: RegisterInput,
  { members, signIn, now }: AuthDeps,
): Promise<RegisterResult> {
  const { member, errors } = validateRegistration(input);

  // Duplicate checks only run on fields whose format is valid (AU-06).
  const [emailTaken, employeeIdTaken] = await Promise.all([
    errors.email ? false : members.isEmailTaken(member.email),
    member.employeeId && !errors.employeeId
      ? members.isEmployeeIdTaken(member.employeeId)
      : false,
  ]);
  if (emailTaken) errors.email = messages.EMAIL_TAKEN;
  if (employeeIdTaken) errors.employeeId = messages.EMPLOYEE_ID_TAKEN;
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // The checks above can race with another request; createMember is the
  // final word (AU-05).
  const created = await members.createMember(member, now());
  if (!created.ok) {
    const conflict: FieldErrors =
      created.error === "EMPLOYEE_ID_TAKEN"
        ? { employeeId: messages.EMPLOYEE_ID_TAKEN }
        : created.error === "EMAIL_TAKEN"
          ? { email: messages.EMAIL_TAKEN }
          : { email: messages.email };
    return { ok: false, errors: conflict };
  }

  // Sign the new member in straight away (AU-09).
  if (!(await signIn(member.email, member.password))) {
    throw new Error("Sign-in failed right after registration");
  }
  return { ok: true };
}

export type LoginResult =
  | { ok: true }
  | { ok: false; error: "INVALID_CREDENTIALS" }
  | { ok: false; error: "ACCOUNT_LOCKED"; lockedUntil: Date };

const invalidCredentials = { ok: false, error: "INVALID_CREDENTIALS" } as const;

export async function login(
  { email: rawEmail, password }: { email: string; password: string },
  { members, signIn, now }: AuthDeps,
): Promise<LoginResult> {
  const email = normalizeEmail(rawEmail);
  if (!email || !password) return invalidCredentials;

  // Unknown emails get the same answer as a wrong password and aren't
  // counted, since there is no account to lock (AU-07).
  const account = await members.findLockStateByEmail(email);
  if (!account) return invalidCredentials;

  // While locked, the password isn't checked at all (AU-08).
  const locked = activeLock(account.lock, now());
  if (locked)
    return { ok: false, error: "ACCOUNT_LOCKED", lockedUntil: locked };

  if (await signIn(email, password)) {
    if (account.lock.failedCount > 0 || account.lock.lockedUntil) {
      await members.updateLockState(account.userId, null, {
        failedCount: 0,
        lockedUntil: null,
      });
    }
    return { ok: true };
  }

  const lockedUntil = await recordFailure(
    members,
    account.userId,
    account.lock,
    now(),
  );
  return lockedUntil
    ? { ok: false, error: "ACCOUNT_LOCKED", lockedUntil }
    : invalidCredentials;
}

/**
 * Counts one failure with compare-and-set, so parallel wrong guesses can't
 * slip past the limit. Returns the lock end if the account is now locked.
 */
async function recordFailure(
  members: MemberRepository,
  userId: string,
  initial: LockState,
  now: Date,
): Promise<Date | null> {
  let state = initial;
  // Each lost race means another failure was counted, so after at most
  // MAX_LOGIN_FAILURES losses the account is locked and the loop returns.
  for (let attempt = 0; attempt <= MAX_LOGIN_FAILURES; attempt++) {
    // Another request may have locked the account in the meantime.
    const locked = activeLock(state, now);
    if (locked) return locked;

    const next = afterFailure(state, now);
    if (await members.updateLockState(userId, state.failedCount, next)) {
      return next.lockedUntil;
    }
    state = await members.getLockState(userId);
  }
  throw new Error("Could not record failed login");
}
