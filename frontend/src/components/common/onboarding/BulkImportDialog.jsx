import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const TEMPLATE_HEADERS = "first_name,last_name,admission_no,gender,date_of_birth,class_name,parent_name,parent_email,parent_phone";

export default function BulkImportDialog({ open, onClose, classes = [] }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_HEADERS + "\n"], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "students_import_template.csv";
    a.click();
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const fileUrl = await base44.integrations.Core.UploadFile({ file });
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl.file_url,
      json_schema: {
        type: "object",
        properties: {
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                first_name: { type: "string" },
                last_name: { type: "string" },
                admission_no: { type: "string" },
                gender: { type: "string" },
                date_of_birth: { type: "string" },
                class_name: { type: "string" },
                parent_name: { type: "string" },
                parent_email: { type: "string" },
                parent_phone: { type: "string" },
              }
            }
          }
        }
      }
    });

    if (extracted.status !== "success") {
      setResult({ error: extracted.details || "Failed to parse file" });
      setLoading(false);
      return;
    }

    const rows = extracted.output?.rows || extracted.output || [];
    const classMap = Object.fromEntries(classes.map(c => [c.name.toLowerCase().trim(), c.id]));

    let created = 0;
    let errors = [];
    for (const row of rows) {
      if (!row.first_name || !row.last_name) { errors.push(`Row missing name`); continue; }
      const classId = classMap[row.class_name?.toLowerCase().trim()] || undefined;
      await base44.entities.Student.create({
        first_name: row.first_name,
        last_name: row.last_name,
        admission_no: row.admission_no || "",
        gender: row.gender?.toLowerCase(),
        date_of_birth: row.date_of_birth || "",
        class_id: classId,
        parent_email: row.parent_email || "",
        status: "active",
      });
      // Auto-invite parent if email present
      if (row.parent_email) {
        try {
          await base44.users.inviteUser(row.parent_email, "user");
          await base44.entities.UserAccount.create({
            user_email: row.parent_email,
            role: "parent",
            account_status: "pending_activation",
            must_change_password: true,
            notes: `Auto-created via bulk import for ${row.first_name} ${row.last_name}`,
          });
        } catch (_) { /* already invited */ }
      }
      created++;
    }
    setResult({ created, total: rows.length, errors });
    setLoading(false);
  };

  const handleClose = () => { setFile(null); setResult(null); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-orange-500" /> Bulk Import Students
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Import instructions:</p>
            <ul className="list-disc ml-4 space-y-0.5">
              <li>Upload a CSV file with student and parent data.</li>
              <li>Parent accounts will be auto-invited via email.</li>
              <li>Download the template below to see required columns.</li>
            </ul>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Download CSV Template
          </Button>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            {file ? (
              <p className="text-sm text-gray-700 font-medium">{file.name}</p>
            ) : (
              <p className="text-sm text-gray-400">Select a CSV file to upload</p>
            )}
            <input type="file" accept=".csv" className="hidden" id="bulk-csv"
              onChange={e => setFile(e.target.files[0])} />
            <label htmlFor="bulk-csv">
              <Button asChild variant="outline" size="sm" className="mt-3 cursor-pointer">
                <span>Browse File</span>
              </Button>
            </label>
          </div>

          {result && (
            <div className={`rounded-xl p-3 text-sm ${result.error ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700"}`}>
              {result.error ? (
                <p className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {result.error}</p>
              ) : (
                <div>
                  <p className="flex items-center gap-2 font-semibold"><CheckCircle className="w-4 h-4" /> Import complete</p>
                  <p className="mt-1">{result.created}/{result.total} students created.</p>
                  {result.errors?.length > 0 && <p className="text-red-600 mt-1">{result.errors.length} row(s) skipped.</p>}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>Close</Button>
            <Button onClick={handleImport} disabled={!file || loading}
              className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}