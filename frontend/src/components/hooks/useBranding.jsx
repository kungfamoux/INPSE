import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useBranding() {
  const { data: brandings = [], isLoading } = useQuery({
    queryKey: ["school-branding"],
    queryFn: () => base44.entities.SchoolBranding.list("-created_date", 1),
    staleTime: 5 * 60 * 1000,
  });

  const branding = brandings[0] || null;

  return {
    isLoading,
    branding,
    schoolName: branding?.schoolName || "International Nursery and Primary School Enugu (INPSE)",
    primaryLogoUrl: branding?.primaryLogoUrl || null,
    secondaryLogoUrl: branding?.secondaryLogoUrl || branding?.primaryLogoUrl || null,
    portalSidebarLogoUrl: branding?.portalSidebarLogoUrl || branding?.primaryLogoUrl || null,
    reportCardLogoUrl: branding?.reportCardLogoUrl || branding?.primaryLogoUrl || null,
    documentLogoUrl: branding?.documentLogoUrl || branding?.primaryLogoUrl || null,
    faviconUrl: branding?.faviconUrl || null,
    brandPrimaryColor: branding?.brandPrimaryColor || "#f97316",
    brandSecondaryColor: branding?.brandSecondaryColor || "#ec4899",
  };
}