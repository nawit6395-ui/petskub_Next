import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ฟอรั่มพูดคุยคนรักสัตว์ แลกเปลี่ยนประสบการณ์ | Petskub",
  description: "ฟอรั่มชุมชนคนรักสัตว์ แลกเปลี่ยนความรู้เรื่องการรับเลี้ยงสุนัข รับเลี้ยงแมว สุขภาพสัตว์ พฤติกรรม อาหารและโภชนาการ พูดคุยกับผู้เลี้ยงสัตว์ทั่วประเทศ",
  keywords: ["ฟอรั่มสัตว์เลี้ยง", "ชุมชนคนรักสัตว์", "รับเลี้ยงสุนัข", "รับเลี้ยงแมว", "สุขภาพสัตว์", "อาหารสัตว์เลี้ยง", "พฤติกรรมสัตว์"],
};

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
