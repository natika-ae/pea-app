import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SwitchAuthLink } from "@/components/auth/next-param";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | PEA Academy",
};

// Spec 003 §3.2. Signed-in users are redirected away by the proxy (AU-10).
export default function LoginPage() {
  return (
    <AuthCard
      title="เข้าสู่ระบบ"
      description="เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ใช้สมัครสมาชิก"
      footer={
        <>
          ยังไม่มีบัญชี?{" "}
          <SwitchAuthLink href="/register">สมัครสมาชิก</SwitchAuthLink>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
