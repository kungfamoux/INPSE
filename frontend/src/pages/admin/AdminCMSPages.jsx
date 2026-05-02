import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, CheckCircle, Plus, Trash2, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Upload } from "lucide-react";
import ReactQuill from "react-quill";

const PAGE_SLUGS = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About Us" },
  { slug: "admissions", label: "Admissions" },
  { slug: "programs", label: "Programs" },
  { slug: "contact", label: "Contact" },
  { slug: "results", label: "Results" },
];

const SECTION_TYPES = [
  "richText", "featureGrid", "stats", "testimonials",
  "ctaBanner", "faq", "imageGrid", "leadership", "timeline"
];

function HeroEditor({ hero, onChange }) {
  const set = (key, val) => onChange({ ...hero, [key]: val });
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Hero Title</label>
          <Input value={hero?.title || ""} onChange={e => set("title", e.target.value)} placeholder="Shaping Tomorrow's Leaders" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Hero Subtitle</label>
          <Input value={hero?.subtitle || ""} onChange={e => set("subtitle", e.target.value)} placeholder="A world-class education..." />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Hero Image URL</label>
          <Input value={hero?.imageUrl || ""} onChange={e => set("imageUrl", e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Primary CTA Label</label>
          <Input value={hero?.primaryCtaLabel || ""} onChange={e => set("primaryCtaLabel", e.target.value)} placeholder="Start Enrollment" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Primary CTA Link / Page</label>
          <Input value={hero?.primaryCtaLink || ""} onChange={e => set("primaryCtaLink", e.target.value)} placeholder="Enroll" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Secondary CTA Label</label>
          <Input value={hero?.secondaryCtaLabel || ""} onChange={e => set("secondaryCtaLabel", e.target.value)} placeholder="Learn More" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Secondary CTA Link / Page</label>
          <Input value={hero?.secondaryCtaLink || ""} onChange={e => set("secondaryCtaLink", e.target.value)} placeholder="About" />
        </div>
      </div>
    </div>
  );
}

function SectionRow({ section, index, onChange, onRemove, onMove, total }) {
  const [expanded, setExpanded] = useState(false);
  const set = (key, val) => onChange(index, { ...section, [key]: val });

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${section.isActive !== false ? "border-gray-200" : "border-dashed border-gray-200 opacity-60"}`}>
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <span className="text-xs font-mono bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{section.type}</span>
        <span className="text-sm font-medium text-gray-900 flex-1 truncate">{section.title || "(untitled)"}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(index, -1)} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
          <button onClick={() => onMove(index, 1)} disabled={index === total - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
          <button onClick={() => set("isActive", section.isActive === false ? true : false)} className="p-1 rounded hover:bg-gray-200">
            {section.isActive !== false ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-gray-200">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => onRemove(index)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Section Title</label>
              <Input value={section.title || ""} onChange={e => set("title", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Subtitle</label>
              <Input value={section.subtitle || ""} onChange={e => set("subtitle", e.target.value)} />
            </div>
          </div>
          {(section.type === "richText" || section.type === "ctaBanner") && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Body (Rich Text)</label>
              <ReactQuill value={section.body || ""} onChange={val => set("body", val)} className="bg-white" />
            </div>
          )}
          {section.type === "featureGrid" || section.type === "stats" || section.type === "faq" ? (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">Items (JSON array)</label>
              <Textarea
                value={section.items ? JSON.stringify(section.items, null, 2) : "[]"}
                onChange={e => { try { set("items", JSON.parse(e.target.value)); } catch (_) {} }}
                rows={6} className="font-mono text-xs"
              />
              <p className="text-xs text-gray-400 mt-1">e.g. [{`{"title":"...","description":"...","icon":"BookOpen"}`}]</p>
            </div>
          ) : null}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Image URL (optional)</label>
            <Input value={section.imageUrl || ""} onChange={e => set("imageUrl", e.target.value)} placeholder="https://..." />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCMSPages() {
  const qc = useQueryClient();
  const [activeSlug, setActiveSlug] = useState("home");
  const [form, setForm] = useState({ slug: "home", pageTitle: "", metaTitle: "", metaDescription: "", ogImageUrl: "", status: "draft", hero: {}, sections: [] });
  const [saved, setSaved] = useState(false);

  const { data: pages = [] } = useQuery({
    queryKey: ["cms-pages"],
    queryFn: () => base44.entities.CMSPage.list(),
  });

  const existing = pages.find(p => p.slug === activeSlug) || null;

  useEffect(() => {
    if (existing) {
      setForm({ ...existing });
    } else {
      setForm({ slug: activeSlug, pageTitle: PAGE_SLUGS.find(p => p.slug === activeSlug)?.label || "", metaTitle: "", metaDescription: "", ogImageUrl: "", status: "draft", hero: {}, sections: [] });
    }
  }, [activeSlug, existing]);

  const saveMut = useMutation({
    mutationFn: (d) => existing ? base44.entities.CMSPage.update(existing.id, d) : base44.entities.CMSPage.create(d),
    onSuccess: () => { qc.invalidateQueries(["cms-pages"]); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const addSection = (type) => {
    setForm(p => ({ ...p, sections: [...(p.sections || []), { type, title: "", subtitle: "", body: "", items: [], isActive: true, sortOrder: (p.sections || []).length }] }));
  };

  const updateSection = (idx, sec) => {
    setForm(p => { const s = [...p.sections]; s[idx] = sec; return { ...p, sections: s }; });
  };

  const removeSection = (idx) => {
    setForm(p => ({ ...p, sections: p.sections.filter((_, i) => i !== idx) }));
  };

  const moveSection = (idx, dir) => {
    setForm(p => {
      const s = [...p.sections];
      const target = idx + dir;
      if (target < 0 || target >= s.length) return p;
      [s[idx], s[target]] = [s[target], s[idx]];
      return { ...p, sections: s };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Page Editor</h2>
        <p className="text-gray-500 text-sm mt-1">Edit hero sections and content blocks for each public page.</p>
      </div>

      {/* Page selector */}
      <div className="flex flex-wrap gap-2">
        {PAGE_SLUGS.map(p => {
          const pageRecord = pages.find(r => r.slug === p.slug);
          return (
            <button key={p.slug} onClick={() => setActiveSlug(p.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeSlug === p.slug ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {p.label}
              {pageRecord && (
                <span className={`w-2 h-2 rounded-full ${pageRecord.status === "published" ? "bg-green-400" : "bg-yellow-400"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Page settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Page Settings</h3>
          <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Page Title</label>
            <Input value={form.pageTitle || ""} onChange={e => setForm(p => ({ ...p, pageTitle: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">SEO Meta Title</label>
            <Input value={form.metaTitle || ""} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))} placeholder="Defaults to page title" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 block mb-1">SEO Meta Description</label>
            <Textarea value={form.metaDescription || ""} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))} rows={2} maxLength={160} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">OG Image URL</label>
            <Input value={form.ogImageUrl || ""} onChange={e => setForm(p => ({ ...p, ogImageUrl: e.target.value }))} placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Hero Section</h3>
        <HeroEditor hero={form.hero || {}} onChange={hero => setForm(p => ({ ...p, hero }))} />
      </div>

      {/* Sections */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Content Sections</h3>
          <div className="flex flex-wrap gap-2">
            {SECTION_TYPES.map(type => (
              <button key={type} onClick={() => addSection(type)}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-700 text-xs font-medium text-gray-600 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" />{type}
              </button>
            ))}
          </div>
        </div>
        {(form.sections || []).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No sections yet. Add a block above.</p>
        )}
        <div className="space-y-2">
          {(form.sections || []).map((sec, i) => (
            <SectionRow key={i} section={sec} index={i} onChange={updateSection} onRemove={removeSection} onMove={moveSection} total={form.sections.length} />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-8">
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" />Saved!</> : saveMut.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Page</>}
        </Button>
      </div>
    </div>
  );
}