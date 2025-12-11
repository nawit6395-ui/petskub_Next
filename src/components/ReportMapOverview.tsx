"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import L, { type Map as LeafletMap, type Marker as LeafletMarker } from "leaflet";
import type { Report } from "@shared/hooks/useReports";
import "leaflet/dist/leaflet.css";
import {
  locationMarkerIcon,
  defaultMapCenter,
  tileLayerUrl,
  tileLayerOptions,
  openMarkerPopup,
  closeMarkerPopup,
  pinMarkerPopup,
  releaseMarkerPopup,
} from "@/lib/leaflet";

interface ReportMapOverviewProps {
  reports?: Report[];
  heightClass?: string;
  scrollWheelZoom?: boolean;
}

const ReportMapOverview = ({
  reports,
  heightClass = "h-[280px] sm:h-[360px] lg:h-[420px]",
  scrollWheelZoom = true,
}: ReportMapOverviewProps) => {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);

  const points = useMemo(
    () =>
      (reports ?? [])
        .filter((report): report is Report & { latitude: number; longitude: number } =>
          typeof report.latitude === "number" && typeof report.longitude === "number"
        ),
    [reports]
  );
  const hasPoints = points.length > 0;

  const center = useMemo(() => {
    if (!hasPoints) return defaultMapCenter;
    const first = points[0];
    return { lat: first.latitude, lng: first.longitude };
  }, [hasPoints, points]);

  const zoomLevel = hasPoints && points.length > 5 ? 11 : 14;

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      marker.off("mouseover", openMarkerPopup);
      marker.off("mouseout", closeMarkerPopup);
      marker.off("click", pinMarkerPopup);
      marker.off("popupclose", releaseMarkerPopup);
      marker.remove();
    });
    markersRef.current = [];
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClientReady(true);
    return () => {
      clearMarkers();
      if (map) {
        map.remove();
      }
    };
  }, [clearMarkers, map]);

  useEffect(() => {
    if (!isClientReady || map || !mapContainerRef.current) {
      return;
    }

    const mapInstance = L.map(mapContainerRef.current, {
      center: center ?? defaultMapCenter,
      zoom: zoomLevel,
      scrollWheelZoom,
    });

    L.tileLayer(tileLayerUrl, tileLayerOptions).addTo(mapInstance);
    setMap(mapInstance);

    return () => {
      // Cleanup handled in main useEffect or let it persist until component unmount via dependency change
    };
  }, [center.lat, center.lng, isClientReady, scrollWheelZoom, zoomLevel, map]);

  useEffect(() => {
    if (!map) return;
    if (scrollWheelZoom) {
      map.scrollWheelZoom.enable();
    } else {
      map.scrollWheelZoom.disable();
    }
  }, [scrollWheelZoom, map]);

  useEffect(() => {
    if (!map) return;
    map.setView(center ?? defaultMapCenter, zoomLevel);
  }, [center.lat, center.lng, zoomLevel, map]);

  useEffect(() => {
    if (!map || !hasPoints) {
      clearMarkers();
      return;
    }

    clearMarkers();
    markersRef.current = points.map((report) => {
      const marker = L.marker({ lat: report.latitude!, lng: report.longitude! }, {
        icon: locationMarkerIcon,
      });

      // Standard click behavior: Open popup and keep it open until map click/other popup
      marker.bindPopup(buildPopupHtml(report));
      marker.addTo(map);
      return marker;
    });

    return () => {
      clearMarkers();
    };
  }, [points, hasPoints, clearMarkers, map]);

  if (!isClientReady) {
    return (
      <div className={`relative w-full rounded-3xl bg-muted/40 ${heightClass}`}>
        <div className="absolute inset-0 animate-pulse rounded-3xl bg-muted/20" />
      </div>
    );
  }

  if (!hasPoints) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-3xl border bg-muted/40 text-center">
        <p className="font-semibold font-prompt">ยังไม่มีพิกัดสำหรับแสดงผล</p>
        <p className="text-sm text-muted-foreground font-prompt">เริ่มแจ้งจุดพบสัตว์จรเพื่อดูแผนที่ภาพรวม</p>
      </div>
    );
  }

  return (
    <div className={`relative z-0 w-full rounded-3xl ${heightClass}`}>
      <div ref={mapContainerRef} className="leaflet-container h-full w-full rounded-3xl" />
    </div>
  );
};

export default memo(ReportMapOverview);

const buildGoogleMapsUrl = (report: Report): string | null => {
  if (typeof report.latitude === "number" && typeof report.longitude === "number") {
    return `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
  }

  if (report.location) {
    const query = encodeURIComponent(`${report.location} ${report.district ?? ""} ${report.province ?? ""}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  return null;
};

const buildPopupHtml = (report: Report) => {
  const location = escapeHtml(report.location ?? "ไม่ระบุสถานที่");
  const province = escapeHtml(report.province ?? "ไม่ระบุจังหวัด");

  // Extract photo (first one if array)
  let photoUrl = "";
  if (Array.isArray(report.photo_urls) && report.photo_urls.length > 0) {
    photoUrl = report.photo_urls[0];
  } else if (typeof report.photo_urls === "string" && report.photo_urls) {
    photoUrl = report.photo_urls;
  }

  // Description usually contains "Type : ... | Condition : ..."
  const description = escapeHtml(report.description ?? "-");

  const mapUrl = buildGoogleMapsUrl(report);

  const linkHtml = mapUrl
    ? `<a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-700 hover:text-blue-900 text-sm font-semibold no-underline hover:underline mt-2 inline-block">Open Google Maps</a>`
    : "";

  const imageHtml = photoUrl
    ? `<div class="shrink-0 w-16 h-20 bg-gray-100 rounded-md overflow-hidden"><img src="${photoUrl}" class="w-full h-full object-cover" alt="Report image" /></div>`
    : `<div class="shrink-0 w-16 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;

  return `
    <div class="font-prompt min-w-[260px] flex gap-3 p-1">
      ${imageHtml}
      <div class="flex-1 min-w-0 flex flex-col justify-center">
        <h3 class="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-0.5">${location}</h3>
        <p class="text-xs text-gray-500 mb-1.5">${province}</p>
        <p class="text-xs text-gray-600 line-clamp-2 mb-1 leading-relaxed">${description}</p>
        ${linkHtml}
      </div>
    </div>
  `;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
  ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] ?? char)
  );
