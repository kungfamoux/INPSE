import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle2, User, Phone, Mail, Baby, FileText } from "lucide-react";

const CHILD_AGES = ["Under 2", "2–3 years", "4–5 years", "6–7 years", "8–9 years", "10–11 years", "12+ years"];

export default function BookTourForm() {
  const [form, setForm] = useState({
    parentName: "",
    phone: "",
    email: "",
    childAge: "",
    preferredDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.parentName.trim()) e.parentName = "Parent name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.childAge) e.childAge = "Please select child's age";
    if (!form.preferredDate) e.preferredDate = "Please select a preferred date";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    await base44.entities.TourRequest.create({ ...form, status: "New" });

    // Create an announcement to notify admins/proprietors
    await base44.entities.Announcement.create({
      title: `New Tour Request from ${form.parentName}`,
      body: `${form.parentName} has requested a physical school tour on ${form.preferredDate}. Child age: ${form.childAge}. Phone: ${form.phone}${form.email ? `. Email: ${form.email}` : ""}${form.notes ? `. Notes: ${form.notes}` : ""}.`,
      audience: "all",
      priority: "important",
      is_published: false,
    });

    setLoading(false);
    setSuccess(true);
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  if (success) {
    return (
      <div className="text-center py-10 px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tour Request Received!</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Thank you, <strong>{form.parentName}</strong>! We'll contact you within 24 hours to confirm your visit on <strong>{form.preferredDate}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Parent Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parent / Guardian Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="e.g. Mrs. Adaeze Okonkwo"
            value={form.parentName}
            onChange={set("parentName")}
          />
        </div>
        {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="+234 800 000 0000" value={form.phone} onChange={set("phone")} />
        </div>
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      {/* Email (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} />
        </div>
      </div>

      {/* Child Age */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Child's Age *</label>
        <div className="relative">
          <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-transparent text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.childAge}
            onChange={set("childAge")}
          >
            <option value="">Select age range</option>
            {CHILD_AGES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        {errors.childAge && <p className="text-red-500 text-xs mt-1">{errors.childAge}</p>}
      </div>

      {/* Preferred Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Visit Date *</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            className="pl-9"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.preferredDate}
            onChange={set("preferredDate")}
          />
        </div>
        {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <textarea
            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-transparent text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            rows={3}
            placeholder="Any specific areas you'd like to see, questions, or special requirements..."
            value={form.notes}
            onChange={set("notes")}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white h-11 font-semibold"
      >
        {loading ? "Submitting..." : "Book My Tour"}
      </Button>

      <p className="text-xs text-gray-400 text-center">We'll confirm your booking within 24 hours.</p>
    </form>
  );
}