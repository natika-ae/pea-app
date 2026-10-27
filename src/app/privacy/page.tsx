import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายคุ้มครองข้อมูลส่วนบุคคล | PEA Academy",
};

// Placeholder: the policy text is still an open question in spec 003 §7.
export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-purple-900">
        นโยบายคุ้มครองข้อมูลส่วนบุคคล
      </h1>
      <p className="mt-6 leading-relaxed text-zinc-700">
        เนื้อหานโยบายอยู่ระหว่างจัดทำโดยศูนย์ฝึกอบรม การไฟฟ้าส่วนภูมิภาค
      </p>
    </section>
  );
}
