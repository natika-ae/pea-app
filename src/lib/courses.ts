import { cacheLife } from "next/cache";

// Fake data for now. Replace the bodies of the get* functions with real
// database/API calls later; the page code doesn't need to change.

export type CourseLevel = "พื้นฐาน" | "กลาง" | "ขั้นสูง";

export type Course = {
  id: string;
  title: string;
  category: string;
  level: CourseLevel;
  instructor: string;
  hours: number;
  learners: number;
  rating: number;
  publishedAt: string; // ISO date
  format: "ออนไลน์" | "ห้องเรียน" | "ผสมผสาน";
};

export type Stats = {
  totalLearners: number;
  totalCourses: number;
  certificatesIssued: number;
  trainingHours: number;
};

export type Category = {
  name: string;
  courseCount: number;
  icon: string;
};

const courses: Course[] = [
  {
    id: "pea-ehv-101",
    title: "ความปลอดภัยในการปฏิบัติงานระบบไฟฟ้าแรงสูง",
    category: "ความปลอดภัย",
    level: "พื้นฐาน",
    instructor: "วิศวกรสมชาย ใจดี",
    hours: 12,
    learners: 3842,
    rating: 4.8,
    publishedAt: "2026-10-20",
    format: "ผสมผสาน",
  },
  {
    id: "pea-smart-grid",
    title: "Smart Grid และระบบมิเตอร์อัจฉริยะ (AMI)",
    category: "เทคโนโลยีระบบไฟฟ้า",
    level: "กลาง",
    instructor: "ดร.วรรณา ศรีสุข",
    hours: 18,
    learners: 2156,
    rating: 4.7,
    publishedAt: "2026-10-15",
    format: "ออนไลน์",
  },
  {
    id: "pea-solar-rooftop",
    title: "การติดตั้งและตรวจสอบ Solar Rooftop เชื่อมต่อระบบจำหน่าย",
    category: "พลังงานทดแทน",
    level: "กลาง",
    instructor: "วิศวกรประเสริฐ แสงทอง",
    hours: 24,
    learners: 4521,
    rating: 4.9,
    publishedAt: "2026-10-08",
    format: "ห้องเรียน",
  },
  {
    id: "pea-ev-charger",
    title: "ระบบสถานีอัดประจุยานยนต์ไฟฟ้า (EV Charger)",
    category: "พลังงานทดแทน",
    level: "ขั้นสูง",
    instructor: "ดร.ธนากร มั่นคง",
    hours: 16,
    learners: 1874,
    rating: 4.6,
    publishedAt: "2026-09-29",
    format: "ผสมผสาน",
  },
  {
    id: "pea-maintenance",
    title: "การบำรุงรักษาหม้อแปลงไฟฟ้าระบบจำหน่าย",
    category: "ระบบจำหน่าย",
    level: "กลาง",
    instructor: "วิศวกรอรุณ พรหมมา",
    hours: 20,
    learners: 2963,
    rating: 4.7,
    publishedAt: "2026-09-21",
    format: "ห้องเรียน",
  },
  {
    id: "pea-service-mind",
    title: "การให้บริการลูกค้าด้วยใจ (Service Mind) สำหรับพนักงาน กฟภ.",
    category: "การบริการ",
    level: "พื้นฐาน",
    instructor: "คุณพิมพ์ชนก รุ่งเรือง",
    hours: 6,
    learners: 6210,
    rating: 4.5,
    publishedAt: "2026-09-12",
    format: "ออนไลน์",
  },
];

const categories: Category[] = [
  { name: "ความปลอดภัย", courseCount: 18, icon: "🦺" },
  { name: "ระบบจำหน่าย", courseCount: 32, icon: "🔌" },
  { name: "พลังงานทดแทน", courseCount: 14, icon: "☀️" },
  { name: "เทคโนโลยีระบบไฟฟ้า", courseCount: 21, icon: "📡" },
  { name: "การบริการ", courseCount: 9, icon: "🤝" },
  { name: "การบริหารจัดการ", courseCount: 12, icon: "📊" },
];

export async function getLatestCourses(limit = 6): Promise<Course[]> {
  "use cache";
  cacheLife("hours");
  return [...courses]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export async function getStats(): Promise<Stats> {
  "use cache";
  cacheLife("hours");
  return {
    totalLearners: 48_562,
    totalCourses: 106,
    certificatesIssued: 31_247,
    trainingHours: 215_890,
  };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  return categories;
}
