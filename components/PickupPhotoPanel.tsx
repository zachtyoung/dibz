"use client";
import { useState, useRef } from "react";
import { Camera, Star, Upload, X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { PickupPhoto } from "@/lib/listings";

const INK = "oklch(0.14 0.02 240)";
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

const SOURCE_LABEL: Record<PickupPhoto["source"], string> = {
  seller: "Seller photo",
  buyer:  "Scout photo",
};

const SOURCE_COLOR: Record<PickupPhoto["source"], string> = {
  seller: "oklch(0.52 0.14 178)",
  buyer:  "#f59e0b",
};

function StreetViewImg({ lat, lng }: { lat: number; lng: number }) {
  const src = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&fov=90&heading=0&pitch=0&key=${KEY}`;
  const [err, setErr] = useState(false);

  if (err) return null;
  return (
    <img
      src={src}
      alt="Street View of pickup location"
      className="h-full w-full object-cover"
      onError={() => setErr(true)}
    />
  );
}

/* Badge shown on each photo thumbnail */
function SourceBadge({ source }: { source: PickupPhoto["source"] }) {
  return (
    <span
      className="absolute left-2 top-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ background: SOURCE_COLOR[source], border: `1.5px solid ${INK}`, boxShadow: `1px 1px 0 ${INK}` }}
    >
      {SOURCE_LABEL[source]}
    </span>
  );
}

/* Lightbox */
function Lightbox({ photos, streetView, svLat, svLng, isExactLocation, index, onClose, onNav }: {
  photos: PickupPhoto[];
  streetView: boolean;
  svLat: number;
  svLng: number;
  isExactLocation: boolean;
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  const total = photos.length + (streetView ? 1 : 0);
  const isStreetView = streetView && index === total - 1;
  const photo = !isStreetView ? photos[index] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
      >
        <div className="relative aspect-video bg-black overflow-hidden">
          {isStreetView ? (
            <StreetViewImg lat={svLat} lng={svLng} />
          ) : (
            <img src={photo!.src} alt={photo!.caption ?? "Pickup location"} className="h-full w-full object-cover" />
          )}
          {!isStreetView && photo && <SourceBadge source={photo.source} />}
          {isStreetView && (
            <span
              className="absolute left-2 top-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background: "#3b82f6", border: `1.5px solid ${INK}`, boxShadow: `1px 1px 0 ${INK}` }}
            >
              {isExactLocation ? "Street View" : "Neighborhood"}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground truncate">
            {isStreetView
              ? isExactLocation
                ? "Google Street View — pickup location"
                : "General neighborhood — message seller for exact address"
              : photo?.caption ?? (photo?.source === "buyer" ? `Submitted by ${photo.submittedBy ?? "a buyer"}` : "Seller photo")}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNav((index - 1 + total) % total)}
              className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground transition"
              style={{ border: `1.5px solid ${INK}` }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold">{index + 1}/{total}</span>
            <button
              onClick={() => onNav((index + 1) % total)}
              className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground transition"
              style={{ border: `1.5px solid ${INK}` }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground transition"
              style={{ border: `1.5px solid ${INK}` }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Buyer submission form */
function SubmitPhotoForm({ onSubmit, onCancel }: {
  onSubmit: (photo: PickupPhoto) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) return;
    onSubmit({ src: preview, source: "buyer", submittedBy: "You", caption: caption || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 bg-surface p-4 space-y-3" style={{ border: `2px solid ${INK}` }}>
      <p className="text-xs font-bold uppercase tracking-wider text-foreground">Submit a pickup photo</p>
      <p className="text-xs text-muted-foreground">Help future buyers find this spot. Earn a Scout badge.</p>

      <div
        className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden bg-muted"
        style={{ border: `2px dashed ${INK}` }}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <span className="text-xs font-semibold">Tap to add photo</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>

      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Add a tip (e.g. 'Blue door, park on street')"
        maxLength={120}
        className="w-full bg-input px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ border: `2px solid ${INK}` }}
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!preview}
          className="flex flex-1 items-center justify-center gap-2 bg-primary py-2 text-xs font-bold text-primary-foreground transition hover:bg-accent disabled:opacity-40"
          style={{ border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
        >
          <Star className="h-3.5 w-3.5" /> Submit + earn Scout badge
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          style={{ border: `2px solid ${INK}` }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* Deterministic fuzz: offset by up to ~400m using listing coords as seed */
function fuzzCoords(lat: number, lng: number): { lat: number; lng: number } {
  const seed = Math.abs(Math.sin(lat * 1000) * Math.cos(lng * 1000));
  const seed2 = Math.abs(Math.cos(lat * 1337) * Math.sin(lng * 1337));
  const dLat = (seed - 0.5) * 0.007;   // ~±390m
  const dLng = (seed2 - 0.5) * 0.009;  // ~±390m
  return { lat: lat + dLat, lng: lng + dLng };
}

export function PickupPhotoPanel({
  lat,
  lng,
  isExactLocation = false,
  photos: initialPhotos = [],
}: {
  lat: number;
  lng: number;
  isExactLocation?: boolean;
  photos?: PickupPhoto[];
}) {
  const [photos, setPhotos] = useState<PickupPhoto[]>(initialPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [scoutEarned, setScoutEarned] = useState(false);
  const [streetViewOk, setStreetViewOk] = useState(true);

  const svCoords = isExactLocation ? { lat, lng } : fuzzCoords(lat, lng);
  const streetViewSrc = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${svCoords.lat},${svCoords.lng}&fov=90&heading=0&pitch=0&key=${KEY}`;
  const hasStreetView = streetViewOk;
  const total = photos.length + (hasStreetView ? 1 : 0);

  /* Priority: seller first, then buyer, then street view at end */
  const sorted = [
    ...photos.filter((p) => p.source === "seller"),
    ...photos.filter((p) => p.source === "buyer"),
  ];

  function handleSubmit(photo: PickupPhoto) {
    setPhotos((prev) => [...prev, photo]);
    setShowSubmit(false);
    setScoutEarned(true);
  }

  if (total === 0 && !streetViewOk) return null;

  const primaryPhoto = sorted[0] ?? null;
  const primaryIsStreetView = !primaryPhoto;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          Pickup location
        </p>
        {scoutEarned && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#fef3c7", border: `1.5px solid #f59e0b`, color: "#92400e" }}
          >
            <Star className="h-3 w-3" /> Scout
          </span>
        )}
      </div>

      {/* Primary photo */}
      <div
        className="relative cursor-pointer overflow-hidden"
        style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
        onClick={() => setLightboxIndex(primaryIsStreetView ? sorted.length : 0)}
      >
        <div className="relative aspect-video bg-muted overflow-hidden">
          {primaryIsStreetView ? (
            <>
              <img
                src={streetViewSrc}
                alt="Street View of pickup area"
                className="h-full w-full object-cover"
                onError={() => setStreetViewOk(false)}
              />
              <span
                className="absolute left-2 top-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: "#3b82f6", border: `1.5px solid ${INK}`, boxShadow: `1px 1px 0 ${INK}` }}
              >
                {isExactLocation ? "Street View" : "Neighborhood"}
              </span>
              {!isExactLocation && (
                <span
                  className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{ background: "rgba(0,0,0,0.55)", border: `1px solid rgba(255,255,255,0.3)` }}
                >
                  Exact location shared after contact
                </span>
              )}
            </>
          ) : (
            <>
              <img src={primaryPhoto.src} alt={primaryPhoto.caption ?? "Pickup location"} className="h-full w-full object-cover" />
              <SourceBadge source={primaryPhoto.source} />
            </>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/20">
            <span className="text-white text-xs font-bold uppercase tracking-wider px-3 py-1" style={{ background: "rgba(0,0,0,0.6)", border: `1px solid white` }}>
              View full
            </span>
          </div>
        </div>

        {/* Caption bar */}
        <div className="flex items-center gap-2 bg-card px-3 py-2" style={{ borderTop: `2px solid ${INK}` }}>
          <p className="flex-1 truncate text-[11px] text-muted-foreground">
            {primaryIsStreetView
              ? isExactLocation
                ? "Street View of pickup location"
                : "General neighborhood — message seller for exact address"
              : primaryPhoto?.caption ?? (primaryPhoto?.source === "buyer"
                  ? `Scout photo by ${primaryPhoto?.submittedBy ?? "a buyer"}`
                  : "Seller photo — tap to see more")}
          </p>
          {total > 1 && (
            <span className="shrink-0 text-[10px] font-bold text-muted-foreground">{total} photos</span>
          )}
        </div>
      </div>

      {/* Thumbnail strip (if multiple) */}
      {total > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {sorted.map((p, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="relative shrink-0 overflow-hidden"
              style={{
                width: 64, height: 48,
                border: `2px solid ${INK}`,
                boxShadow: lightboxIndex === i ? `2px 2px 0 ${INK}` : undefined,
                opacity: lightboxIndex === i ? 1 : 0.75,
              }}
            >
              <img src={p.src} alt="" className="h-full w-full object-cover" />
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ background: SOURCE_COLOR[p.source] }}
              />
            </button>
          ))}
          {hasStreetView && (
            <button
              onClick={() => setLightboxIndex(sorted.length)}
              className="relative shrink-0 overflow-hidden"
              style={{
                width: 64, height: 48,
                border: `2px solid ${INK}`,
                opacity: lightboxIndex === sorted.length ? 1 : 0.75,
              }}
            >
              <img
                src={streetViewSrc}
                alt="Street View"
                className="h-full w-full object-cover"
                onError={() => setStreetViewOk(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
            </button>
          )}
        </div>
      )}

      {/* Submit CTA */}
      {!showSubmit && !scoutEarned && (
        <button
          onClick={() => setShowSubmit(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold transition hover:bg-muted"
          style={{ border: `2px solid oklch(0.16 0.01 60)`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "oklch(0.16 0.01 60)" }}
        >
          <Camera className="h-3.5 w-3.5" />
          Add a pickup photo
        </button>
      )}

      {showSubmit && (
        <SubmitPhotoForm onSubmit={handleSubmit} onCancel={() => setShowSubmit(false)} />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={sorted}
          streetView={hasStreetView}
          svLat={svCoords.lat}
          svLng={svCoords.lng}
          isExactLocation={isExactLocation}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={setLightboxIndex}
        />
      )}
    </div>
  );
}
