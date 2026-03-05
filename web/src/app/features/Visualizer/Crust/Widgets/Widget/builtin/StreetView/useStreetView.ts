let googleMapsPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey?: string): Promise<void> {
  if (!apiKey) {
    return Promise.reject(new Error("Missing Google Maps API key."));
  }

  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps?.geometry) {
      resolve();
      return;
    }

    const id = "google-maps-js";
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    const handleError = () => {
      googleMapsPromise = null; 
      reject(new Error("Failed to load Google Maps JS"));
    };

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.defer = true;

    const src = new URL("https://maps.googleapis.com/maps/api/js");
    src.searchParams.set("key", apiKey);
    src.searchParams.set("libraries", "geometry");
    script.src = src.toString();

    script.onload = () => resolve();
    script.onerror = handleError;

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
