import "server-only";
import { createAdminClient, createSessionClient } from "@/lib/supabase/server";
import type { LockState } from "./lockout";
import type { AuthDeps, CreateMemberResult, MemberRepository } from "./service";
import type { NewMember } from "./validation";

// Supabase implementation of the spec 003 auth dependencies. Error objects
// are rethrown as-is; Supabase never echoes the password back (AU-03).

const LEARNER_ROLE = "LEARNER";

type LockRow = {
  id: string;
  failed_login_count: number;
  locked_until: string | null;
};

function toLockState(row: LockRow): LockState {
  return {
    failedCount: row.failed_login_count,
    lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
  };
}

function supabaseMembers(): MemberRepository {
  const db = createAdminClient();

  async function exists(column: "email" | "employee_id", value: string) {
    const { count, error } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq(column, value);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  return {
    isEmailTaken: (email) => exists("email", email),
    isEmployeeIdTaken: (employeeId) => exists("employee_id", employeeId),

    async createMember(
      member: NewMember,
      consentedAt: Date,
    ): Promise<CreateMemberResult> {
      // The role goes in app_metadata, which users can't edit (AU-04).
      const { data, error } = await db.auth.admin.createUser({
        email: member.email,
        password: member.password,
        email_confirm: true,
        app_metadata: { role: LEARNER_ROLE },
        user_metadata: { full_name: member.fullName },
      });
      if (error) {
        if (
          error.code === "email_exists" ||
          error.code === "user_already_exists"
        ) {
          return { ok: false, error: "EMAIL_TAKEN" };
        }
        if (error.code === "email_address_invalid") {
          return { ok: false, error: "EMAIL_INVALID" };
        }
        throw error;
      }

      const { error: insertError } = await db.from("profiles").insert({
        id: data.user.id,
        member_type: member.memberType,
        full_name: member.fullName,
        email: member.email,
        employee_id: member.employeeId,
        affiliation: member.affiliation,
        consented_at: consentedAt.toISOString(),
      });
      if (insertError) {
        // Undo the auth user so the email can be used again.
        const { error: deleteError } = await db.auth.admin.deleteUser(
          data.user.id,
        );
        if (deleteError) throw deleteError;

        // 23505 = unique_violation. Auth already guarantees unique emails,
        // so on this path it is the employee ID (AU-05).
        if (insertError.code === "23505") {
          const onEmail =
            `${insertError.message} ${insertError.details}`.includes("email");
          return {
            ok: false,
            error: onEmail ? "EMAIL_TAKEN" : "EMPLOYEE_ID_TAKEN",
          };
        }
        throw insertError;
      }
      return { ok: true };
    },

    async findLockStateByEmail(email) {
      const { data, error } = await db
        .from("profiles")
        .select("id, failed_login_count, locked_until")
        .eq("email", email)
        .maybeSingle<LockRow>();
      if (error) throw error;
      return data ? { userId: data.id, lock: toLockState(data) } : null;
    },

    async getLockState(userId) {
      const { data, error } = await db
        .from("profiles")
        .select("id, failed_login_count, locked_until")
        .eq("id", userId)
        .single<LockRow>();
      if (error) throw error;
      return toLockState(data);
    },

    async updateLockState(userId, expectedFailedCount, next) {
      let query = db
        .from("profiles")
        .update({
          failed_login_count: next.failedCount,
          locked_until: next.lockedUntil?.toISOString() ?? null,
        })
        .eq("id", userId);
      if (expectedFailedCount !== null) {
        query = query.eq("failed_login_count", expectedFailedCount);
      }
      const { data, error } = await query.select("id");
      if (error) throw error;
      return data.length > 0;
    },
  };
}

export async function authDeps(): Promise<AuthDeps> {
  const session = await createSessionClient();
  return {
    members: supabaseMembers(),
    now: () => new Date(),
    async signIn(email, password) {
      const { error } = await session.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) return true;
      if (error.code === "invalid_credentials") return false;
      throw error;
    },
  };
}
