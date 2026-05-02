import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  addressLine1: "17 Hillview, Trans Ekulu",
  addressLine2: "Enugu State, Nigeria",
  country: "Nigeria",
  phonePrimary: "+2348161690483",
  phoneDisplay: "+234 8161 690 483",
  phoneE164: "+2348161690483",
  emailPrimary: "info@inpse.com",
  emailSecondary: "inps@yahoo.com",
  mapEmbedUrl: "https://www.google.com/maps?q=17+Hillview+Trans+Ekulu+Enugu&output=embed",
  officeHours: "Mon – Fri: 8:00am – 4:00pm",
  whatsAppE164: null,
};

export function useContactInfo() {
  // Try new ContactInfo entity first
  const { data: newData = [], isLoading: l1 } = useQuery({
    queryKey: ["contact-info"],
    queryFn: () => base44.entities.ContactInfo.list("-created_date", 1),
    staleTime: 5 * 60 * 1000,
  });

  // Fall back to old SchoolContactInfo entity
  const { data: oldData = [], isLoading: l2 } = useQuery({
    queryKey: ["school-contact-info"],
    queryFn: () => base44.entities.SchoolContactInfo.list("-created_date", 1),
    staleTime: 5 * 60 * 1000,
    enabled: newData.length === 0 && !l1,
  });

  const newRecord = newData[0] || null;
  const oldRecord = oldData[0] || null;

  // Merge: new ContactInfo fields, fall back to old SchoolContactInfo fields, then defaults
  const info = {
    ...DEFAULTS,
    ...(oldRecord ? {
      addressLine1: oldRecord.addressLine1,
      addressLine2: oldRecord.addressLine2,
      phoneDisplay: oldRecord.phoneDisplay,
      phonePrimary: oldRecord.phonePrimary,
      phoneE164: oldRecord.phonePrimary,
      emailPrimary: oldRecord.emailPrimary,
      emailSecondary: oldRecord.emailSecondary,
      mapEmbedUrl: oldRecord.mapEmbedUrl,
    } : {}),
    ...(newRecord ? {
      addressLine1: newRecord.addressLine1,
      addressLine2: newRecord.addressLine2,
      country: newRecord.country,
      phoneDisplay: newRecord.phoneDisplay,
      phonePrimary: newRecord.phoneE164 || newRecord.phoneDisplay,
      phoneE164: newRecord.phoneE164,
      emailPrimary: newRecord.emailPrimary,
      emailSecondary: newRecord.emailSecondary,
      mapEmbedUrl: newRecord.mapEmbedUrl,
      officeHours: newRecord.officeHours,
      whatsAppE164: newRecord.whatsAppE164,
    } : {}),
  };

  return { info, isLoading: l1 || l2 };
}