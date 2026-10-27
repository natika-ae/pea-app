"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Marks the link for the current page with aria-current="page" (spec 002 AS-08).
export function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}
