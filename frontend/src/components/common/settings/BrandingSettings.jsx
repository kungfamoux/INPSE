import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Upload, Image, Palette, ExternalLink, CheckCircle } from "lucide-react";

const FIELDS = [
  {
    key: "primaryLogoUrl",
    label: "Primary Logo",
    hint: "Used in website navbar, portal sidebar, and login page. SVG or PNG recommended.",
    usage: ["Website Navbar", "Portal Sidebar", "Login Page"],
  },
  {
    key: "secondaryLogoUrl",
    label: "Secondary Logo",
    hint: "Used in the website footer. Falls back to Primary Logo if empty.",
    usage: ["Website Footer"],
  },
  {
    key: "portalSidebarLogoUrl",
    label: "Portal Sidebar Logo (Override)",
    hint: "Optional. Overrides Primary Logo in the portal sidebar only.",
    usage: ["Portal Sidebar Override"],
  },
  {
    key: "reportCardLogoUrl",
    label: "Report Card Logo (Override)",
    hint: "Optional. Overrides Primary Logo on PDF report cards.",
    usage: ["PDF Report Cards"],
  },
  {
    key: "documentLogoUrl",
    label: "Document Logo",
    hint: "Used on all printed documents: invoices, receipts, and report cards. Falls back to Primary Logo if empty. SVG or high-resolution PNG recommended.",
    usage: ["Invoices", "Receipts", "Report Cards"],
  },
  {
    key: "faviconUrl",
    label: "Favicon",
    hint: "Small icon shown in browser tabs. ICO, PNG, or SVG.",
    usage: ["Browser Tab"],
  },
];

export default function BrandingSettings({ currentUser }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    schoolName: "",
    primaryLogoUrl: "",
    secondaryLogoUrl: "",
    portalSidebarLogoUrl: "",
    reportCardLogoUrl: "",
    faviconUrl: "",
    brandPrimaryColor: "#f97316",
    brandSecondaryColor: "#ec4899",
  });
  const [uploading, setUploading] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: brandings = [] } = useQuery({
    queryKey: ["school-branding"],
    queryFn: () => base44.entities.SchoolBranding.list("-created_date", 1),
  });

  const existing = brandings[0] || null;

  useEffect(() => {
    if (existing) {
      setForm({
        schoolName: existing.schoolName || "",
        primaryLogoUrl: existing.primaryLogoUrl || "",
        secondaryLogoUrl: existing.secondaryLogoUrl || "",
        portalSidebarLogoUrl: existing.portalSidebarLogoUrl || "",
        reportCardLogoUrl: existing.reportCardLogoUrl || "",
        faviconUrl: existing.faviconUrl || "",
        brandPrimaryColor: existing.brandPrimaryColor || "#f97316",
        brandSecondaryColor: existing.brandSecondaryColor || "#ec4899",
      });
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existing) {
        return base44.entities.SchoolBranding.update(existing.id, data);
      } else {
        return base44.entities.SchoolBranding.create(data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(["school-branding"]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleUpload = async (field, file) => {
    setUploading((prev) => ({ ...prev, [field]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((prev) => ({ ...prev, [field]: file_url }));
    setUploading((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <div className="space-y-6">
      {/* School Name */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-orange-500" />
          School Identity
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">School Name</label>
            <Input
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              placeholder="e.g. International Nursery and Primary School Enugu (INPSE)"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandPrimaryColor}
                  onChange={(e) => setForm({ ...form, brandPrimaryColor: e.target.value })}
                  className="w-10 h-9 rounded cursor-pointer border border-gray-200"
                />
                <Input
                  value={form.brandPrimaryColor}
                  onChange={(e) => setForm({ ...form, brandPrimaryColor: e.target.value })}
                  className="font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandSecondaryColor}
                  onChange={(e) => setForm({ ...form, brandSecondaryColor: e.target.value })}
                  className="w-10 h-9 rounded cursor-pointer border border-gray-200"
                />
                <Input
                  value={form.brandSecondaryColor}
                  onChange={(e) => setForm({ ...form, brandSecondaryColor: e.target.value })}
                  className="font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Fields */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Image className="w-5 h-5 text-orange-500" />
          Logos
        </h3>
        <div className="space-y-6">
          {FIELDS.map((field) => (
            <div key={field.key} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{field.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {field.usage.map((u) => (
                      <span key={u} className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-medium rounded-full">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
                {form[field.key] && (
                  <div className="flex-shrink-0 w-16 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={form[field.key]}
                      alt={field.label}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder="Paste URL (https://...) or upload →"
                  className="text-sm flex-1"
                />
                <label className="cursor-pointer">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                    {uploading[field.key] ? (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload
                  </div>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(field.key, e.target.files[0])}
                  />
                </label>
                {form[field.key] && (
                  <a href={form[field.key]} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white gap-2 px-8"
        >
          {saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : saveMutation.isPending ? (
            "Saving..."
          ) : (
            <><Save className="w-4 h-4" /> Save Branding</>
          )}
        </Button>
      </div>
    </div>
  );
}