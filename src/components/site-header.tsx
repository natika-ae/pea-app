import Link from "next/link";
import { NavLink } from "./nav-link";

const navItems = [
  { href: "/", label: "หน้าแรก" },
  { href: "#courses", label: "หลักสูตร" },
  { href: "#categories", label: "หมวดหมู่" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "#contact", label: "ติดต่อ" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-lg bg-amber-400 text-xl font-bold text-purple-900">
        ⚡
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold">PEA Academy</span>
        <span className="block text-xs opacity-80">
          ศูนย์ฝึกอบรม การไฟฟ้าส่วนภูมิภาค
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-purple-900 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="text-sm font-medium opacity-90 transition hover:text-amber-300 hover:opacity-100 aria-[current=page]:text-amber-300 aria-[current=page]:opacity-100"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="#"
            className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="#"
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-purple-900 transition hover:bg-amber-300"
          >
            สมัครสมาชิก
          </Link>
        </div>

        {/* Mobile menu without client JS */}
        <details className="group relative md:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-white/10 [&::-webkit-details-marker]:hidden">
            <span className="sr-only">เมนู</span>
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <nav className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 text-zinc-800 shadow-xl">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-purple-50 aria-[current=page]:bg-purple-50 aria-[current=page]:font-semibold aria-[current=page]:text-purple-900"
              >
                {item.label}
              </NavLink>
            ))}
            <hr className="my-2 border-zinc-200" />
            <Link
              href="#"
              className="block rounded-lg bg-purple-900 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              เข้าสู่ระบบ
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
