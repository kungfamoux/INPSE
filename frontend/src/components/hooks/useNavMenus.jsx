import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useNavMenus() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["nav-menus"],
    queryFn: () => base44.entities.NavigationMenu.list(),
    staleTime: 5 * 60 * 1000,
  });

  const getMenu = (location) => {
    const menu = data.find(m => m.location === location);
    if (!menu) return [];
    return (menu.items || [])
      .filter(i => i.isActive !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  return {
    isLoading,
    headerItems: getMenu("header"),
    footerQuickLinks: getMenu("footerQuickLinks"),
    footerPrograms: getMenu("footerPrograms"),
    footerLegal: getMenu("footerLegal"),
    menus: data,
  };
}