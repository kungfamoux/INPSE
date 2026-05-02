import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { useBranding } from "../hooks/useBranding";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import SocialIcons from "./SocialIcons";

const QUICK_LINKS = [
  { label: "Home", page: "Home" },
  { label: "About Us", page: "About" },
  { label: "News & Events", page: "News" },
  { label: "Gallery", page: "Gallery" },
  { label: "Contact", page: "Contact" },
];

const ADMISSIONS_LINKS = [
  { label: "Apply Now", page: "Enroll" },
  { label: "Check Results", page: "Results" },
  { label: "Parent Portal", page: "PortalLogin" },
  { label: "Student Portal", page: "PortalLogin" },
];

export default function PublicFooter() {
  const { secondaryLogoUrl, schoolName } = useBranding();
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();
  const socialLinks = settings?.socialLinks || [];

  return (
    <footer style={{ backgroundColor: "#0f172a" }}>
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 – Brand */}
          <div>
            {secondaryLogoUrl ? (
              <img
                src={secondaryLogoUrl}
                alt={schoolName}
                className="object-contain mb-4"
                style={{ height: "clamp(60px, 8vw, 85px)", width: "auto" }}
              />
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs leading-tight text-center">
                  IN<br />PSE
                </div>
                <span className="text-white font-bold text-sm leading-tight">
                  INPS ENUGU<br />
                  <span className="text-xs font-normal" style={{ color: "#94a3b8" }}>Quality Education</span>
                </span>
              </div>
            )}
            <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              International Nursery and Primary School Enugu is committed to providing quality education that nurtures young minds and builds future leaders.
            </p>

            {/* Social Icons */}
            {socialLinks.length > 0 && (
              <div className="mt-5">
                <SocialIcons links={socialLinks} size="w-5 h-5" baseColor="#64748b" />
              </div>
            )}
          </div>

          {/* Col 2 – Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#e2e8f0" }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={createPageUrl(item.page)}
                    className="text-sm transition-colors duration-150 hover:text-orange-400"
                    style={{ color: "#94a3b8" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Admissions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#e2e8f0" }}>
              Admissions
            </h4>
            <ul className="space-y-3">
              {ADMISSIONS_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={createPageUrl(item.page)}
                    className="text-sm transition-colors duration-150 hover:text-orange-400"
                    style={{ color: "#94a3b8" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 – Contact Us */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#e2e8f0" }}>
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f97316" }} />
                <span style={{ color: "#94a3b8" }}>17 Hillview, Trans Ekulu,<br />Enugu State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "#f97316" }} />
                <a href="tel:+2348161690483" className="transition-colors hover:text-orange-400" style={{ color: "#94a3b8" }}>
                  +234 8161 690 483
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f97316" }} />
                <span>
                  <a href="mailto:info@inpse.com" className="block transition-colors hover:text-orange-400" style={{ color: "#94a3b8" }}>
                    info@inpse.com
                  </a>
                  <a href="mailto:inps@yahoo.com" className="block transition-colors hover:text-orange-400" style={{ color: "#94a3b8" }}>
                    inps@yahoo.com
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#94a3b8" }} />
                <span style={{ color: "#64748b" }}>Mon – Fri: 8:00am – 4:00pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 mb-6" style={{ borderTop: "1px solid #1e293b" }} />

        {/* Copyright */}
        <p className="text-center text-xs" style={{ color: "#475569" }}>
          © {year} International Nursery and Primary School Enugu (INPSE). All rights reserved.
        </p>
      </div>
    </footer>
  );
}