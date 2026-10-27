import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";

// Login/register or user name/logout in the main menu (spec 003 AS-19).
// Reads the session, so render it inside <Suspense>.

const styles = {
  desktop: {
    wrapper: "flex items-center gap-3",
    name: "max-w-48 truncate text-sm font-medium",
    login:
      "rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/10",
    register:
      "rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-purple-900 transition hover:bg-amber-300",
    logout:
      "rounded-full px-4 py-2 text-sm font-medium ring-1 ring-white/40 transition hover:bg-white/10",
  },
  mobile: {
    wrapper: "space-y-2",
    name: "truncate px-3 py-1 text-sm font-semibold text-purple-900",
    login:
      "block rounded-lg bg-purple-900 px-3 py-2 text-center text-sm font-semibold text-white",
    register:
      "block rounded-lg bg-amber-400 px-3 py-2 text-center text-sm font-semibold text-purple-900",
    logout:
      "block w-full rounded-lg px-3 py-2 text-center text-sm font-semibold text-purple-900 ring-1 ring-purple-200 hover:bg-purple-50",
  },
};

export async function AuthMenu({ variant }: { variant: keyof typeof styles }) {
  const user = await getCurrentUser();
  const s = styles[variant];

  if (!user) {
    return (
      <div className={s.wrapper}>
        <Link href="/login" className={s.login}>
          เข้าสู่ระบบ
        </Link>
        <Link href="/register" className={s.register}>
          สมัครสมาชิก
        </Link>
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
      <p className={s.name} title={user.name}>
        <span className="sr-only">ผู้ใช้: </span>
        {user.name}
      </p>
      <form action={logoutAction}>
        <button type="submit" className={s.logout}>
          ออกจากระบบ
        </button>
      </form>
    </div>
  );
}
