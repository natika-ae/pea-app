import Link from "next/link";
import { Logo } from "./site-header";

const footerLinks = [
  {
    title: "หลักสูตร",
    links: ["หลักสูตรทั้งหมด", "หลักสูตรใหม่", "หลักสูตรยอดนิยม", "ตารางอบรม"],
  },
  {
    title: "บริการ",
    links: ["ตรวจสอบใบประกาศ", "คำถามที่พบบ่อย", "คู่มือการใช้งาน", "แจ้งปัญหา"],
  },
  {
    title: "เกี่ยวกับ",
    links: ["เกี่ยวกับศูนย์ฝึกอบรม", "ทีมวิทยากร", "ข่าวประชาสัมพันธ์", "นโยบายความเป็นส่วนตัว"],
  },
];

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-zinc-900 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="text-white lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
            ศูนย์พัฒนาบุคลากรด้านระบบไฟฟ้า มุ่งยกระดับทักษะพนักงานและผู้สนใจ
            ด้วยหลักสูตรมาตรฐาน ทั้งรูปแบบออนไลน์และห้องเรียน
          </p>
          <ul className="mt-4 space-y-1 text-sm text-zinc-400">
            <li>📍 200 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900</li>
            <li>📞 1129 PEA Call Center</li>
            <li>✉️ academy@pea.co.th</li>
          </ul>
        </div>

        {footerLinks.map((group) => (
          <div key={group.title}>
            <h3 className="font-semibold text-white">{group.title}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {group.links.map((label) => (
                <li key={label}>
                  <Link href="#" className="transition hover:text-amber-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-zinc-400 sm:flex-row sm:px-6">
          <p>© 2569 การไฟฟ้าส่วนภูมิภาค (PEA) สงวนลิขสิทธิ์</p>
          <p>เว็บไซต์ตัวอย่าง — ข้อมูลทั้งหมดเป็นข้อมูลจำลอง</p>
        </div>
      </div>
    </footer>
  );
}
