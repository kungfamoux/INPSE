import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, CheckCircle, Upload, Plus, Trash2, MapPin, Phone, Mail, Globe, Menu } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Branding Tab ────────────────────────────────────────────────
function BrandingTab() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState({});
  const [form, setForm] = useState({
    schoolName: "", tagline: "",
    primaryLogoUrl: "", secondaryLogoUrl: "", faviconUrl: "",
    primaryColor: "#f97316", secondaryColor: "#ec4899",
    socialLinks: [], showPoweredBy: false, footerCopyrightOverride: "",
  });

  const { data: list = [] } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => base44.entities.SiteSettings.list("-created_date", 1),
  });
  const existing = list[0] || null;

  useEffect(() => {
    if (existing) {
      setForm({
        schoolName: existing.schoolName || "",
        tagline: existing.tagline || "",
        primaryLogoUrl: existing.primaryLogoUrl || "",
        secondaryLogoUrl: existing.secondaryLogoUrl || "",
        faviconUrl: existing.faviconUrl || "",
        primaryColor: existing.primaryColor || "#f97316",
        secondaryColor: existing.secondaryColor || "#ec4899",
        socialLinks: existing.socialLinks || [],
        showPoweredBy: existing.showPoweredBy || false,
        footerCopyrightOverride: existing.footerCopyrightOverride || "",
      });
    }
  }, [existing]);

  const saveMut = useMutation({
    mutationFn: (d) => existing ? base44.entities.SiteSettings.update(existing.id, d) : base44.entities.SiteSettings.create(d),
    onSuccess: () => { qc.invalidateQueries(["site-settings"]); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const upload = async (field, file) => {
    setUploading(p => ({ ...p, [field]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, [field]: file_url }));
    setUploading(p => ({ ...p, [field]: false }));
  };

  const addSocial = () => setForm(p => ({ ...p, socialLinks: [...p.socialLinks, { platform: "facebook", url: "" }] }));
  const removeSocial = (i) => setForm(p => ({ ...p, socialLinks: p.socialLinks.filter((_, idx) => idx !== i) }));
  const updateSocial = (i, key, val) => setForm(p => {
    const sl = [...p.socialLinks]; sl[i] = { ...sl[i], [key]: val }; return { ...p, socialLinks: sl };
  });

  const LogoField = ({ fieldKey, label, hint }) => (
    <div className="border border-gray-100 rounded-xl p-4">
      <p className="text-sm font-medium text-gray-900 mb-0.5">{label}</p>
      <p className="text-xs text-gray-400 mb-3">{hint}</p>
      <div className="flex gap-2">
        {form[fieldKey] && (
          <div className="w-14 h-10 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={form[fieldKey]} alt={label} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display="none"; }} />
          </div>
        )}
        <Input value={form[fieldKey]} onChange={e => setForm(p => ({ ...p, [fieldKey]: e.target.value }))} placeholder="https://..." className="flex-1 text-sm" />
        <label className="cursor-pointer flex-shrink-0">
          <div className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
            {uploading[fieldKey] ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
          </div>
          <input type="file" accept="image/*,.svg" className="hidden" onChange={e => e.target.files?.[0] && upload(fieldKey, e.target.files[0])} />
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">School Identity</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">School Name</label>
            <Input value={form.schoolName} onChange={e => setForm(p => ({ ...p, schoolName: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Tagline</label>
            <Input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primaryColor} onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-9 rounded cursor-pointer border border-gray-200" />
              <Input value={form.primaryColor} onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))} className="font-mono text-xs" maxLength={7} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondaryColor} onChange={e => setForm(p => ({ ...p, secondaryColor: e.target.value }))} className="w-10 h-9 rounded cursor-pointer border border-gray-200" />
              <Input value={form.secondaryColor} onChange={e => setForm(p => ({ ...p, secondaryColor: e.target.value }))} className="font-mono text-xs" maxLength={7} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Logos</h3>
        <LogoField fieldKey="primaryLogoUrl" label="Primary Logo" hint="Navbar, portal sidebar, login page" />
        <LogoField fieldKey="secondaryLogoUrl" label="Secondary / Footer Logo" hint="Footer (falls back to primary)" />
        <LogoField fieldKey="faviconUrl" label="Favicon" hint="Browser tab icon (ICO/PNG/SVG)" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Social Links</h3>
          <Button size="sm" variant="outline" onClick={addSocial}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </div>
        {form.socialLinks.map((s, i) => (
          <div key={i} className="flex gap-2">
            <Select value={s.platform} onValueChange={v => updateSocial(i, "platform", v)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["facebook","twitter","instagram","youtube","linkedin"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={s.url} onChange={e => updateSocial(i, "url", e.target.value)} placeholder="https://..." className="flex-1" />
            <Button size="icon" variant="ghost" onClick={() => removeSocial(i)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Footer Copyright</h3>
        <Input
          value={form.footerCopyrightOverride}
          onChange={e => setForm(p => ({ ...p, footerCopyrightOverride: e.target.value }))}
          placeholder={`© ${new Date().getFullYear()} ${form.schoolName || "School Name"}. All rights reserved.`}
        />
        <p className="text-xs text-gray-400">Leave blank to use the auto-generated copyright text.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-8">
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" />Saved!</> : saveMut.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Settings</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Contact Tab ─────────────────────────────────────────────────
function ContactTab() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    addressLine1: "", addressLine2: "", country: "",
    phoneDisplay: "", phoneE164: "",
    emailPrimary: "", emailSecondary: "",
    mapEmbedUrl: "", officeHours: "", whatsAppE164: "",
  });

  const { data: list = [] } = useQuery({
    queryKey: ["contact-info"],
    queryFn: () => base44.entities.ContactInfo.list("-created_date", 1),
  });
  const existing = list[0] || null;

  useEffect(() => {
    if (existing) setForm({ ...form, ...existing });
  }, [existing]);

  const saveMut = useMutation({
    mutationFn: (d) => existing ? base44.entities.ContactInfo.update(existing.id, d) : base44.entities.ContactInfo.create(d),
    onSuccess: () => { qc.invalidateQueries(["contact-info"]); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const field = (key, label, placeholder, icon) => (
    <div>
      <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
        {icon && React.cloneElement(icon, { className: "w-3.5 h-3.5" })} {label}
      </label>
      <Input value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-500" />Address</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("addressLine1", "Address Line 1", "17 Hillview, Trans Ekulu")}
          {field("addressLine2", "Address Line 2", "Enugu State")}
          {field("country", "Country", "Nigeria")}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Phone className="w-5 h-5 text-orange-500" />Phone & WhatsApp</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("phoneDisplay", "Display Number", "+234 8161 690 483")}
          {field("phoneE164", "E.164 for tel: links", "+2348161690483")}
          {field("whatsAppE164", "WhatsApp Number (E.164)", "+2348161690483")}
          {field("officeHours", "Office Hours", "Mon–Fri: 8am – 4pm")}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Mail className="w-5 h-5 text-orange-500" />Email</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("emailPrimary", "Primary Email", "info@inpse.com")}
          {field("emailSecondary", "Secondary Email", "inps@yahoo.com")}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Globe className="w-5 h-5 text-orange-500" />Google Maps</h3>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Map Embed URL</label>
          <Input value={form.mapEmbedUrl || ""} onChange={e => setForm(p => ({ ...p, mapEmbedUrl: e.target.value }))} placeholder="https://www.google.com/maps/embed?..." />
          <p className="text-xs text-gray-400 mt-1">Paste the src="" value from Google Maps → Share → Embed a map.</p>
        </div>
        {form.mapEmbedUrl && (
          <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
            <iframe src={form.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Map Preview" />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-8">
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" />Saved!</> : saveMut.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Contact Info</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Menus Tab ────────────────────────────────────────────────────
function MenusTab() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [activeMenu, setActiveMenu] = useState("header");

  const LOCATIONS = [
    { key: "header", label: "Header Navigation" },
    { key: "footerQuickLinks", label: "Footer – Quick Links" },
    { key: "footerPrograms", label: "Footer – Admissions / Programs" },
    { key: "footerLegal", label: "Footer – Legal" },
  ];

  const { data: menus = [] } = useQuery({
    queryKey: ["nav-menus"],
    queryFn: () => base44.entities.NavigationMenu.list(),
  });

  const menuRecord = menus.find(m => m.location === activeMenu);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(menuRecord?.items || []);
  }, [menuRecord, activeMenu]);

  const saveMut = useMutation({
    mutationFn: (data) => menuRecord
      ? base44.entities.NavigationMenu.update(menuRecord.id, data)
      : base44.entities.NavigationMenu.create(data),
    onSuccess: () => { qc.invalidateQueries(["nav-menus"]); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const addItem = () => setItems(p => [...p, { label: "", type: "internal", pathOrUrl: "", openInNewTab: false, sortOrder: p.length, isActive: true }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i, key, val) => setItems(p => { const n = [...p]; n[i] = { ...n[i], [key]: val }; return n; });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map(loc => (
          <button key={loc.key} onClick={() => setActiveMenu(loc.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeMenu === loc.key ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {loc.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{LOCATIONS.find(l => l.key === activeMenu)?.label}</h3>
          <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-4 h-4 mr-1" />Add Item</Button>
        </div>
        {items.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No items yet. Add one above.</p>}
        {items.map((item, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center p-3 bg-gray-50 rounded-xl">
            <Input value={item.label} onChange={e => updateItem(i, "label", e.target.value)} placeholder="Label" className="w-28" />
            <Select value={item.type} onValueChange={v => updateItem(i, "type", v)}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="portal">Portal</SelectItem>
              </SelectContent>
            </Select>
            <Input value={item.pathOrUrl} onChange={e => updateItem(i, "pathOrUrl", e.target.value)} placeholder={item.type === "external" ? "https://..." : "PageName"} className="flex-1 min-w-32" />
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={item.isActive !== false} onChange={e => updateItem(i, "isActive", e.target.checked)} className="rounded" />
              Active
            </label>
            <Button size="icon" variant="ghost" onClick={() => removeItem(i)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => saveMut.mutate({ location: activeMenu, items })} disabled={saveMut.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-8">
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" />Saved!</> : saveMut.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Menu</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function AdminCMSSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Website Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage branding, contact information, and navigation menus.</p>
      </div>
      <Tabs defaultValue="branding">
        <TabsList className="mb-6">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="menus">Navigation Menus</TabsTrigger>
        </TabsList>
        <TabsContent value="branding"><BrandingTab /></TabsContent>
        <TabsContent value="contact"><ContactTab /></TabsContent>
        <TabsContent value="menus"><MenusTab /></TabsContent>
      </Tabs>
    </div>
  );
}