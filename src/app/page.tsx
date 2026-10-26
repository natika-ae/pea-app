import Link from "next/link";
import {
  getCategories,
  getLatestCourses,
  getStats,
  type Course,
} from "@/lib/courses";

const numberFormat = new Intl.NumberFormat("th-TH");
const dateFormat = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const levelStyles: Record<Course["level"], string> = {
  พื้นฐาน: "bg-emerald-100 text-emerald-700",
  กลาง: "bg-sky-100 text-sky-700",
  ขั้นสูง: "bg-rose-100 text-rose-700",
};

// Card cover gradients, picked by course index so cards look varied.
const coverStyles = [
  "from-purple-700 to-purple-900",
  "from-amber-400 to-orange-500",
  "from-indigo-600 to-purple-800",
  "from-fuchsia-600 to-purple-800",
  "from-orange-400 to-rose-500",
  "from-violet-500 to-indigo-700",
];

export default async function Home() {
  const [stats, courses, categories] = await Promise.all([
    getStats(),
    getLatestCourses(),
    getCategories(),
  ]);

  const statItems = [
    { label: "ผู้เรียนทั้งหมด", value: stats.totalLearners, unit: "คน" },
    { label: "หลักสูตร", value: stats.totalCourses, unit: "หลักสูตร" },
    { label: "ใบประกาศที่ออกแล้ว", value: stats.certificatesIssued, unit: "ใบ" },
    { label: "ชั่วโมงการอบรม", value: stats.trainingHours, unit: "ชม." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-white/20">
              ⚡ เปิดรับสมัครหลักสูตรใหม่ ประจำปี 2569
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
              พัฒนาทักษะด้านไฟฟ้า
              <br />
              <span className="text-amber-400">กับ PEA Academy</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-purple-100">
              แหล่งเรียนรู้และฝึกอบรมของการไฟฟ้าส่วนภูมิภาค
              ครอบคลุมตั้งแต่ความปลอดภัยในการปฏิบัติงาน ระบบจำหน่าย
              ไปจนถึงพลังงานทดแทนและเทคโนโลยี Smart Grid
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="#courses"
                className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-purple-900 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300"
              >
                ดูหลักสูตรทั้งหมด
              </Link>
              <Link
                href="#about"
                className="rounded-full px-6 py-3 font-semibold ring-1 ring-white/40 transition hover:bg-white/10"
              >
                เกี่ยวกับเรา
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur"
              >
                <p className="text-3xl font-bold text-amber-400 sm:text-4xl">
                  {numberFormat.format(item.value)}
                </p>
                <p className="mt-1 text-sm text-purple-100">
                  {item.label} ({item.unit})
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest courses */}
      <section id="courses" className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-purple-700">
                หลักสูตรล่าสุด
              </p>
              <h2 className="mt-1 text-3xl font-bold text-zinc-900">
                หลักสูตรอบรมที่เปิดใหม่
              </h2>
            </div>
            <Link
              href="#"
              className="text-sm font-semibold text-purple-700 hover:text-purple-900"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                cover={coverStyles[i % coverStyles.length]}
                isNew={i < 2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-purple-700">หมวดหมู่</p>
            <h2 className="mt-1 text-3xl font-bold text-zinc-900">
              เลือกเรียนตามความสนใจ
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="#"
                className="group rounded-2xl border border-zinc-200 p-6 text-center transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg"
              >
                <span className="text-4xl">{cat.icon}</span>
                <p className="mt-3 font-semibold text-zinc-800 group-hover:text-purple-800">
                  {cat.name}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {cat.courseCount} หลักสูตร
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="bg-zinc-50 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 p-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-purple-950 sm:text-3xl">
                พร้อมเริ่มเรียนแล้วหรือยัง?
              </h2>
              <p className="mt-2 max-w-xl text-purple-900">
                สมัครสมาชิกฟรี เรียนได้ทุกที่ทุกเวลา
                พร้อมรับใบประกาศนียบัตรเมื่อผ่านการอบรม
              </p>
            </div>
            <Link
              href="#"
              className="shrink-0 rounded-full bg-purple-900 px-8 py-3 font-semibold text-white transition hover:bg-purple-800"
            >
              สมัครเรียนเลย
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CourseCard({
  course,
  cover,
  isNew,
}: {
  course: Course;
  cover: string;
  isNew: boolean;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`relative flex h-36 items-end bg-gradient-to-br p-5 ${cover}`}
      >
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-800">
          {course.category}
        </span>
        {isNew && (
          <span className="absolute right-4 top-4 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white">
            ใหม่
          </span>
        )}
        <span className="absolute bottom-3 right-4 text-5xl opacity-30">
          ⚡
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`rounded-md px-2 py-0.5 font-medium ${levelStyles[course.level]}`}
          >
            {course.level}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-600">
            {course.format}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-zinc-900 group-hover:text-purple-800">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">{course.instructor}</p>

        <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 text-sm text-zinc-600">
          <span title="จำนวนผู้เรียน">
            👥 {numberFormat.format(course.learners)} คน
          </span>
          <span>⏱ {course.hours} ชม.</span>
          <span className="text-amber-500">★ {course.rating}</span>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          เปิดเมื่อ {dateFormat.format(new Date(course.publishedAt))}
        </p>
      </div>
    </article>
  );
}
