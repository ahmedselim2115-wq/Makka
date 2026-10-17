  // المسار: src/components/admin/ShowcaseForm.tsx
  "use client";

  import { useEffect, useRef, useState } from "react";
  import { Plus, Trash2, X, Upload } from "lucide-react";
  import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
  import { getContainedImageRect } from "@/lib/imageFit";
  import { uploadFileToCloudinary } from '@/lib/upload'

  interface Hotspot {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    positionX: number;
    positionY: number;
  }

  interface ShowcaseProduct {
    id: string;
    name: string;
    nameEn: string;
    image: string;
    order: number;
    isActive: boolean;
    hotspots: Hotspot[];
  }

  export default function ShowcaseForm() {
    const { t, locale } = useAdminLanguage();
    const isAdminEn = locale === "en";
    const [products, setProducts] = useState<ShowcaseProduct[]>([]);
    const [editing, setEditing] = useState<ShowcaseProduct | null>(null);
    const [placingMode, setPlacingMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);
const imgElRef = useRef<HTMLImageElement>(null);
const [imgRect, setImgRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

const updateImgRect = () => {
  if (!imageRef.current || !imgElRef.current?.naturalWidth) return;
  const c = imageRef.current.getBoundingClientRect();
  setImgRect(
    getContainedImageRect(
      c.width,
      c.height,
      imgElRef.current.naturalWidth,
      imgElRef.current.naturalHeight
    )
  );
};

useEffect(() => {
  updateImgRect();
  window.addEventListener("resize", updateImgRect);
  return () => window.removeEventListener("resize", updateImgRect);
}, [editing?.image]);

    const load = async () => {
      const res = await fetch("/api/admin/showcase");
      const data = await res.json();
      setProducts(
        (data.products ?? []).map((p: any) => ({
          ...p,
          nameEn: p.nameEn || "",
          hotspots: (p.hotspots ?? []).map((h: any) => ({
            ...h,
            titleEn: h.titleEn || "",
            descriptionEn: h.descriptionEn || "",
          })),
        }))
      );
    };

    useEffect(() => {
      load();
    }, []);

    const startNew = () => {
      setEditing({
        id: "",
        name: "",
        nameEn: "",
        image: "",
        order: products.length,
        isActive: true,
        hotspots: [],
      });
    };

   

const handleImageUpload = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    alert("من فضلك اختر ملف صورة");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
    return;
  }

  try {
    const url = await uploadFileToCloudinary(file)

    setEditing((current) =>
      current ? { ...current, image: url } : current
    )
  } catch (error) {
    console.error("Image upload failed:", error);
    alert("فشل رفع الصورة. حاول مرة أخرى.");
  }
};



    const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!placingMode || !editing || !imageRef.current) return;
        const imgEl = imageRef.current.querySelector("img") as HTMLImageElement | null;
        if (!imgEl || !imgEl.naturalWidth) return;

        const containerRect = imageRef.current.getBoundingClientRect();
        const { left, top, width, height } = getContainedImageRect(
          containerRect.width,
          containerRect.height,
          imgEl.naturalWidth,
          imgEl.naturalHeight
        );

        const clickX = e.clientX - containerRect.left;
        const clickY = e.clientY - containerRect.top;

        if (clickX < left || clickX > left + width || clickY < top || clickY > top + height) {
          return; // ضغط برة حدود الصورة الفعلية (المنطقة الفارغة)
        }

        const x = ((clickX - left) / width) * 100;
        const y = ((clickY - top) / height) * 100;

        setEditing({
          ...editing,
          hotspots: [
            ...editing.hotspots,
            {
              id: `temp-${Date.now()}`,
              title: "",
              titleEn: "",
              description: "",
              descriptionEn: "",
              positionX: Math.round(x * 10) / 10,
              positionY: Math.round(y * 10) / 10,
            },
          ],
        });
        setPlacingMode(false);
      };

    const updateHotspot = (id: string, patch: Partial<Hotspot>) => {
      if (!editing) return;
      setEditing({
        ...editing,
        hotspots: editing.hotspots.map((h) =>
          h.id === id ? { ...h, ...patch } : h
        ),
      });
    };

    const removeHotspot = (id: string) => {
      if (!editing) return;
      setEditing({
        ...editing,
        hotspots: editing.hotspots.filter((h) => h.id !== id),
      });
    };

    const save = async () => {
      if (!editing) return;
      if (!editing.name || !editing.image) {
        alert(t("showcase_validation"));
        return;
      }
      setSaving(true);
      try {
        const isUpdate = Boolean(editing.id);
        const url = isUpdate
          ? `/api/admin/showcase/${editing.id}`
          : `/api/admin/showcase`;
        const method = isUpdate ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });

        if (!res.ok) throw new Error("save failed");

        setEditing(null);
        await load();
      } catch (err) {
        console.error(err);
        alert(t("showcase_save_error"));
      } finally {
        setSaving(false);
      }
    };

    const remove = async (id: string) => {
    if (!confirm(t("showcase_delete_confirm"))) return;
    try {
      const res = await fetch(`/api/admin/showcase/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || t("showcase_save_error"));
        return;
      }
      await load();
    } catch (err) {
      console.error(err);
      alert(t("showcase_save_error"));
    }
  };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t("showcase_title")}</h2>
        <button
            onClick={startNew}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> {t("showcase_new_product")}
          </button>
        </div>

        {!editing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="border rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2"
              >
                <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-32 object-contain bg-slate-50 rounded-lg"
                  />
                  <div className="font-semibold">
                    {isAdminEn && p.nameEn ? p.nameEn : p.name}
                  </div>
                  {!isAdminEn && p.nameEn && (
                    <div className="text-xs text-slate-400" dir="ltr">
                      {p.nameEn}
                    </div>
                  )}
                <div className="text-sm text-slate-500">
                  {p.hotspots.length} {t("showcase_hotspots_count")}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setEditing(p)}
                    className="flex-1 text-sm border rounded-lg py-1.5 hover:bg-slate-50"
                  >
                    {t("showcase_edit")}
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-sm border border-red-200 text-red-600 rounded-lg py-1.5 px-3 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="space-y-5 border rounded-xl p-5 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editing.id ? t("showcase_edit_title") : t("showcase_new_title")}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{t("showcase_name_ar")}</label>
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={t("showcase_name_ar_placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">{t("showcase_name_en")}</label>
                <input
                  value={editing.nameEn}
                  onChange={(e) =>
                    setEditing({ ...editing, nameEn: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={t("showcase_name_en_placeholder")}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">{t("showcase_image_label")}</label>
              <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 w-fit">
                <Upload size={16} />
                <span>{editing.image ? t("showcase_image_change") : t("showcase_image_upload")}</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    e.target.files?.[0] && handleImageUpload(e.target.files[0])
                  }
                />
              </label>
            </div>

            {editing.image && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm">
                    {t("showcase_hotspots_instructions")}
                  </label>
                  <button
                    onClick={() => setPlacingMode(true)}
                    className={`text-sm px-3 py-1.5 rounded-lg border ${
                      placingMode
                        ? "gradient-primary text-white border-transparent"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {placingMode ? t("showcase_placing_active") : t("showcase_add_hotspot")}
                  </button>
                </div>

                <div
                    ref={imageRef}
                    onClick={handleStageClick}
                    className={`relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] ${
                      placingMode ? "cursor-crosshair" : ""
                    }`}
                  >
                    <img
                      ref={imgElRef}
                      src={editing.image}
                      alt={editing.name}
                      onLoad={updateImgRect}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  {editing.hotspots.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          left: `${imgRect.left + (h.positionX / 100) * imgRect.width}px`,
                          top: `${imgRect.top + (h.positionY / 100) * imgRect.height}px`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full gradient-primary text-white text-xs flex items-center justify-center border-2 border-white shadow"
                      >
                        +
                      </div>
                    ))}
                </div>
              </div>
            )}

            {editing.hotspots.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  {t("showcase_hotspots_data_label")}
                </label>
                {editing.hotspots.map((h, idx) => (
                  <div
                    key={h.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">#{idx + 1}</span>
                      <button
                        onClick={() => removeHotspot(h.id)}
                        className="text-red-500 hover:bg-red-50 rounded-lg p-1.5 flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        value={h.title}
                        onChange={(e) =>
                          updateHotspot(h.id, { title: e.target.value })
                        }
                        placeholder={t("showcase_hotspot_title_ar")}
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={h.titleEn}
                        onChange={(e) =>
                          updateHotspot(h.id, { titleEn: e.target.value })
                        }
                        placeholder={t("showcase_hotspot_title_en")}
                        className="border rounded-lg px-3 py-2 text-sm"
                        dir="ltr"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        value={h.description}
                        onChange={(e) =>
                          updateHotspot(h.id, { description: e.target.value })
                        }
                        placeholder={t("showcase_hotspot_desc_ar")}
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={h.descriptionEn}
                        onChange={(e) =>
                          updateHotspot(h.id, { descriptionEn: e.target.value })
                        }
                        placeholder={t("showcase_hotspot_desc_en")}
                        className="border rounded-lg px-3 py-2 text-sm"
                        dir="ltr"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="gradient-primary text-white px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? t("showcase_saving") : t("showcase_save")}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="border px-5 py-2 rounded-lg hover:bg-slate-50"
              >
                {t("showcase_cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }