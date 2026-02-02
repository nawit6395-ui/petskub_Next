import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ลงประกาศหาบ้านให้สัตว์เลี้ยง | Petskub",
  description: "ลงประกาศหาบ้านให้ลูกสุนัขหรือลูกแมวฟรี ไม่มีค่าใช้จ่าย หากคุณพบเจอสัตว์จรจัด หรือต้องการหาบ้านให้หมาหาบ้านหรือแมวหาบ้าน สามารถลงประกาศได้ทันที ช่วยให้พวกเขาเจอเจ้าของใหม่ได้ไวขึ้น",
  keywords: ["ลงประกาศหาบ้าน", "หาบ้านให้หมา", "หาบ้านให้แมว", "หาบ้านให้ลูกสุนัข", "หาบ้านให้ลูกแมว", "แจกฟรี", "สัตว์จรจัด"],
};

export default function AddCatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
