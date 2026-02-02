import AuthPage from "@/components/AuthPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "เข้าสู่ระบบ | Petskub",
    description: "เข้าสู่ระบบ Petskub เพื่อลงประกาศหาบ้านให้สัตว์เลี้ยงฟรี แจ้งพิกัดสัตว์จร และร่วมชุมชนคนรักสัตว์ทั่วประเทศ",
    robots: { index: false, follow: true },
};

export default function LoginPage() {
    return <AuthPage />;
}
