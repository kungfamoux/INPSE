import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, Save, ArrowUp, ArrowDown, ImageIcon, Check } from "lucide-react";

const DEFAULT_FEATURES = [
  { title: "World-Class Curriculum", description: "Our comprehensive curriculum blends national standards with international best practices, preparing students for global opportunities.", image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80", sort_order: 0, is_active: true },
  { title: "Expert Educators", description: "Our passionate team of qualified teachers brings innovation and dedication to every classroom, inspiring a love for learning.", image_url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80", sort_order: 1, is_active: true },
  { title: "Modern Facilities", description: "State-of-the-art science labs, digital libraries, sports complexes, and creative studios provide an enriching environment.", image_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80", sort_order: 2, is_active: true },
];

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

function FeatureModal({ feature, onClose, onSave }) {
  const [form, setForm] = useState(feature || { title: "", description: "", image_url: "", sort_order: 0, is_active: true });
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="font-bold text-gray-900 text-lg">{feature?.id ? "Edit Feature Card" : "New Feature Card"}</h3>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. World-Class Curriculum" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Short description..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Image</label>
              {form.image_url && (
                <div className="h-36 rounded-xl overflow-hidden mb-2 border border-gray-100">
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={form.image_url}
                  onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://... or pick from gallery →"
                  className="flex-1 text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPicker(true)} className="flex-shrink-0 gap-1">
                  <ImageIcon className="w-4 h-4" /> Gallery
                </Button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active !== false} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
              Active (visible on homepage)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => onSave(form)} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showPicker && (
        <GalleryPicker
          currentUrl={form.image_url}
          onSelect={url => setForm(p => ({ ...p, image_url: url }))}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

export default function WhyChooseUsEditor() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: features = [], isLoading } = useQuery({
    queryKey: ["home-feature-cards"],
    queryFn: () => base44.entities.HomeFeatureCard.list("sort_order", 50),
  });

  const saveMut = useMutation({
    mutationFn: (d) => d.id ? base44.entities.HomeFeatureCard.update(d.id, d) : base44.entities.HomeFeatureCard.create(d),
    onSuccess: () => { qc.invalidateQueries(["home-feature-cards"]); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.HomeFeatureCard.delete(id),
    onSuccess: () => qc.invalidateQueries(["home-feature-cards"]),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.HomeFeatureCard.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries(["home-feature-cards"]),
  });

  const moveItem = async (index, dir) => {
    const sorted = [...features].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[targetIndex];
    await Promise.all([
      base44.entities.HomeFeatureCard.update(a.id, { sort_order: b.sort_order ?? targetIndex }),
      base44.entities.HomeFeatureCard.update(b.id, { sort_order: a.sort_order ?? index }),
    ]);
    qc.invalidateQueries(["home-feature-cards"]);
  };

  const seedDefaults = async () => {
    for (let i = 0; i < DEFAULT_FEATURES.length; i++) {
      await base44.entities.HomeFeatureCard.create({ ...DEFAULT_FEATURES[i], sort_order: i });
    }
    qc.invalidateQueries(["home-feature-cards"]);
  };

  const sorted = [...features].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (isLoading) return <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{sorted.length} card{sorted.length !== 1 ? "s" : ""} · shown on homepage "Why Choose Us" section</p>
        <div className="flex gap-2">
          {sorted.length === 0 && (
            <Button size="sm" variant="outline" onClick={seedDefaults}>Load Defaults</Button>
          )}
          <Button size="sm" onClick={() => setModal({ sort_order: sorted.length })} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
            <Plus className="w-4 h-4 mr-1" /> Add Card
          </Button>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No feature cards yet. Add one or load the defaults.</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((card, i) => (
          <div key={card.id} className={`bg-white border rounded-xl p-4 flex items-start gap-4 shadow-sm transition-opacity ${card.is_active === false ? "opacity-50" : ""}`}>
            {card.image_url ? (
              <img src={card.image_url} alt={card.title} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-6 h-6 text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm">{card.title}</p>
                <Badge className={card.is_active !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                  {card.is_active !== false ? "Active" : "Hidden"}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{card.description}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveItem(i, -1)} disabled={i === 0}><ArrowUp className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveItem(i, 1)} disabled={i === sorted.length - 1}><ArrowDown className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleMut.mutate({ id: card.id, is_active: !(card.is_active !== false) })}>
                <span className={`w-3 h-3 rounded-full ${card.is_active !== false ? "bg-green-400" : "bg-gray-300"}`} />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setModal(card)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteMut.mutate(card.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && (
        <FeatureModal
          feature={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={(data) => saveMut.mutate(modal?.id ? { ...data, id: modal.id } : data)}
        />
      )}
    </div>
  );
}