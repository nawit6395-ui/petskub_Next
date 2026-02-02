import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ReportMapWrapper from "./ReportMapWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "แผนที่รายงานสัตว์จรจัด ทั่วประเทศ | Petskub",
    description: "ติดตามและช่วยเหลือสัตว์จรบนแผนที่แบบเรียลไทม์ ดูจุดพบสัตว์จร กรุงเทพ ปทุมธานี และทั่วประเทศไทย",
    keywords: ["แผนที่สัตว์จร", "จุดพบสัตว์จร", "ช่วยเหลือสัตว์", "กรุงเทพ", "ปทุมธานี"],
};

export default function ReportMapPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ReportMapWrapper />
        </Suspense>
    );
}
