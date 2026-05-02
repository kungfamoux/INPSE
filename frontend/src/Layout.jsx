import React, { useState, useEffect } from "react";
import PublicNavbar from "./components/public/PublicNavbar.jsx";
import PublicFooter from "./components/public/PublicFooter";
import PortalSidebar from "./components/portal/PortalSidebar";
import PortalHeader from "./components/portal/PortalHeader";
import FirstLoginGuard from "./components/onboarding/FirstLoginGuard";
import BrandThemeProvider from "./components/BrandThemeProvider";
import { base44 } from "@/api/base44Client";

const publicPages = ["Home", "About", "News", "NewsDetail", "Gallery", "Contact", "Results", "Enroll", "PortalLogin", "Tour"];

const portalPageTitles = {
  AdminDashboard: "Dashboard",
  AdminStudents: "Students",
  AdminParents: "Parents",
  AdminStaff: "Staff",
  AdminClasses: "Classes",
  AdminSubjects: "Subjects",
  AdminSessions: "Sessions & Terms",
  AdminAttendance: "Attendance Reports",
  AdminResults: "Results Management",
  AdminFees: "Fees & Payments",
  AdminAdmissions: "Admissions",
  AdminAnnouncements: "Announcements",
  AdminNews: "News Management",
  AdminGallery: "Gallery Management",
  AdminMessages: "Messages",
  TeacherDashboard: "Dashboard",
  TeacherClasses: "My Classes",
  TeacherAttendance: "Mark Attendance",
  TeacherAssessments: "Assessments",
  TeacherAnnouncements: "Announcements",
  ParentDashboard: "Dashboard",
  ParentChildren: "My Children",
  ParentAttendance: "Attendance",
  ParentResults: "Results",
  ParentFees: "Fees & Payments",
  ParentMessages: "Messages",
  ParentStore: "School Store",
  ParentOrders: "My Orders",
  StoreCheckout: "Checkout",
  AdminStoreProducts: "Store Products",
  AdminStoreCategories: "Store Categories",
  AdminStoreOrders: "Store Orders",
  AdminStorePayments: "Store Payments",
  AdminStoreCoupons: "Coupons",
  AdminStoreReports: "Store Reports",
  AdminTourRequests: "Tour Requests",
  AdminOnboarding: "User Onboarding",
  AdminNotifications: "Notifications",
  AdminCMSSettings: "Website Settings",
  AdminCMSPages: "Page Editor",
  AdminCMSContent: "Content Management",
  AdminCMSGallery: "Gallery Management",
  StudentDashboard: "Dashboard",
  StudentResults: "My Results",
  StudentAttendance: "My Attendance",
  StudentFees: "Fees",
  StudentAnnouncements: "Announcements",
  ProprietorDashboard: "Executive Dashboard",
  ProprietorUsers: "Users & Permissions",
  ProprietorSettings: "School Settings",
  ProprietorResults: "Results Approval",
  ProprietorFinance: "Finance & Accounting",
  ProprietorAuditLogs: "Audit Logs",
  ProprietorReports: "Analytics & Reports",
  AdminTeam: "Our Team",
};

function AccountGuard({ user, children: guardChildren }) {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    // Platform admins (proprietors/school admins) always bypass the guard
    if (user.role === "admin") { setStatus("ok"); return; }
    base44.entities.UserAccount.filter({ user_email: user.email }).then(accounts => {
      const account = accounts[0];
      if (!account) { setStatus("no_account"); return; }
      if (account.account_status === "suspended") { setStatus("suspended"); return; }
      if (account.account_status === "pending_activation") { setStatus("pending"); return; }
      setStatus("ok");
    }).catch(() => setStatus("ok"));
  }, [user.email]);

  if (status === "checking") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500"></div>
        <p className="text-sm text-gray-400">Verifying access...</p>
      </div>
    </div>
  );
  if (status !== "ok") {
    window.location.href = `/PendingApproval?reason=${status}`;
    return null;
  }
  return guardChildren;
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [effectiveRole, setEffectiveRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPublic = publicPages.includes(currentPageName);

  useEffect(() => {
    if (!isPublic) {
      base44.auth.me().then(async (u) => {
        setUser(u);
        // Try to get UserAccount role (school-specific role like "proprietor")
        try {
          const accounts = await base44.entities.UserAccount.filter({ user_email: u.email });
          const account = accounts[0];
          if (account?.role) {
            setEffectiveRole(account.role);
          } else {
            setEffectiveRole(u.role);
          }
        } catch {
          setEffectiveRole(u.role);
        }
      }).catch(() => {
        base44.auth.redirectToLogin();
      });
    }
  }, [isPublic, currentPageName]);

  // Public layout
  if (isPublic) {
    return (
      <div className="min-h-screen flex flex-col">
        <BrandThemeProvider />
        <PublicNavbar />
        <main className="flex-1 pt-16 lg:pt-20">{children}</main>
        <PublicFooter />
      </div>
    );
  }

  // Portal layout - waiting for auth + account check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500"></div>
          <p className="text-sm text-gray-400">Loading portal...</p>
        </div>
      </div>
    );
  }

  const effectiveUser = user ? { ...user, role: effectiveRole || user.role } : null;

  return (
    <AccountGuard user={user}>
    <div className="min-h-screen bg-gray-50">
      <BrandThemeProvider />
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <PortalSidebar user={effectiveUser} currentPage={currentPageName} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64">
            <PortalSidebar user={effectiveUser} currentPage={currentPageName} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <PortalHeader
          user={effectiveUser}
          title={portalPageTitles[currentPageName] || "Portal"}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 p-4 lg:p-8">
          <FirstLoginGuard currentUser={effectiveUser} />
          {React.cloneElement(children, { currentUser: effectiveUser })}
        </main>
      </div>
    </div>
    </AccountGuard>
  );
}