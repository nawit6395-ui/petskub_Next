import { NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const lang = searchParams.get("lang") || "th";

  const latitude = lat ? Number(lat) : NaN;
  const longitude = lon ? Number(lon) : NaN;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lon", longitude.toString());
    url.searchParams.set("accept-language", lang);
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Petskub-Next/1.0 (reverse-geocode)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Geocode request failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ address: data.address, display_name: data.display_name });
  } catch (error) {
    console.error("[reverse-geocode] error", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
