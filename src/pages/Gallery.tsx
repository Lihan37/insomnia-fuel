import { useEffect, useMemo, useRef, useState } from "react";
import SEO from "@/components/SEO";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

type GalleryItem = {
  _id: string;
  url: string;
  secureUrl?: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt?: string;
  createdAt: string;
};

type SignaturePayload = {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
};

export default function Gallery() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalCount = useMemo(() => items.length, [items.length]);
  const tileSpans = useMemo(() => [20, 26, 22, 28, 24], []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await api.get<{ items: GalleryItem[] }>("/api/gallery");
      setItems(res.data.items || []);
    } catch (e) {
      console.error("Failed to load gallery:", e);
      setErr("Failed to load gallery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !user) {
      setUploadErr("Select an image to upload.");
      return;
    }

    try {
      setUploading(true);
      setUploadErr(null);

      const token = await user.getIdToken();
      const signatureRes = await api.post<SignaturePayload>(
        "/api/gallery/signature",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { signature, timestamp, cloudName, apiKey, folder } =
        signatureRes.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        const message =
          uploadJson?.error?.message || "Cloudinary upload failed.";
        throw new Error(message);
      }

      const createRes = await api.post<GalleryItem>(
        "/api/gallery",
        {
          publicId: uploadJson.public_id,
          url: uploadJson.url,
          secureUrl: uploadJson.secure_url,
          width: uploadJson.width,
          height: uploadJson.height,
          format: uploadJson.format,
          bytes: uploadJson.bytes,
          alt: caption.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems((prev) => [createRes.data, ...prev]);
      setFile(null);
      setCaption("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      console.error("Upload failed:", e);
      setUploadErr("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const result = await Swal.fire({
      title: "Delete this gallery image?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#8B2C2C",
      cancelButtonColor: "#263567",
    });
    if (!result.isConfirmed) return;

    try {
      const token = await user.getIdToken();
      await api.delete(`/api/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((item) => item._id !== id));
      await Swal.fire({
        title: "Deleted",
        text: "The image has been removed.",
        icon: "success",
        confirmButtonColor: "#263567",
      });
    } catch (e) {
      console.error("Delete failed:", e);
      await Swal.fire({
        title: "Delete failed",
        text: "Please try again.",
        icon: "error",
        confirmButtonColor: "#263567",
      });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#f7f0e2] text-[#1E1B17]">
      <SEO
        title="Gallery"
        description="See the atmosphere at Insomnia Fuel, a cafe in Parramatta with bold coffee and comfort food."
        image="/logo.png"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #f7e5c3, transparent 65%), radial-gradient(circle at 70% 70%, #c9ad7c, transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="flex flex-col items-center text-center gap-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-[#6B4A2F] shadow-sm">
            Insomnia Fuel Gallery
          </span>

          <h1 className="text-3xl md:text-5xl font-serif text-[#3B2416] tracking-wide">
            Moments of late-night comfort
          </h1>

          <p className="max-w-3xl text-sm md:text-base text-[#4A3A28] leading-relaxed">
            A curated view of our space, signature plates, and the warm glow that
            keeps the night moving.
          </p>

          <div className="flex items-center w-full max-w-2xl">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-amber-200" />
            <span className="mx-3 text-[11px] uppercase tracking-[0.35em] text-[#8a7a64]">
              {totalCount} images
            </span>
            <span className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-300 to-amber-200" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {isAdmin && (
          <form
            onSubmit={handleUpload}
            className="mb-10 rounded-3xl border border-amber-200 bg-white/80 p-5 md:p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1E2B4F]">
                  Gallery Studio
                </h2>
                <p className="text-xs text-neutral-600">
                  Upload new images directly to Cloudinary.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
              <label className="block text-xs font-medium text-neutral-700">
                Image file
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) =>
                    setFile(e.target.files?.[0] ? e.target.files[0] : null)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-xs font-medium text-neutral-700">
                Caption (optional)
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Short description for accessibility"
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center justify-center rounded-xl bg-[#1E2B4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#263567] disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload image"}
              </button>
            </div>

            {uploadErr && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {uploadErr}
              </div>
            )}
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm text-neutral-700">
              Loading gallery...
            </div>
          </div>
        ) : err ? (
          <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white/80 border border-neutral-200 px-4 py-10 text-center text-sm text-neutral-600">
            Gallery is empty for now. Check back soon.
          </div>
        ) : (
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 top-6 h-48 w-48 rounded-full bg-[#f3d6a1]/70 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 bottom-12 h-56 w-56 rounded-full bg-[#bfa480]/50 blur-3xl"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[8px]">
              {items.map((item, index) => {
                const span = tileSpans[index % tileSpans.length];
                return (
              <div
                key={item._id}
                style={{ gridRowEnd: `span ${span}` }}
                className="group relative overflow-hidden rounded-[28px] border border-amber-100/70 bg-white/90 shadow-[0_20px_45px_-35px_rgba(30,27,23,0.6)] transition-transform duration-300 hover:-translate-y-1"
              >
                <img
                  src={item.secureUrl || item.url}
                  alt={item.alt || "Insomnia Fuel gallery"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b]/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {(item.alt || isAdmin) && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-3 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="line-clamp-2 text-[11px] uppercase tracking-[0.24em] text-[#f5ead6]">
                      {item.alt || "Gallery image"}
                    </span>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white hover:bg-white/20"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
