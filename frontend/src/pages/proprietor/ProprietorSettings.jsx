import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings, Lock, Unlock, Save, School, Calendar, BookOpen,
  CreditCard, ShieldCheck, Plus, Pencil, Trash2, GraduationCap,
  Palette, Upload, Image
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BrandingSettings from "@/components/settings/BrandingSettings";

const DEFAULT_GRADES = [
  { label: "A1", min_score: 75, max_score: 100, remark: "Excellent", gp: 5 },
  { label: "B2", min_score: 70, max_score: 74, remark: "Very Good", gp: 4 },
  { label: "B3", min_score: 65, max_score: 69, remark: "Good", gp: 3 },
  { label: "C4", min_score: 60, max_score: 64, remark: "Credit", gp: 2 },
  { label: "C5", min_score: 55, max_score: 59, remark: "Credit", gp: 2 },
  { label: "C6", min_score: 50, max_score: 54, remark: "Credit", gp: 2 },
  { label: "D7", min_score: 45, max_score: 49, remark: "Pass", gp: 1 },
  { label: "E8", min_score: 40, max_score: 44, remark: "Pass", gp: 1 },
  { label: "F9", min_score: 0, max_score: 39, remark: "Fail", gp: 0 },
];

export default function ProprietorSettings({ currentUser }) {
  const qc = useQueryClient();
  const [gradingForm, setGradingForm] = useState({ name: "Standard Nigerian", grades: DEFAULT_GRADES, ca_weight: 40, exam_weight: 60, is_default: true });
  const [saved, setSaved] = useState(false);

  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: () => base44.entities.AcademicSession.list("-created_date", 20) });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list("-created_date", 20) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list("name", 50) });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: () => base44.entities.Subject.list("name", 100) });
  const { data: gradings = [] } = useQuery({ queryKey: ["gradings"], queryFn: () => base44.entities.GradingSystem.list("-created_date", 10) });
  const { data: settings = [] } = useQuery({ queryKey: ["school-settings"], queryFn: () => base44.entities.SchoolSettings.list() });

  const saveGrading = useMutation({
    mutationFn: (data) => base44.entities.GradingSystem.create(data),
    onSuccess: () => { qc.invalidateQueries(["gradings"]); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const toggleLock = useMutation({
    mutationFn: ({ id, is_locked }) => base44.entities.SchoolSettings.update(id, { is_locked, locked_by: currentUser?.email }),
    onSuccess: () => qc.invalidateQueries(["school-settings"]),
  });

  const settingsByCategory = settings.reduce((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">School Setup & Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Configure academic structure, grading, and security locks</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1 gap-1 flex-wrap h-auto">
          <TabsTrigger value="overview" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Branding</TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Sessions & Terms</TabsTrigger>
          <TabsTrigger value="classes" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Classes & Subjects</TabsTrigger>
          <TabsTrigger value="grading" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Grading System</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Security & Locks</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Academic Sessions", value: sessions.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", current: sessions.find(s=>s.is_current)?.name },
              { label: "Current Term", value: terms.filter(t=>t.is_current).length > 0 ? terms.find(t=>t.is_current)?.name : "Not Set", icon: BookOpen, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Classes", value: classes.length, icon: School, color: "text-green-600", bg: "bg-green-50" },
              { label: "Subjects", value: subjects.length, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                {item.current && <p className="text-xs text-orange-500 mt-1">Current: {item.current}</p>}
              </div>
            ))}
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-700">
            <strong>Tip:</strong> Use the tabs above to configure Sessions & Terms, Classes, Subjects, the Grading System, and security lock controls. Changes here affect the entire school management system.
          </div>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="mt-4">
          <BrandingSettings currentUser={currentUser} />
        </TabsContent>

        {/* Sessions & Terms */}
        <TabsContent value="sessions" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Academic Sessions</h3>
                <Badge className="bg-orange-100 text-orange-700">{sessions.length} total</Badge>
              </div>
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.start_date} → {s.end_date}</p>
                    </div>
                    {s.is_current && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No sessions yet. Go to Sessions & Terms in Admin to add.</p>}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Terms</h3>
                <Badge className="bg-blue-100 text-blue-700">{terms.length} total</Badge>
              </div>
              <div className="space-y-2">
                {terms.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.start_date} → {t.end_date}</p>
                    </div>
                    {t.is_current && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                  </div>
                ))}
                {terms.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No terms configured yet.</p>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Classes & Subjects */}
        <TabsContent value="classes" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">School Classes</h3>
                <Badge className="bg-orange-100 text-orange-700">{classes.length} classes</Badge>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {classes.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name} {c.arm}</p>
                      <p className="text-xs text-gray-400 capitalize">{c.level?.replace("_"," ")} · Cap: {c.capacity || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Subjects</h3>
                <Badge className="bg-blue-100 text-blue-700">{subjects.length} subjects</Badge>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {subjects.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.code} · <span className="capitalize">{s.level?.replace("_"," ")}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Grading System */}
        <TabsContent value="grading" className="mt-4 space-y-4">
          {gradings.map(g => (
            <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{g.name}</h3>
                  {g.is_default && <Badge className="bg-green-100 text-green-700 text-xs">Default</Badge>}
                </div>
                <p className="text-xs text-gray-400">CA {g.ca_weight}% / Exam {g.exam_weight}%</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(g.grades || []).map((gr, i) => (
                  <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="font-bold text-gray-900 text-sm">{gr.label}</p>
                    <p className="text-[10px] text-gray-400">{gr.min_score}–{gr.max_score}</p>
                    <p className="text-[10px] text-orange-500">{gr.remark}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Create new grading */}
          <div className="bg-white rounded-2xl border border-dashed border-orange-300 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Create Grading System</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Name</label>
                <Input value={gradingForm.name} onChange={e => setGradingForm({...gradingForm, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">CA Weight (%)</label>
                <Input type="number" value={gradingForm.ca_weight} onChange={e => setGradingForm({...gradingForm, ca_weight: +e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Exam Weight (%)</label>
                <Input type="number" value={gradingForm.exam_weight} onChange={e => setGradingForm({...gradingForm, exam_weight: +e.target.value})} />
              </div>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 bg-gray-50"><th className="p-2 text-left">Grade</th><th className="p-2">Min</th><th className="p-2">Max</th><th className="p-2">Remark</th><th className="p-2">GP</th></tr></thead>
                <tbody>
                  {gradingForm.grades.map((g, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="p-2 font-bold">{g.label}</td>
                      <td className="p-2 text-center">{g.min_score}</td>
                      <td className="p-2 text-center">{g.max_score}</td>
                      <td className="p-2 text-center">{g.remark}</td>
                      <td className="p-2 text-center">{g.gp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={() => saveGrading.mutate(gradingForm)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white gap-2">
              <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Grading System"}
            </Button>
          </div>
        </TabsContent>

        {/* Security & Locks */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800">Proprietor Lock Controls</p>
                <p className="text-xs text-orange-600 mt-1">Lock settings prevent other admins from modifying critical configurations. Only the Proprietor can lock/unlock.</p>
              </div>
            </div>
          </div>
          {[
            { key: "results_locked", label: "Results Editing", description: "Prevent teachers/admins from modifying approved results", category: "results" },
            { key: "fees_locked", label: "Fee Structure", description: "Lock fee amounts from being changed mid-term", category: "fees" },
            { key: "admissions_locked", label: "Admissions Portal", description: "Close admissions to new applications", category: "academic" },
            { key: "store_locked", label: "School Store", description: "Take store offline for maintenance", category: "store" },
          ].map(cfg => {
            const setting = settings.find(s => s.key === cfg.key);
            return (
              <div key={cfg.key} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {setting?.is_locked ? <Lock className="w-5 h-5 text-red-500" /> : <Unlock className="w-5 h-5 text-green-500" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
                    <p className="text-xs text-gray-400">{cfg.description}</p>
                    {setting?.locked_by && <p className="text-xs text-orange-500 mt-0.5">Locked by: {setting.locked_by}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={setting?.is_locked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                    {setting?.is_locked ? "LOCKED" : "OPEN"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={async () => {
                    if (setting) {
                      await toggleLock.mutate({ id: setting.id, is_locked: !setting.is_locked });
                    } else {
                      await base44.entities.SchoolSettings.create({ key: cfg.key, value: "locked", category: cfg.category, is_locked: true, locked_by: currentUser?.email, description: cfg.description });
                      qc.invalidateQueries(["school-settings"]);
                    }
                  }}>
                    {setting?.is_locked ? "Unlock" : "Lock"}
                  </Button>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}