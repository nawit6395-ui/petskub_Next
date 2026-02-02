import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เรื่องราวความสำเร็จ สัตว์เลี้ยงที่ได้บ้านใหม่ | Petskub",
  description: "เรื่องราวความสำเร็จของน้องหมาน้องแมวที่ได้บ้านใหม่แล้ว ขอบคุณทุกท่านที่ให้โอกาสกับสัตว์จรจัด รับเลี้ยงสุนัขและรับเลี้ยงแมวจาก Petskub",
  keywords: ["เรื่องราวความสำเร็จ", "สัตว์ได้บ้าน", "รับเลี้ยงสำเร็จ", "หมาได้บ้าน", "แมวได้บ้าน", "Happy Ending"],
};

export default function SuccessStoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
