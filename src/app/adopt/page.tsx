import type { Metadata } from "next";
import AdoptPageClient from "./AdoptPageClient";

export const metadata: Metadata = {
  title: "หมาหาบ้าน แมวหาบ้าน รับเลี้ยงสุนัข รับเลี้ยงแมว | Petskub",
  description: "รวมประกาศสุนัขหาบ้านและแมวหาบ้าน ค้นหารับเลี้ยงสุนัข รับเลี้ยงแมวใกล้บ้านคุณ พบกับลูกสุนัขแจกฟรี ลูกแมวหาบ้านหลากหลายสายพันธุ์ กรองตามจังหวัดและความเร่งด่วน",
  keywords: ["หมาหาบ้าน", "แมวหาบ้าน", "รับเลี้ยงสุนัข", "รับเลี้ยงแมว", "ลูกสุนัขแจกฟรี", "ลูกแมวหาบ้าน", "สุนัขหาบ้าน"],
};

const AdoptPage = () => {
  return <AdoptPageClient />;
};

export default AdoptPage;
