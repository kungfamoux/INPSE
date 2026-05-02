import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save, CheckCircle, ImageIcon, Upload, X, Check } from "lucide-react";

function GalleryPicker({ currentUrl, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["gallery-items-picker"],
    queryFn: () => base44.entities.GalleryItem.filter({ is_published: true }, "-created_date", 100),
  });

  const filtered = items.filter(i =>
    !search || (i.caption || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <h3 className="font-bold text-gray-900">Select from Gallery</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-4 border-b flex-shrink-0">
          <Input placeholder="Search by caption..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No gallery images found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.image_url); onClose(); }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:opacity-90 ${currentUrl === item.image_url ? "border-orange-500 ring-2 ring-orange-200" : "border-transparent"}`}
                >
                  <img src={item.image_url} alt={item.caption} className="w-full h-full object-cover" />
                  {currentUrl === item.image_url && (
                    <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-orange-600 bg-white rounded-full p-1" />
                    </div>
                  )}
                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                      <p className="text-white text-[10px] truncate">{item.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageField({ label, hint, fieldKey, value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <>
      <div className="border border-gray-100 rounded-xl p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        </div>
        {value && (
          <div className="h-40 rounded-xl overflow-hidden border border-gray-100">
            <img src={value} alt={label} className="w-full h-full object-cover" />
          </div>
        )}
        {!value && (
          <div className="h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder="https://... or pick from gallery →"
            className="flex-1 text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => setShowPicker(true)} className="flex-shrink-0 gap-1">
            <ImageIcon className="w-4 h-4" /> Gallery
          </Button>
          <label className="cursor-pointer flex-shrink-0">
            <div className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-sm text-gray-700 h-9">
              {uploading ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </label>
        </div>
      </div>
      {showPicker && (
        <GalleryPicker
          currentUrl={value}
          onSelect={onChange}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

const DEFAULTS = {
  missionText: "To provide an inclusive, innovative, and inspiring learning environment that empowers every student to achieve academic excellence, develop strong moral character, and become responsible global citizens.",
  missionImageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  visionText: "To be the leading institution of learning in Africa, recognized for producing graduates who are intellectually equipped, morally sound, and prepared to make a positive impact on society.",
  visionImageUrl: "",
};

export default function AboutPageEditor() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(DEFAULTS);

  const { data: list = [] } = useQuery({
    queryKey: ["about-page-config"],
    queryFn: () => base44.entities.AboutPageConfig.list("-created_date", 1),
  });
  const existing = list[0] || null;

  useEffect(() => {
    if (existing) setForm({ ...DEFAULTS, ...existing });
  }, [existing]);

  const saveMut = useMutation({
    mutationFn: (d) => existing ? base44.entities.AboutPageConfig.update(existing.id, d) : base44.entities.AboutPageConfig.create(d),
    onSuccess: () => { qc.invalidateQueries(["about-page-config"]); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h3 className="font-semibold text-gray-900">Mission &amp; Vision Section</h3>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Mission Text</label>
          <Textarea value={form.missionText} onChange={e => set("missionText", e.target.value)} rows={3} />
        </div>

        <ImageField
          label="Mission / Vision Image"
          hint="Displayed on the left beside both Mission and Vision text blocks."
          fieldKey="missionImageUrl"
          value={form.missionImageUrl}
          onChange={v => set("missionImageUrl", v)}
        />

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Vision Text</label>
          <Textarea value={form.visionText} onChange={e => set("visionText", e.target.value)} rows={3} />
        </div>

        <ImageField
          label="Vision Image (optional)"
          hint="If set, this image replaces the main image specifically for the Vision block on larger screens."
          fieldKey="visionImageUrl"
          value={form.visionImageUrl}
          onChange={v => set("visionImageUrl", v)}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-8">
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" />Saved!</> : saveMut.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save</>}
        </Button>
      </div>
    </div>
  );
}