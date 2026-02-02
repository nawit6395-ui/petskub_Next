import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "บทความความรู้รับเลี้ยงสุนัข รับเลี้ยงแมว | Petskub",
  description: "บทความและคู่มือสำหรับมือใหม่ที่ต้องการรับเลี้ยงสุนัขและรับเลี้ยงแมว เรียนรู้เรื่องการดูแล สุขภาพ โภชนาการ และพฤติกรรมสัตว์เลี้ยงก่อนตัดสินใจหาบ้านให้หมาหรือแมว",
  keywords: ["รับเลี้ยงสุนัข", "รับเลี้ยงแมว", "วิธีเลี้ยงแมว", "วิธีเลี้ยงหมา", "การดูแลสัตว์เลี้ยง", "หมาหาบ้าน", "แมวหาบ้าน", "ความรู้สัตว์เลี้ยง"],
};

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
