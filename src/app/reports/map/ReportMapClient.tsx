"use client";
// Force rebuild


import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  defaultMapCenter,
  tileLayerUrl,
  tileLayerOptions,
  locationMarkerIcon,
  openMarkerPopup,
  closeMarkerPopup,
  pinMarkerPopup,
  releaseMarkerPopup,
} from "@/lib/leaflet";
import type { Coordinates } from "@/lib/leaflet";
import "leaflet/dist/leaflet.css";
import {
  REPORT_STATUS_LABELS,
  useReports,
  useUpdateReportStatus,
  useDeleteReport,
  type Report,
} from "@/shared/hooks/useReports";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Plus,
  Search,
  LocateFixed,
  LayoutGrid,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  Users,
  Bell,
  MoreHorizontal,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const REPORT_THUMBNAIL_PLACEHOLDER =
  "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=70";

const statusConfig: Record<
  Report["status"],
  {
    label: string;
    icon: ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    lightBg: string; // For filtered button bg
  }
> = {
  pending: {
    label: REPORT_STATUS_LABELS.pending,
    icon: <Clock className="h-5 w-5" />,
    color: "text-amber-500",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-200",
    lightBg: "hover:bg-amber-50",
  },
  in_progress: {
    label: REPORT_STATUS_LABELS.in_progress,
    icon: <Send className="h-4 w-4" />, // Using Send icon for tracking/in-progress
    color: "text-emerald-500",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-200",
    lightBg: "hover:bg-emerald-50",
  },
  resolved: {
    label: REPORT_STATUS_LABELS.resolved,
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    lightBg: "hover:bg-purple-50",
  },
};

  const statusDescriptions: Record<Report["status"], string> = {
    pending: "รออาสาสมัครหรือสมาชิกช่วยรับเคส",
    in_progress: "สมาชิกกำลังติดตามและดูแลเคสนี้",
    resolved: "ปิดรายงานแล้วหลังดูแลเสร็จสิ้น",
  };

const statusFilters: (
  | { value: "all"; label: string }
  | { value: Report["status"]; label: string }
)[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "pending", label: "รอตรวจสอบ" },
    { value: "in_progress", label: "ติดตาม" },
    { value: "resolved", label: "เสร็จสิ้น" },
  ];

const pickPhotoSource = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const found = value.find(
      (src) => typeof src === "string" && src.trim().length > 0
    );
    return found ?? null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return null;
};

const resolveReportImage = (
  value: Report["photo_urls"]
): { src: string; isPlaceholder: boolean } => {
  const chosen = pickPhotoSource(value);
  if (chosen) return { src: chosen, isPlaceholder: false };
  return { src: REPORT_THUMBNAIL_PLACEHOLDER, isPlaceholder: true };
};

const ReportMap = () => {
  const { data: reports, isLoading } = useReports();
  const [leaflet, setLeaflet] = useState<typeof import("react-leaflet") | null>(null);
  const searchParams = useSearchParams();
  const focusParam = searchParams.get("focus");
  const { user, loading: authLoading } = useAuth();
  const { mutate: updateReportStatus } = useUpdateReportStatus();
  const { mutateAsync: deleteReport } = useDeleteReport();

  const [activeReportId, setActiveReportId] = useState<string | null>(
    focusParam
  );
  const [statusFilter, setStatusFilter] = useState<
    Report["status"] | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let mounted = true;
    import("react-leaflet").then((mod) => {
      if (mounted) setLeaflet(mod);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleStatusChange = useCallback(
    (reportId: string, nextStatus: Report["status"]) => {
      updateReportStatus({ id: reportId, status: nextStatus });
    },
    [updateReportStatus]
  );

  const handleDeleteReport = useCallback(
    async (reportId: string) => {
      const result = await Swal.fire({
        title: "ยืนยันการลบรายงาน",
        text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ลบรายงาน",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      await deleteReport(reportId);
      if (activeReportId === reportId) setActiveReportId(null);
    },
    [deleteReport, activeReportId]
  );

  const reportsWithCoordinates = useMemo(
    () =>
      (reports ?? []).filter(
        (r): r is Report & { latitude: number; longitude: number } =>
          typeof r.latitude === "number" && typeof r.longitude === "number"
      ),
    [reports]
  );

  const statusSummary = useMemo(() => {
    const summary = {
      total: reports?.length ?? 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
    };
    (reports ?? []).forEach((r) => {
      summary[r.status] += 1;
    });
    return summary;
  }, [reports]);

  const filteredReports = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return (reports ?? []).filter((r) => {
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const searchable = `${r.location ?? ""} ${r.district ?? ""} ${r.province ?? ""
        }`.toLowerCase();
      const matchesSearch = !normalized || searchable.includes(normalized);
      return matchesStatus && matchesSearch;
    });
  }, [reports, statusFilter, searchTerm]);

  const filteredReportsWithCoordinates = useMemo(
    () =>
      filteredReports.filter(
        (r): r is Report & { latitude: number; longitude: number } =>
          typeof r.latitude === "number" && typeof r.longitude === "number"
      ),
    [filteredReports]
  );

  useEffect(() => {
    if (!focusParam) return;
    const exists = reportsWithCoordinates.some((r) => r.id === focusParam);
    if (exists) setActiveReportId(focusParam);
  }, [focusParam, reportsWithCoordinates]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (filteredReportsWithCoordinates.length === 0) {
      if (activeReportId !== null) setActiveReportId(null);
      return;
    }
    const activeExists = filteredReportsWithCoordinates.some(
      (r) => r.id === activeReportId
    );
    if (!activeExists && filteredReportsWithCoordinates.length > 0)
      setActiveReportId(filteredReportsWithCoordinates[0].id);
  }, [filteredReportsWithCoordinates, activeReportId]);

  const activeReport =
    filteredReportsWithCoordinates.find((r) => r.id === activeReportId) ??
    filteredReportsWithCoordinates[0] ??
    null;

  if (!leaflet) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { MapContainer, Marker, Popup, TileLayer, useMap } = leaflet;

  const MapFocus = ({ coordinates }: { coordinates: Coordinates | null }) => {
    const map = useMap();
    useEffect(() => {
      if (coordinates) map.setView(coordinates, 15, { animate: true });
    }, [coordinates, map]);
    return null;
  };

  const showEmptyState = !isLoading && reportsWithCoordinates.length === 0;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 rounded-xl p-2.5 text-white shadow-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-heading">แผนที่รายงานทั้งหมด</h1>
                <p className="text-sm text-gray-500 font-nav">จุดที่พบแมวและสุนัขจร พร้อมติดตามสถานะแบบเรียลไทม์</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-nav shadow-sm gap-2">
                <Link href="/report">
                  <Plus className="h-4 w-4" />
                  แจ้งรายงานใหม่
                </Link>
              </Button>
              <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden md:block"></div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              {user && (
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="รายงานทั้งหมด"
            value={statusSummary.total}
            icon={<LayoutGrid className="h-5 w-5" />}
            color="text-orange-500"
            bgColor="bg-orange-50"
          />
          <StatCard
            title={statusConfig.pending.label}
            value={statusSummary.pending}
            icon={statusConfig.pending.icon}
            color={statusConfig.pending.color}
            bgColor={statusConfig.pending.bgColor}
          />
          <StatCard
            title={statusConfig.in_progress.label}
            value={statusSummary.in_progress}
            icon={statusConfig.in_progress.icon}
            color={statusConfig.in_progress.color}
            bgColor={statusConfig.in_progress.bgColor}
          />
          <StatCard
            title={statusConfig.resolved.label}
            value={statusSummary.resolved}
            icon={statusConfig.resolved.icon}
            color={statusConfig.resolved.color}
            bgColor={statusConfig.resolved.bgColor}
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาตามตำแหน่ง / อำเภอ..."
              className="pl-9 bg-white border-gray-200 rounded-xl focus:ring-orange-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto w-full md:w-auto">
            {statusFilters.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === tab.value
                  ? "bg-orange-50 text-orange-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 h-[600px] lg:h-[calc(100vh-280px)] min-h-[500px]">
          {/* Map Area */}
          <div className="bg-gray-100 rounded-3xl border shadow-inner overflow-hidden relative group">
            {!isMounted ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading Map...
              </div>
            ) : (
              <MapContainer
                center={defaultMapCenter}
                zoom={6}
                scrollWheelZoom
                zoomControl={false}
                className="w-full h-full z-0"
              >
                <TileLayer url={tileLayerUrl} {...tileLayerOptions} />
                <MapFocus
                  coordinates={
                    activeReport
                      ? {
                        lat: activeReport.latitude,
                        lng: activeReport.longitude,
                      }
                      : null
                  }
                />
                {reportsWithCoordinates.map((report) => (
                  <Marker
                    key={report.id}
                    icon={locationMarkerIcon}
                    position={{ lat: report.latitude, lng: report.longitude }}
                    eventHandlers={{
                      click: (event) => {
                        pinMarkerPopup(event);
                        setActiveReportId(report.id);
                      },
                      mouseover: openMarkerPopup,
                      mouseout: closeMarkerPopup,
                      popupclose: releaseMarkerPopup,
                    }}
                  >
                    <Popup>
                      <div className="font-prompt min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          {resolveReportImage(report.photo_urls).isPlaceholder ? (
                            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">No Img</div>
                          ) : (
                            <img src={resolveReportImage(report.photo_urls).src} className="w-8 h-8 object-cover rounded-md" />
                          )}
                          <div>
                            <div className="text-sm font-bold truncate max-w-[120px]">{report.location}</div>
                            <div className="text-[10px] text-gray-500">{report.province}</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{report.description}</p>
                        <a href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`} target="_blank" className="text-xs text-orange-600 hover:underline">
                          Open Google Maps
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Custom Zoom Control Position if needed, but simple for now */}
              </MapContainer>
            )}

            {/* Map Floating Controls (Interactive Map Area label in mockup replaced by better controls or omitted for clean look) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-white/50 text-xs font-semibold text-gray-500 pointer-events-none z-[400]">
              Interactive Map Area
            </div>
          </div>

          {/* Sidebar List */}
          <div className="bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                รายการ <span className="text-gray-400">({filteredReports.length})</span>
              </h3>
              <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600 h-8 text-xs font-medium" onClick={() => setActiveReportId(null)}>
                โฟกัสพิกัดทั้งหมด
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
              {filteredReports.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  ไม่พบรายการที่ค้นหา
                </div>
              ) : filteredReports.map((report) => {
                const status = statusConfig[report.status];
                const isActive = report.id === activeReportId;
                const thumbnail = resolveReportImage(report.photo_urls);
                const isOwner = user?.id === report.user_id;

                return (
                  <div
                    key={report.id}
                    onClick={() => setActiveReportId(report.id)}
                    className={`group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${isActive
                      ? "bg-orange-50/50 border-orange-200 ring-1 ring-orange-200 shadow-sm"
                      : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          <MapPin className="h-3 w-3" />
                          {report.province} · {report.district}
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-2">
                          {report.location}
                        </h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.borderColor} ${status.bgColor} ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden relative">
                        <img src={thumbnail.src} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100 mt-2">
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(report.created_at).toLocaleDateString("th-TH") + " • " + new Date(report.created_at).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {typeof report.latitude === "number" && (
                        <a
                          href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-gray-400 hover:text-orange-500 flex items-center gap-1 transition-colors"
                        >
                          <Send className="h-3 w-3 -rotate-45" /> Google Maps
                        </a>
                      )}
                    </div>

                    {/* Owner Options */}
                    {isOwner && (
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-white">
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="font-normal text-xs text-gray-500">
                              อัปเดตสถานะ
                            </DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={report.status} onValueChange={(val) => handleStatusChange(report.id, val as Report["status"])}>
                              <DropdownMenuRadioItem value="pending">รอตรวจสอบ</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="in_progress">กำลังติดตาม</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="resolved">เสร็จสิ้น</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                              onClick={() => handleDeleteReport(report.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              ลบรายงาน
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportMap;

function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
      </div>
      <div className={`h-12 w-12 rounded-2xl ${bgColor} ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
}

