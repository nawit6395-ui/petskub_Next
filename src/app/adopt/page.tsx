import type { Metadata } from "next";
import AdoptPageClient from "./AdoptPageClient";

export const metadata: Metadata = {
  title: "หาบ้านให้น้องแมว | Petskub",
  description: "สำรวจสัตว์เลี้ยงที่กำลังมองหาบ้านใหม่ พร้อมตัวกรองและรายละเอียดการติดต่อ",
};

const AdoptPage = () => {
  return <AdoptPageClient />;
};

export default AdoptPage;
