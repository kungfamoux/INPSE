import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function TourFAQ({ faqs = [] }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
        >
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">{faq.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-orange-500 flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}