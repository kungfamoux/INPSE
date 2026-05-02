import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../../utils";
import {
  GraduationCap, LayoutDashboard, Users, UserCheck, BookOpen,
  Calendar, ClipboardList, CreditCard, Megaphone, Newspaper,
  Image, LogOut, ChevronLeft, ChevronRight, Bell,
  School, FileText, BarChart3, UserCog, BookMarked,
  Store, ShoppingBag, Tag, Receipt, BarChart2,
  Crown, Shield, Settings, Activity, TrendingUp, Lock, CheckCircle,
  Globe, Layers, ImagePlus
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBranding } from "../hooks/useBranding";

const menuConfig = {
  proprietor: [
    { label: "Executive Dashboard", icon: Crown, page: "ProprietorDashboard" },
    { label: "─── People ───", divider: true },
    { label: "Users & Permissions", icon: Shield, page: "ProprietorUsers" },
    { label: "User Onboarding", icon: UserCheck, page: "AdminOnboarding" },
    { label: "Students", icon: Users, page: "AdminStudents" },
    { label: "Parents", icon: UserCheck, page: "AdminParents" },
    { label: "Staff", icon: UserCog, page: "AdminStaff" },
    { label: "Admissions", icon: FileText, page: "AdminAdmissions" },
    { label: "Tour Requests", icon: Calendar, page: "AdminTourRequests" },
    { label: "─── Academics ───", divider: true },
    { label: "School Settings", icon: Settings, page: "ProprietorSettings" },
    { label: "Results Approval", icon: CheckCircle, page: "ProprietorResults" },
    { label: "Attendance", icon: ClipboardList, page: "AdminAttendance" },
    { label: "Assessments", icon: BarChart3, page: "AdminResults" },
    { label: "─── Finance ───", divider: true },
    { label: "Finance & Accounting", icon: TrendingUp, page: "ProprietorFinance" },
    { label: "Fees & Payments", icon: CreditCard, page: "AdminFees" },
    { label: "─── Store ───", divider: true },
    { label: "Store Products", icon: Store, page: "AdminStoreProducts" },
    { label: "Store Orders", icon: ShoppingBag, page: "AdminStoreOrders" },
    { label: "Store Reports", icon: BarChart2, page: "AdminStoreReports" },
    { label: "─── Content ───", divider: true },
    { label: "Announcements", icon: Megaphone, page: "AdminAnnouncements" },
    { label: "News Posts", icon: Newspaper, page: "AdminNews" },
    { label: "Gallery Items", icon: Image, page: "AdminGallery" },
    { label: "Gallery Categories", icon: Tag, page: "AdminGalleryCategories" },
    { label: "─── Website CMS ───", divider: true },
    { label: "Website Settings", icon: Globe, page: "AdminCMSSettings" },
    { label: "Page Editor", icon: Layers, page: "AdminCMSPages" },
    { label: "CMS Content", icon: FileText, page: "AdminCMSContent" },
    { label: "CMS Gallery", icon: ImagePlus, page: "AdminCMSGallery" },
    { label: "Our Team", icon: Users, page: "AdminTeam" },
    { label: "─── System ───", divider: true },
    { label: "Analytics & Reports", icon: BarChart3, page: "ProprietorReports" },
    { label: "Audit Logs", icon: Activity, page: "ProprietorAuditLogs" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, page: "AdminDashboard" },
    { label: "User Onboarding", icon: Shield, page: "AdminOnboarding" },
    { label: "Students", icon: Users, page: "AdminStudents" },
    { label: "Parents", icon: UserCheck, page: "AdminParents" },
    { label: "Staff", icon: UserCog, page: "AdminStaff" },
    { label: "Classes", icon: School, page: "AdminClasses" },
    { label: "Subjects", icon: BookOpen, page: "AdminSubjects" },
    { label: "Sessions & Terms", icon: Calendar, page: "AdminSessions" },
    { label: "Attendance", icon: ClipboardList, page: "AdminAttendance" },
    { label: "Results", icon: BarChart3, page: "AdminResults" },
    { label: "Fees & Payments", icon: CreditCard, page: "AdminFees" },
    { label: "Admissions", icon: FileText, page: "AdminAdmissions" },
    { label: "Tour Requests", icon: Calendar, page: "AdminTourRequests" },
    { label: "Announcements", icon: Megaphone, page: "AdminAnnouncements" },
    { label: "News Posts", icon: Newspaper, page: "AdminNews" },
    { label: "Gallery Items", icon: Image, page: "AdminGallery" },
    { label: "Gallery Categories", icon: Tag, page: "AdminGalleryCategories" },
    { label: "Notifications", icon: Bell, page: "AdminNotifications" },
    { label: "Messages", icon: Newspaper, page: "AdminMessages" },
    { label: "─── Website CMS ───", divider: true },
    { label: "Website Settings", icon: Globe, page: "AdminCMSSettings" },
    { label: "Page Editor", icon: Layers, page: "AdminCMSPages" },
    { label: "CMS Content", icon: FileText, page: "AdminCMSContent" },
    { label: "CMS Gallery", icon: ImagePlus, page: "AdminCMSGallery" },
    { label: "Our Team", icon: Users, page: "AdminTeam" },
    { label: "─── Store ───", icon: Store, page: null, divider: true },
    { label: "Store Products", icon: Store, page: "AdminStoreProducts" },
    { label: "Categories", icon: Tag, page: "AdminStoreCategories" },
    { label: "Orders", icon: ShoppingBag, page: "AdminStoreOrders" },
    { label: "Payments", icon: Receipt, page: "AdminStorePayments" },
    { label: "Coupons", icon: Tag, page: "AdminStoreCoupons" },
    { label: "Reports", icon: BarChart2, page: "AdminStoreReports" },
  ],
  teacher: [
    { label: "Dashboard", icon: LayoutDashboard, page: "TeacherDashboard" },
    { label: "My Classes", icon: School, page: "TeacherClasses" },
    { label: "Attendance", icon: ClipboardList, page: "TeacherAttendance" },
    { label: "Assessments", icon: BookMarked, page: "TeacherAssessments" },
    { label: "Announcements", icon: Megaphone, page: "TeacherAnnouncements" },
  ],
  parent: [
    { label: "Dashboard", icon: LayoutDashboard, page: "ParentDashboard" },
    { label: "My Children", icon: Users, page: "ParentChildren" },
    { label: "Attendance", icon: ClipboardList, page: "ParentAttendance" },
    { label: "Results", icon: BarChart3, page: "ParentResults" },
    { label: "Fees", icon: CreditCard, page: "ParentFees" },
    { label: "Messages", icon: Bell, page: "ParentMessages" },
    { label: "Store", icon: Store, page: "ParentStore" },
    { label: "My Orders", icon: ShoppingBag, page: "ParentOrders" },
  ],
  student: [
    { label: "Dashboard", icon: LayoutDashboard, page: "StudentDashboard" },
    { label: "My Results", icon: BarChart3, page: "StudentResults" },
    { label: "My Attendance", icon: ClipboardList, page: "StudentAttendance" },
    { label: "Fees", icon: CreditCard, page: "StudentFees" },
    { label: "Announcements", icon: Megaphone, page: "StudentAnnouncements" },
  ],
  accountant: [
    { label: "Dashboard", icon: LayoutDashboard, page: "AdminDashboard" },
    { label: "Fees & Payments", icon: CreditCard, page: "AdminFees" },
    { label: "Store Orders", icon: ShoppingBag, page: "AdminStoreOrders" },
    { label: "Store Payments", icon: Receipt, page: "AdminStorePayments" },
    { label: "Store Reports", icon: BarChart2, page: "AdminStoreReports" },
  ],
};

export default function PortalSidebar({ user, currentPage }) {
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role || "user";
  const items = menuConfig[role] || menuConfig.admin;
  const { schoolName, portalSidebarLogoUrl } = useBranding();

  const getSectionLabel = (item) => {
    if (!item.divider) return null;
    const map = {
      "─── People ───": "People",
      "─── Academics ───": "Academics",
      "─── Finance ───": "Finance",
      "─── Store ───": "Store",
      "─── Content ───": "Content",
      "─── Website CMS ───": "Website CMS",
      "─── System ───": "System",
    };
    return map[item.label] || item.label.replace(/─+\s*/g,"").replace(/\s*─+/g,"").trim();
  };

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm z-40 transition-all duration-300 flex flex-col ${collapsed ? "w-[72px]" : "w-64"}`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            {portalSidebarLogoUrl ? (
              <img
                src={portalSidebarLogoUrl}
                alt={schoolName}
                className="h-8 w-auto max-w-[130px] object-contain flex-shrink-0"
              />
            ) : (
              <>
                <div
                  style={{ background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))" }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-sm text-gray-900 truncate">{schoolName}</span>
              </>
            )}
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            {portalSidebarLogoUrl ? (
              <img
                src={portalSidebarLogoUrl}
                alt={schoolName}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <div
                style={{ background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))" }}
                className="w-8 h-8 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        <div className="space-y-0.5">
          {items.map((item) => {
            if (item.divider) {
              const label = getSectionLabel(item);
              return !collapsed ? (
                <div key={item.label} className="px-3 pt-3 pb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                </div>
              ) : <div key={item.label} className="border-t border-gray-100 my-2" />;
            }
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                style={isActive ? {
                  background: "linear-gradient(to right, var(--brand-primary), var(--brand-secondary))",
                  boxShadow: "0 4px 12px color-mix(in srgb, var(--brand-primary) 30%, transparent)"
                } : {}}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User & Logout */}
      <div className="border-t border-gray-100 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 mb-2">
            <div
              style={role === "proprietor" ? {
                background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))"
              } : {}}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${
                role === "proprietor" ? "text-white" : "bg-gradient-to-br from-orange-100 to-pink-100 text-orange-600"
              }`}>
              {role === "proprietor" ? <Crown className="w-4 h-4" /> : user?.full_name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.full_name || "User"}</p>
              <p className={`text-[10px] capitalize font-medium ${role === "proprietor" ? "text-orange-500" : "text-gray-400"}`}>{role.replace("_"," ")}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => base44.auth.logout()}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all ${collapsed ? "justify-center" : ""}`}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}