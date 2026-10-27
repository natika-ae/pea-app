// Account lockout for spec 003 (BR-06, AU-08).

export const MAX_LOGIN_FAILURES = 5;
export const LOCKOUT_MINUTES = 15;

export type LockState = {
  /** Consecutive failed logins, with no time window. */
  failedCount: number;
  /** Set when the 5th failure happens; cleared on the next state change. */
  lockedUntil: Date | null;
};

export const UNLOCKED: LockState = { failedCount: 0, lockedUntil: null };

/** The time the lock ends, or null if the account can log in at `now`. */
export function activeLock(state: LockState, now: Date): Date | null {
  return state.lockedUntil && state.lockedUntil > now
    ? state.lockedUntil
    : null;
}

/**
 * State after a wrong password. Only call when there's no active lock: a
 * locked account doesn't count attempts or extend the lock. Once a lock
 * has expired the count starts again from 0.
 */
export function afterFailure(state: LockState, now: Date): LockState {
  const previous = state.lockedUntil ? 0 : state.failedCount;
  const failedCount = previous + 1;
  return {
    failedCount,
    lockedUntil:
      failedCount >= MAX_LOGIN_FAILURES
        ? new Date(now.getTime() + LOCKOUT_MINUTES * 60_000)
        : null,
  };
}
