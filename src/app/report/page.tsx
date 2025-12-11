import type { Metadata } from "next";
import ReportPageWrapper from "./ReportPageWrapper";

export const metadata: Metadata = {
  title: "แจ้งจุดพบสัตว์จร | Petskub",
  description: "ดูภาพรวมรายงานบนแผนที่และแจ้งพิกัดใหม่เพื่อขอความช่วยเหลือ",
};

const ReportPage = () => {
  return <ReportPageWrapper />;
};

export default ReportPage;
