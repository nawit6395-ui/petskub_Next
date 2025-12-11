import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import type { Coordinates } from "@/lib/leaflet";
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

const MapClickHandler = ({ onSelect }: { onSelect: (coords: Coordinates) => void }) => {
    useMapEvents({
        click(event) {
            onSelect(event.latlng);
        },
    });
    return null;
};

export const ReportMap = ({
    coordinates,
    onSelect,
}: {
    coordinates: Coordinates | null;
    onSelect: (coords: Coordinates) => void;
}) => {
    return (
        <MapContainer
            key={`${coordinates?.lat ?? defaultMapCenter.lat}-${coordinates?.lng ?? defaultMapCenter.lng}`}
            center={coordinates ?? defaultMapCenter}
            zoom={coordinates ? 16 : 6}
            scrollWheelZoom
            className="relative z-0 h-full w-full"
        >
            <TileLayer url={tileLayerUrl} {...tileLayerOptions} />
            {coordinates && (
                <Marker
                    icon={locationMarkerIcon}
                    position={coordinates}
                    eventHandlers={{
                        mouseover: openMarkerPopup,
                        mouseout: closeMarkerPopup,
                        click: pinMarkerPopup,
                        popupclose: releaseMarkerPopup,
                    }}
                >
                    <Popup>
                        จุดที่พบสัตว์จร <br /> {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                    </Popup>
                </Marker>
            )}
            <MapClickHandler onSelect={onSelect} />
        </MapContainer>
    );
};

export const ReportPreviewMap = ({ latitude, longitude }: { latitude: number; longitude: number }) => (
    <MapContainer
        key={`${latitude}-${longitude}`}
        center={{ lat: latitude, lng: longitude }}
        zoom={15}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        className="relative z-0 h-36 w-full rounded-2xl"
    >
        <TileLayer url={tileLayerUrl} {...tileLayerOptions} />
        <Marker icon={locationMarkerIcon} position={{ lat: latitude, lng: longitude }} />
    </MapContainer>
);
