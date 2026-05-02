import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  schoolName: "International Nursery and Primary School Enugu (INPSE)",
  tagline: "Nurturing Excellence, Character & Lifelong Learning",
  primaryLogoUrl: null,
  secondaryLogoUrl: null,
  primaryColor: "#f97316",
  secondaryColor: "#ec4899",
  socialLinks: [],
  showPoweredBy: false,
  footerCopyrightOverride: null,
};

export function useSiteSettings() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => base44.entities.SiteSettings.list("-created_date", 1),
    staleTime: 30 * 1000, // 30s – ensures near-instant propagation after save
  });

  const settings = data[0] ? { ...DEFAULTS, ...data[0] } : DEFAULTS;
  return { settings, isLoading, raw: data[0] || null };
}