"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { nextQuery, safeNextPath } from "@/lib/auth/paths";

// ?next= is read on the client, behind its own <Suspense>, so the rest of
// the form stays in the static shell.

function HiddenNext() {
  const next = useSearchParams().get("next");
  return <input type="hidden" name="next" value={safeNextPath(next)} />;
}

/** Hidden input that carries ?next= into the form action (BR-07). */
export function NextInput() {
  return (
    <Suspense fallback={<input type="hidden" name="next" value="/" />}>
      <HiddenNext />
    </Suspense>
  );
}

type SwitchProps = { href: "/login" | "/register"; children: React.ReactNode };

function SwitchLink({ href, next, children }: SwitchProps & { next: unknown }) {
  return (
    <Link
      href={`${href}${nextQuery(next)}`}
      className="font-semibold text-purple-800 underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}

function SwitchLinkWithNext(props: SwitchProps) {
  return <SwitchLink {...props} next={useSearchParams().get("next")} />;
}

/** Link to the other auth page that keeps ?next= (spec 003 §3). */
export function SwitchAuthLink(props: SwitchProps) {
  return (
    <Suspense fallback={<SwitchLink {...props} next={null} />}>
      <SwitchLinkWithNext {...props} />
    </Suspense>
  );
}
