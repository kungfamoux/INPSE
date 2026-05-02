import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import StatCard from "../components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";

export default function StudentFees({ currentUser }) {
  const { data: students = [] } = useQuery({ queryKey: ["my-student"], queryFn: () => base44.entities.Student.filter({ user_email: currentUser?.email }) });
  const myStudent = students[0];

  const { data: invoices = [] } = useQuery({
    queryKey: ["my-invoices", myStudent?.id],
    queryFn: () => base44.entities.FeeInvoice.filter({ student_id: myStudent?.id }),
    enabled: !!myStudent?.id,
  });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list() });

  const termMap = Object.fromEntries(terms.map(t => [t.id, t.name]));
  const totalBilled = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.paid || 0), 0);
  const statusColors = { unpaid: "bg-red-100 text-red-700", partial: "bg-yellow-100 text-yellow-700", paid: "bg-green-100 text-green-700" };

  const columns = [
    { key: "term", label: "Term", render: r => termMap[r.term_id] || r.term_id },
    { key: "total", label: "Total", render: r => `₦${(r.total || 0).toLocaleString()}` },
    { key: "paid", label: "Paid", render: r => <span className="text-green-600">₦{(r.paid || 0).toLocaleString()}</span> },
    { key: "balance", label: "Balance", render: r => <span className="text-red-600">₦{((r.total || 0) - (r.paid || 0)).toLocaleString()}</span> },
    { key: "status", label: "Status", render: r => <Badge className={`text-xs ${statusColors[r.status]}`}>{r.status}</Badge> },
  ];

  if (!myStudent) return <div className="bg-white rounded-2xl p-12 text-center"><p className="text-gray-400">No student record linked.</p></div>;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total Billed" value={`₦${totalBilled.toLocaleString()}`} icon={CreditCard} color="blue" />
        <StatCard title="Total Paid" value={`₦${totalPaid.toLocaleString()}`} icon={CheckCircle} color="green" />
        <StatCard title="Outstanding" value={`₦${(totalBilled - totalPaid).toLocaleString()}`} icon={AlertCircle} color={totalBilled - totalPaid > 0 ? "red" : "green"} />
      </div>
      <DataTable columns={columns} data={invoices} emptyMessage="No fee records." />
    </div>
  );
}