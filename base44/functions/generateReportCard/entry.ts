import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

function calcGrade(total) {
  if (total >= 70) return { grade: "A", remark: "Excellent" };
  if (total >= 60) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Good" };
  if (total >= 45) return { grade: "D", remark: "Fair" };
  if (total >= 40) return { grade: "E", remark: "Pass" };
  return { grade: "F", remark: "Fail" };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { student_id, term_id } = await req.json();
    if (!student_id || !term_id) return Response.json({ error: "student_id and term_id are required" }, { status: 400 });

    // Fetch all required data in parallel
    const [student, assessments, subjects, terms, sessions, classes, brandingList, settingsList] = await Promise.all([
      base44.asServiceRole.entities.Student.get(student_id),
      base44.asServiceRole.entities.Assessment.filter({ student_id, term_id }),
      base44.asServiceRole.entities.Subject.list(),
      base44.asServiceRole.entities.Term.list(),
      base44.asServiceRole.entities.AcademicSession.list(),
      base44.asServiceRole.entities.SchoolClass.list(),
      base44.asServiceRole.entities.SchoolBranding.list(),
      base44.asServiceRole.entities.SchoolSettings.list(),
    ]);

    const term = terms.find(t => t.id === term_id);
    const session = sessions.find(s => s.id === term?.session_id);
    const schoolClass = classes.find(c => c.id === student.class_id);
    const branding = brandingList[0] || {};
    const settings = settingsList[0] || {};

    const schoolName = branding.schoolName || settings.school_name || "School Report Card";
    const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));

    // PDF Generation
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;

    // ─── HEADER ───────────────────────────────────────────────
    // Orange/pink gradient header bar
    doc.setFillColor(249, 115, 22); // orange-500
    doc.rect(0, 0, pageW, 38, "F");
    doc.setFillColor(236, 72, 153); // pink-500
    doc.rect(pageW * 0.6, 0, pageW * 0.4, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(schoolName.toUpperCase(), pageW / 2, 14, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("STUDENT REPORT CARD", pageW / 2, 22, { align: "center" });

    const termLabel = term ? `${term.name}${session ? " — " + session.name : ""}` : "All Terms";
    doc.text(termLabel, pageW / 2, 30, { align: "center" });

    // ─── STUDENT INFO BOX ─────────────────────────────────────
    let y = 46;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, contentW, 26, 3, 3, "FD");

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    const col1x = margin + 5;
    const col2x = margin + contentW / 2 + 5;
    const infoY1 = y + 8;
    const infoY2 = y + 16;
    const infoY3 = y + 24;

    doc.text("Student Name:", col1x, infoY1);
    doc.setFont("helvetica", "normal");
    doc.text(`${student.first_name} ${student.last_name}`, col1x + 30, infoY1);

    doc.setFont("helvetica", "bold");
    doc.text("Admission No:", col2x, infoY1);
    doc.setFont("helvetica", "normal");
    doc.text(student.admission_no || "N/A", col2x + 30, infoY1);

    doc.setFont("helvetica", "bold");
    doc.text("Class:", col1x, infoY2);
    doc.setFont("helvetica", "normal");
    doc.text(schoolClass ? `${schoolClass.name}${schoolClass.arm ? " " + schoolClass.arm : ""}` : "N/A", col1x + 14, infoY2);

    doc.setFont("helvetica", "bold");
    doc.text("Term:", col2x, infoY2);
    doc.setFont("helvetica", "normal");
    doc.text(term?.name || "N/A", col2x + 12, infoY2);

    doc.setFont("helvetica", "bold");
    doc.text("Session:", col1x, infoY3);
    doc.setFont("helvetica", "normal");
    doc.text(session?.name || "N/A", col1x + 18, infoY3);

    doc.setFont("helvetica", "bold");
    doc.text("Date Issued:", col2x, infoY3);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString("en-GB"), col2x + 25, infoY3);

    // ─── RESULTS TABLE ────────────────────────────────────────
    y = y + 32;

    // Table header
    const colWidths = [50, 16, 16, 22, 18, 16, 42];
    const colHeaders = ["Subject", "CA1", "CA2", "Exam", "Total", "Grade", "Teacher's Comment"];
    const colX = [margin];
    colWidths.forEach((w, i) => { if (i < colWidths.length - 1) colX.push(colX[i] + w); });

    doc.setFillColor(31, 41, 55);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    colHeaders.forEach((h, i) => {
      const align = i === 0 || i === 6 ? "left" : "center";
      const tx = align === "center" ? colX[i] + colWidths[i] / 2 : colX[i] + 2;
      doc.text(h, tx, y + 5.5, { align });
    });
    y += 8;

    // Table rows
    let totalSum = 0;
    assessments.forEach((a, idx) => {
      const subjectName = subjectMap[a.subject_id] || "Unknown Subject";
      const rowH = 10;
      const isEven = idx % 2 === 0;

      doc.setFillColor(isEven ? 249 : 255, isEven ? 250 : 255, isEven ? 251 : 255);
      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, y, contentW, rowH, "FD");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      doc.text(subjectName, colX[0] + 2, y + 6.5);
      doc.text(String(a.ca1 ?? "—"), colX[1] + colWidths[1] / 2, y + 6.5, { align: "center" });
      doc.text(String(a.ca2 ?? "—"), colX[2] + colWidths[2] / 2, y + 6.5, { align: "center" });
      doc.text(String(a.exam ?? "—"), colX[3] + colWidths[3] / 2, y + 6.5, { align: "center" });

      const total = a.total ?? 0;
      totalSum += total;
      doc.setFont("helvetica", "bold");
      doc.text(String(total || "—"), colX[4] + colWidths[4] / 2, y + 6.5, { align: "center" });

      // Grade with colored background
      if (a.grade) {
        const gradeColors = { A: [187, 247, 208], B: [191, 219, 254], C: [254, 240, 138], D: [254, 215, 170], E: [254, 202, 202], F: [252, 165, 165] };
        const gc = gradeColors[a.grade] || [209, 213, 219];
        doc.setFillColor(gc[0], gc[1], gc[2]);
        doc.roundedRect(colX[5] + 3, y + 2, 10, 6, 1, 1, "F");
        doc.setTextColor(31, 41, 55);
        doc.text(a.grade, colX[5] + 8, y + 6.5, { align: "center" });
      }

      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      const comment = a.teacher_comment || a.remark || "";
      doc.text(comment, colX[6] + 2, y + 6.5, { maxWidth: colWidths[6] - 4 });

      y += rowH;
    });

    // Summary row
    if (assessments.length > 0) {
      const avg = totalSum / assessments.length;
      const overallGrade = calcGrade(avg).grade;
      const overallRemark = calcGrade(avg).remark;

      doc.setFillColor(31, 41, 55);
      doc.rect(margin, y, contentW, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("OVERALL AVERAGE", colX[0] + 2, y + 6);
      doc.text(avg.toFixed(1), colX[4] + colWidths[4] / 2, y + 6, { align: "center" });
      doc.text(overallGrade, colX[5] + 8, y + 6, { align: "center" });
      doc.text(overallRemark, colX[6] + 2, y + 6);
      y += 9;
    }

    // ─── GRADE KEY ─────────────────────────────────────────────
    y += 8;
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, contentW, 16, 2, 2, "FD");

    doc.setTextColor(107, 114, 128);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("GRADING SCALE:", col1x, y + 6);
    doc.setFont("helvetica", "normal");
    const keys = [["A", "70-100 Excellent"], ["B", "60-69 Very Good"], ["C", "50-59 Good"], ["D", "45-49 Fair"], ["E", "40-44 Pass"], ["F", "0-39 Fail"]];
    keys.forEach(([g, label], i) => {
      doc.text(`${g}: ${label}`, col1x + 30 + i * 26, y + 6);
    });

    // ─── REMARKS / SIGNATURE ────────────────────────────────────
    y += 22;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, contentW, 28, 2, 2, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("Class Teacher's Remarks:", col1x, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setDrawColor(209, 213, 219);
    doc.line(col1x + 44, y + 9, col1x + 44 + 70, y + 9);

    doc.setFont("helvetica", "bold");
    doc.text("Class Teacher's Signature:", col1x, y + 18);
    doc.setFont("helvetica", "normal");
    doc.line(col1x + 46, y + 19, col1x + 46 + 70, y + 19);

    doc.setFont("helvetica", "bold");
    doc.text("Principal's Signature:", col2x, y + 18);
    doc.setFont("helvetica", "normal");
    doc.line(col2x + 40, y + 19, col2x + 40 + 50, y + 19);

    // ─── FOOTER ─────────────────────────────────────────────────
    const pageH = 297;
    doc.setFillColor(31, 41, 55);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${schoolName} • Generated on ${new Date().toLocaleDateString("en-GB")} • Confidential`, pageW / 2, pageH - 4.5, { align: "center" });

    // Return PDF as base64
    const pdfBase64 = doc.output("datauristring");
    return Response.json({ pdf: pdfBase64, fileName: `ReportCard_${student.first_name}_${student.last_name}_${term?.name || "Term"}.pdf` });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});