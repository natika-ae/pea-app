// Shared pieces for the login and register forms (spec 003).

export const inputClass =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm transition focus:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200 aria-[invalid=true]:border-rose-600";

export const labelClass = "mb-1.5 block text-sm font-medium text-zinc-800";

export function errorId(field: string) {
  return `${field}-error`;
}

/** Props that tie an input to its error message (AS-20). */
export function errorProps(field: string, error: string | undefined) {
  return error
    ? { "aria-invalid": true, "aria-describedby": errorId(field) }
    : {};
}

export function FieldError({
  field,
  error,
}: {
  field: string;
  error?: string;
}) {
  if (!error) return null;
  return (
    <p id={errorId(field)} className="mt-1.5 text-sm text-rose-700">
      {error}
    </p>
  );
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200"
    >
      {message}
    </p>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-purple-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-800 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "กำลังดำเนินการ…" : children}
    </button>
  );
}
