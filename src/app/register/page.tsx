import AuthPage from "@/components/AuthPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "สมัครสมาชิกฟรี | Petskub",
    description: "สมัครสมาชิก Petskub ฟรี เพื่อร่วมลงประกาศหาบ้านให้หมาหาบ้าน แมวหาบ้าน แจ้งพิกัดสัตว์จร และเข้าร่วมชุมชนคนรักสัตว์",
    robots: { index: false, follow: true },
};

export default function RegisterPage() {
    return <AuthPage />;
}
