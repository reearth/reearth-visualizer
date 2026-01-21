// useStreetViewPlayer.ts (loader) - MUST include geometry library
let googleMapsPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey?: string): Promise<void> {
  if (!apiKey) return Promise.reject(new Error("Missing Google Maps API key."));
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps?.geometry) {
      resolve();
      return;
    }

    const id = "google-maps-js";
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps JS"))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.defer = true;

    // ✅ geometry library is required for computeHeading
    const src = new URL("https://maps.googleapis.com/maps/api/js");
    src.searchParams.set("key", apiKey);
    src.searchParams.set("libraries", "geometry");
    script.src = src.toString();

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps JS"));

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
