import type { Metadata } from "next";
import ReportPageWrapper from "./ReportPageWrapper";

export const metadata: Metadata = {
  title: "แจ้งพิกัดสัตว์จรจัด ขอความช่วยเหลือ | Petskub",
  description: "ระบบแจ้งเตือนจุดพบสัตว์จร เพื่อระดมความช่วยเหลือจากอาสาสมัครในพื้นที่ ไม่ว่าจะเป็นการหาบ้านให้หมา หาบ้านให้แมว การรักษา หรือการทำหมัน",
  keywords: ["แจ้งพิกัดสัตว์จร", "สัตว์จรจัด", "ช่วยเหลือสัตว์จร", "อาสาสมัคร", "ทำหมัน"],
};

const ReportPage = () => {
  return <ReportPageWrapper />;
};

export default ReportPage;
