import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReportCardButton({ studentId, termId, termName, studentName, variant = "outline", size = "sm" }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!studentId || !termId) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateReportCard", { student_id: studentId, term_id: termId });
      const { pdf, fileName } = res.data;
      if (!pdf) throw new Error("No PDF returned");

      // Trigger browser download
      const link = document.createElement("a");
      link.href = pdf;
      link.download = fileName || `ReportCard.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to generate report card: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleDownload} disabled={loading} className="gap-1.5">
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
      {loading ? "Generating..." : `Download Report Card`}
      {!loading && <Download className="w-3 h-3 opacity-60" />}
    </Button>
  );
}