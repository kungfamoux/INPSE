import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const base44 = createClientFromRequest(req);

    const { event, data, old_data } = payload;
    if (!data) return Response.json({ ok: true, skipped: "no data" });

    // Only act on absent/late status; skip if status unchanged
    const newStatus = data.status;
    const oldStatus = old_data?.status;
    if (newStatus === oldStatus) return Response.json({ ok: true, skipped: "status unchanged" });
    if (!["absent", "late"].includes(newStatus)) return Response.json({ ok: true, skipped: "not absent/late" });

    const studentId = data.student_id;
    if (!studentId) return Response.json({ ok: true, skipped: "no student_id" });

    // Fetch student info
    let student;
    try {
      student = await base44.asServiceRole.entities.Student.get(studentId);
    } catch (_) { student = null; }
    if (!student) return Response.json({ ok: true, skipped: "student not found" });

    const studentName = `${student.first_name} ${student.last_name}`;
    const date = data.date || new Date().toISOString().split("T")[0];

    // --- 1. Notify parents ---
    const parentEmails = [student.parent_email, student.parent_email_2].filter(Boolean);
    const statusLabel = newStatus === "absent" ? "absent" : "late";
    const statusEmoji = newStatus === "absent" ? "⚠️" : "🕐";

    for (const email of parentEmails) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `${statusEmoji} Attendance Alert: ${studentName} is ${statusLabel} today`,
        body: `
Dear Parent/Guardian,

This is an automated notification to let you know that your child, <strong>${studentName}</strong>, was marked <strong>${statusLabel}</strong> for school on <strong>${date}</strong>.

If you believe this is an error or would like to provide an excuse note, please contact the school directly.

Regards,<br/>
School Attendance System
        `.trim(),
      });
    }

    // --- 2. Check absence rate and alert admins if > 20% ---
    const allRecords = await base44.asServiceRole.entities.AttendanceRecord.filter({ student_id: studentId });
    const total = allRecords.length;
    const absentCount = allRecords.filter(r => r.status === "absent").length;
    const absentRate = total > 0 ? (absentCount / total) * 100 : 0;

    if (absentRate > 20 && total >= 5) {
      // Find admin UserAccounts
      const adminAccounts = await base44.asServiceRole.entities.UserAccount.filter({ account_status: "active" });
      const adminEmails = adminAccounts
        .filter(a => ["admin", "proprietor"].includes(a.role))
        .map(a => a.user_email)
        .filter(Boolean);

      for (const email of adminEmails) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: `🚨 Absenteeism Alert: ${studentName} has ${Math.round(absentRate)}% absence rate`,
          body: `
Dear Administrator,

This is an automated alert regarding <strong>${studentName}</strong>.

Their current absence rate has exceeded the 20% threshold:
- <strong>Total recorded days:</strong> ${total}
- <strong>Days absent:</strong> ${absentCount}
- <strong>Absence rate:</strong> ${Math.round(absentRate)}%

Please review this student's attendance record and consider reaching out to the parent/guardian.

Regards,<br/>
School Attendance System
          `.trim(),
        });
      }

      // Also create an in-app notification for admins
      for (const account of adminAccounts.filter(a => ["admin", "proprietor"].includes(a.role))) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: account.user_email,
          title: `Absenteeism Alert: ${studentName}`,
          message: `${studentName} now has a ${Math.round(absentRate)}% absence rate (${absentCount}/${total} days).`,
          type: "warning",
          is_read: false,
          link: "/AdminAttendance",
        });
      }
    }

    return Response.json({
      ok: true,
      student: studentName,
      status: newStatus,
      parentNotified: parentEmails.length,
      absentRate: Math.round(absentRate),
      adminAlerted: absentRate > 20 && total >= 5,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});