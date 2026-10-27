// Page frame shared by /login and /register.
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <section className="bg-zinc-50 px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:p-10">
        <h1 className="text-2xl font-bold text-purple-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {description}
        </p>
        <div className="mt-8">{children}</div>
        <p className="mt-8 text-center text-sm text-zinc-700">{footer}</p>
      </div>
    </section>
  );
}
