import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ReportMapWrapper from "./ReportMapWrapper";

export const metadata = {
    title: "แผนที่รายงานสัตว์จร | Petskub",
    description: "ติดตามและช่วยเหลือสัตว์จรบนแผนที่แบบเรียลไทม์",
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
