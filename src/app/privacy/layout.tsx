import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายคุกกี้และความเป็นส่วนตัว | Petskub",
  description: "นโยบายคุกกี้และความเป็นส่วนตัวของ Petskub เว็บไซต์สื่อกลางหมาหาบ้าน แมวหาบ้าน เราเคารพความเป็นส่วนตัวของผู้ใช้งานทุกท่าน",
  keywords: ["นโยบายความเป็นส่วนตัว", "คุกกี้", "ความปลอดภัย", "Petskub"],
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
