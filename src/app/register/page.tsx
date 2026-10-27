import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SwitchAuthLink } from "@/components/auth/next-param";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "สมัครสมาชิก | PEA Academy",
};

// Spec 003 §3.1. Signed-in users are redirected away by the proxy (AU-10).
export default function RegisterPage() {
  return (
    <AuthCard
      title="สมัครสมาชิก"
      description="สมัครครั้งเดียว ใช้ลงทะเบียนหลักสูตรได้ทุกหลักสูตรที่เปิดให้ประเภทผู้เรียนของคุณ"
      footer={
        <>
          มีบัญชีแล้ว?{" "}
          <SwitchAuthLink href="/login">เข้าสู่ระบบ</SwitchAuthLink>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
