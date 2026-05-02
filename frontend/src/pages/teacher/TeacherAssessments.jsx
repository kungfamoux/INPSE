import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { logAudit } from "../utils/auditLogger";

function calcGrade(total) {
  if (total >= 70) return { grade: "A", remark: "Excellent" };
  if (total >= 60) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Good" };
  if (total >= 45) return { grade: "D", remark: "Fair" };
  if (total >= 40) return { grade: "E", remark: "Pass" };
  return { grade: "F", remark: "Fail" };
}

export default function TeacherAssessments({ currentUser }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);

  const qc = useQueryClient();
  const { data: staff = [] } = useQuery({ queryKey: ["my-staff"], queryFn: () => base44.entities.Staff.filter({ user_email: currentUser?.email }) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: () => base44.entities.Subject.list() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list() });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.filter({ status: "active" }) });
  const { data: existingAssessments = [] } = useQuery({
    queryKey: ["assessments", selectedClass, selectedSubject, selectedTerm],
    queryFn: () => base44.entities.Assessment.filter({ class_id: selectedClass, subject_id: selectedSubject, term_id: selectedTerm }),
    enabled: !!selectedClass && !!selectedSubject && !!selectedTerm,
  });

  const myStaff = staff[0];
  const myClassIds = myStaff?.classes || [];
  const mySubjectIds = myStaff?.subjects || [];
  const myClasses = classes.filter(c => myClassIds.includes(c.id));
  const mySubjects = subjects.filter(s => mySubjectIds.includes(s.id));
  const classStudents = students.filter(s => s.class_id === selectedClass);

  React.useEffect(() => {
    const s = {};
    classStudents.forEach(st => {
      const ex = existingAssessments.find(a => a.student_id === st.id);
      s[st.id] = ex ? { ca1: ex.ca1 || "", ca2: ex.ca2 || "", exam: ex.exam || "", teacher_comment: ex.teacher_comment || "", id: ex.id } : { ca1: "", ca2: "", exam: "", teacher_comment: "" };
    });
    setScores(s);
  }, [existingAssessments, selectedClass, students]);

  const updateScore = (studentId, field, value) => {
    setScores(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  };

  const getTotal = (s) => (Number(s.ca1) || 0) + (Number(s.ca2) || 0) + (Number(s.exam) || 0);

  const handleSave = async () => {
    setSaving(true);
    const currentTerm = terms.find(t => t.id === selectedTerm);
    for (const student of classStudents) {
      const s = scores[student.id];
      if (!s) continue;
      const total = getTotal(s);
      const { grade, remark } = calcGrade(total);
      const data = {
        student_id: student.id, subject_id: selectedSubject, class_id: selectedClass,
        term_id: selectedTerm, session_id: currentTerm?.session_id || "",
        ca1: Number(s.ca1) || 0, ca2: Number(s.ca2) || 0, exam: Number(s.exam) || 0,
        total, grade, remark, teacher_comment: s.teacher_comment || "", teacher_id: myStaff?.id || ""
      };
      if (s.id) {
        await base44.entities.Assessment.update(s.id, data);
      } else {
        await base44.entities.Assessment.create(data);
      }
    }
    qc.invalidateQueries({ queryKey: ["assessments"] });
    logAudit(currentUser, { action: "SAVE_ASSESSMENTS", module: "Assessments", entity_type: "Assessment", summary: `Saved assessments for ${classStudents.length} students — class ${selectedClass}, subject ${selectedSubject}, term ${selectedTerm}`, new_values: { class_id: selectedClass, subject_id: selectedSubject, term_id: selectedTerm, student_count: classStudents.length } });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
          <SelectContent>{myClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="Select subject" /></SelectTrigger>
          <SelectContent>{mySubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="Select term" /></SelectTrigger>
          <SelectContent>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {selectedClass && selectedSubject && selectedTerm && classStudents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <p className="text-sm text-gray-500">{classStudents.length} students</p>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save All"}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">CA1 (20)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">CA2 (20)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">Exam (60)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">Total</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">Grade</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">Remark</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-left">Teacher's Comment</th>
                  </tr>
              </thead>
              <tbody className="divide-y">
                {classStudents.map(st => {
                  const s = scores[st.id] || { ca1: "", ca2: "", exam: "" };
                  const total = getTotal(s);
                  const { grade, remark } = calcGrade(total);
                  return (
                    <tr key={st.id}>
                      <td className="px-4 py-3 font-medium">{st.first_name} {st.last_name}</td>
                      <td className="px-4 py-2 text-center"><Input type="number" min="0" max="20" value={s.ca1} onChange={e => updateScore(st.id, "ca1", e.target.value)} className="w-16 text-center h-8 mx-auto" /></td>
                      <td className="px-4 py-2 text-center"><Input type="number" min="0" max="20" value={s.ca2} onChange={e => updateScore(st.id, "ca2", e.target.value)} className="w-16 text-center h-8 mx-auto" /></td>
                      <td className="px-4 py-2 text-center"><Input type="number" min="0" max="60" value={s.exam} onChange={e => updateScore(st.id, "exam", e.target.value)} className="w-16 text-center h-8 mx-auto" /></td>
                      <td className="px-4 py-2 text-center font-bold">{total || "—"}</td>
                      <td className="px-4 py-2 text-center font-bold">{total ? grade : "—"}</td>
                      <td className="px-4 py-2 text-center text-gray-500">{total ? remark : "—"}</td>
                      <td className="px-4 py-2">
                        <Textarea
                          placeholder="Optional comment…"
                          value={s.teacher_comment || ""}
                          onChange={e => updateScore(st.id, "teacher_comment", e.target.value)}
                          className="min-h-[40px] h-10 text-xs resize-none"
                          rows={1}
                        />
                      </td>
                      </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}