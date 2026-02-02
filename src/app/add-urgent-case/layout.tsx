import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แจ้งเคสช่วยเหลือสัตว์ด่วน | Petskub",
  description: "แจ้งเคสช่วยเหลือสัตว์จรบาดเจ็บ เจ็บป่วย หรือตกอยู่ในอันตราย ระบุตำแหน่งและข้อมูลติดต่อให้ทีมอาสาสมัครเดินทางถึงพื้นที่ได้เร็วขึ้น",
  keywords: ["แจ้งเคสด่วน", "ช่วยเหลือสัตว์", "สัตว์บาดเจ็บ", "อาสาสมัคร", "SOS"],
};

export default function AddUrgentCaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
