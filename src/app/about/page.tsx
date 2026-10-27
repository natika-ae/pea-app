import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { aboutContent } from "@/content/about";
import {
  assertValidAboutContent,
  formatCount,
  formatPhone,
  formatThaiDate,
  yearsInOperation,
} from "@/lib/about";

// Throws at build time if the content file is malformed (AB-05).
const about = assertValidAboutContent(aboutContent);

export const metadata: Metadata = {
  title: `เกี่ยวกับเรา | ${about.shortName}`,
  description: about.tagline,
};

// Computed when the page is built and refreshed daily, so the count
// catches up within a day of the new year (spec 002, Decisions).
async function getYearsInOperation() {
  "use cache";
  cacheLife("days");
  return yearsInOperation(about.foundedYear, new Date());
}

export default async function AboutPage() {
  const years = await getYearsInOperation();
  const { stats, contact } = about;

  const statItems = [
    { label: "ปีที่ดำเนินงาน", value: years, unit: "ปี" },
    { label: "หลักสูตร", value: stats.courses, unit: "หลักสูตร" },
    { label: "ผู้เรียน", value: stats.learners, unit: "คน" },
    { label: "ใบประกาศที่ออก", value: stats.certificates, unit: "ใบ" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-sm font-semibold text-amber-300">เกี่ยวกับเรา</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
            {about.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-purple-100">
            {about.tagline}
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-block rounded-full bg-amber-400 px-6 py-3 font-semibold text-purple-900 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300"
          >
            ดูหลักสูตรทั้งหมด
          </Link>
        </div>
      </section>

      {/* Mission and vision */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-zinc-900">
            พันธกิจและวิสัยทัศน์
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl bg-purple-900 p-8 text-white">
              <h3 className="text-sm font-semibold text-amber-300">วิสัยทัศน์</h3>
              <p className="mt-3 text-xl font-semibold leading-relaxed">
                {about.vision}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-700">พันธกิจ</h3>
              <ol className="mt-3 space-y-3">
                {about.missions.map((mission, i) => (
                  <li key={mission} className="flex gap-3 text-zinc-700">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-purple-900">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{mission}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-zinc-900">
            สิ่งที่ผู้เรียนได้รับ
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {about.benefits.map((benefit) => (
              <li
                key={benefit.title}
                data-testid="benefit-card"
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
              >
                <h3 className="text-lg font-semibold text-zinc-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {benefit.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-zinc-900">ผลการดำเนินงาน</h2>
          <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="flex flex-col-reverse rounded-2xl bg-purple-50 p-6"
              >
                <dt className="mt-1 text-sm text-zinc-600">{item.label}</dt>
                <dd className="text-2xl font-bold text-purple-900 sm:text-4xl">
                  {formatCount(item.value)}{" "}
                  <span className="text-base font-medium text-zinc-600">
                    {item.unit}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-zinc-500">
            ข้อมูล ณ {formatThaiDate(stats.asOf)}
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-zinc-900">ติดต่อเรา</h2>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-purple-700">ที่อยู่</dt>
              <dd className="mt-1 text-zinc-700">{contact.address}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-purple-700">
                เวลาทำการ
              </dt>
              <dd className="mt-1 text-zinc-700">{contact.hours}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-purple-700">โทรศัพท์</dt>
              <dd className="mt-1">
                <a
                  href={`tel:${contact.phone}`}
                  className="font-medium text-purple-800 underline-offset-4 hover:underline"
                >
                  {formatPhone(contact.phone)}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-purple-700">อีเมล</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all font-medium text-purple-800 underline-offset-4 hover:underline"
                >
                  {contact.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
