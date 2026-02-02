import ProfilePageClient from "./ProfilePageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "โปรไฟล์ของฉัน | Petskub",
    description: "จัดการโปรไฟล์ ดูประกาศสัตว์เลี้ยงของคุณ และติดตามการรับเลี้ยงบน Petskub",
    robots: { index: false, follow: false },
};

export default function ProfilePage() {
    return <ProfilePageClient />;
}
