import L from "leaflet";

/**
 * Leaflet's default marker icons often break in Next.js/Webpack builds
 * because the image paths are not correctly resolved relative to the CSS.
 * This utility manually sets them to known working CDN URLs.
 */
export function fixLeafletIcons() {
  if (typeof window === "undefined") return;

  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}
