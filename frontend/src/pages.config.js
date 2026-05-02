/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/public/About';
import AdminAdmissions from './pages/admin/AdminAdmissions';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminCMSContent from './pages/admin/AdminCMSContent';
import AdminCMSGallery from './pages/admin/AdminCMSGallery';
import AdminCMSPages from './pages/admin/AdminCMSPages';
import AdminCMSSettings from './pages/admin/AdminCMSSettings';
import AdminClasses from './pages/admin/AdminClasses';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFees from './pages/admin/AdminFees';
import AdminGallery from './pages/admin/AdminGallery';
import AdminGalleryCategories from './pages/admin/AdminGalleryCategories';
import AdminMessages from './pages/admin/AdminMessages';
import AdminNews from './pages/admin/AdminNews';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminOnboarding from './pages/admin/AdminOnboarding';
import AdminParents from './pages/admin/AdminParents';
import AdminResults from './pages/admin/AdminResults';
import AdminSessions from './pages/admin/AdminSessions';
import AdminStaff from './pages/admin/AdminStaff';
import AdminStoreCategories from './pages/admin/AdminStoreCategories';
import AdminStoreCoupons from './pages/admin/AdminStoreCoupons';
import AdminStoreOrders from './pages/admin/AdminStoreOrders';
import AdminStorePayments from './pages/admin/AdminStorePayments';
import AdminStoreProducts from './pages/admin/AdminStoreProducts';
import AdminStoreReports from './pages/admin/AdminStoreReports';
import AdminStudents from './pages/admin/AdminStudents';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminTeam from './pages/admin/AdminTeam';
import AdminTourConfig from './pages/admin/AdminTourConfig';
import AdminTourRequests from './pages/admin/AdminTourRequests';
import Contact from './pages/public/Contact';
import Enroll from './pages/public/Enroll';
import Gallery from './pages/public/Gallery';
import Home from './pages/public/Home';
import News from './pages/public/News';
import NewsDetail from './pages/public/NewsDetail';
import ParentAttendance from './pages/parent/ParentAttendance';
import ParentChildren from './pages/parent/ParentChildren';
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentFees from './pages/parent/ParentFees';
import ParentMessages from './pages/parent/ParentMessages';
import ParentOrders from './pages/parent/ParentOrders';
import ParentResults from './pages/parent/ParentResults';
import ParentStore from './pages/parent/ParentStore';
import PortalLogin from './pages/auth/PortalLogin';
import PendingApproval from './pages/auth/PendingApproval';
import ProprietorAuditLogs from './pages/proprietor/ProprietorAuditLogs';
import ProprietorDashboard from './pages/proprietor/ProprietorDashboard';
import ProprietorFinance from './pages/proprietor/ProprietorFinance';
import ProprietorReports from './pages/proprietor/ProprietorReports';
import ProprietorResults from './pages/proprietor/ProprietorResults';
import ProprietorSettings from './pages/proprietor/ProprietorSettings';
import ProprietorUsers from './pages/proprietor/ProprietorUsers';
import Results from './pages/public/Results';
import StoreCheckout from './pages/public/StoreCheckout';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentFees from './pages/student/StudentFees';
import StudentResults from './pages/student/StudentResults';
import TeacherAnnouncements from './pages/teacher/TeacherAnnouncements';
import TeacherAssessments from './pages/teacher/TeacherAssessments';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import Tour from './pages/public/Tour';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminAdmissions": AdminAdmissions,
    "AdminAnnouncements": AdminAnnouncements,
    "AdminAttendance": AdminAttendance,
    "AdminCMSContent": AdminCMSContent,
    "AdminCMSGallery": AdminCMSGallery,
    "AdminCMSPages": AdminCMSPages,
    "AdminCMSSettings": AdminCMSSettings,
    "AdminClasses": AdminClasses,
    "AdminDashboard": AdminDashboard,
    "AdminFees": AdminFees,
    "AdminGallery": AdminGallery,
    "AdminGalleryCategories": AdminGalleryCategories,
    "AdminMessages": AdminMessages,
    "AdminNews": AdminNews,
    "AdminNotifications": AdminNotifications,
    "AdminOnboarding": AdminOnboarding,
    "AdminParents": AdminParents,
    "AdminResults": AdminResults,
    "AdminSessions": AdminSessions,
    "AdminStaff": AdminStaff,
    "AdminStoreCategories": AdminStoreCategories,
    "AdminStoreCoupons": AdminStoreCoupons,
    "AdminStoreOrders": AdminStoreOrders,
    "AdminStorePayments": AdminStorePayments,
    "AdminStoreProducts": AdminStoreProducts,
    "AdminStoreReports": AdminStoreReports,
    "AdminStudents": AdminStudents,
    "AdminSubjects": AdminSubjects,
    "AdminTeam": AdminTeam,
    "AdminTourConfig": AdminTourConfig,
    "AdminTourRequests": AdminTourRequests,
    "Contact": Contact,
    "Enroll": Enroll,
    "Gallery": Gallery,
    "Home": Home,
    "News": News,
    "NewsDetail": NewsDetail,
    "ParentAttendance": ParentAttendance,
    "ParentChildren": ParentChildren,
    "ParentDashboard": ParentDashboard,
    "ParentFees": ParentFees,
    "ParentMessages": ParentMessages,
    "ParentOrders": ParentOrders,
    "ParentResults": ParentResults,
    "ParentStore": ParentStore,
    "PendingApproval": PendingApproval,
    "PortalLogin": PortalLogin,
    "ProprietorAuditLogs": ProprietorAuditLogs,
    "ProprietorDashboard": ProprietorDashboard,
    "ProprietorFinance": ProprietorFinance,
    "ProprietorReports": ProprietorReports,
    "ProprietorResults": ProprietorResults,
    "ProprietorSettings": ProprietorSettings,
    "ProprietorUsers": ProprietorUsers,
    "Results": Results,
    "StoreCheckout": StoreCheckout,
    "StudentAnnouncements": StudentAnnouncements,
    "StudentAttendance": StudentAttendance,
    "StudentDashboard": StudentDashboard,
    "StudentFees": StudentFees,
    "StudentResults": StudentResults,
    "TeacherAnnouncements": TeacherAnnouncements,
    "TeacherAssessments": TeacherAssessments,
    "TeacherAttendance": TeacherAttendance,
    "TeacherClasses": TeacherClasses,
    "TeacherDashboard": TeacherDashboard,
    "Tour": Tour,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};