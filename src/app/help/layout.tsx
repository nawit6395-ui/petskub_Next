import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ช่วยเหลือสัตว์ด่วน กรณีฉุกเฉิน | Petskub",
  description: "ช่วยเหลือสัตว์จรบาดเจ็บ เจ็บป่วย หรือตกอยู่ในอันตราย รายงานอุบัติเหตุและแจ้งพิกัดเพื่อระดมความช่วยเหลือจากอาสาสมัครในพื้นที่ ครอบคลุมกรุงเทพและทั่วประเทศ",
  keywords: ["ช่วยเหลือสัตว์", "สัตว์บาดเจ็บ", "กรณีฉุกเฉิน", "อาสาสมัคร", "ช่วยหมา", "ช่วยแมว", "สัตว์จรจัด"],
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
