import { base44 } from "@/api/base44Client";

/**
 * Utility to create notifications from anywhere in the app.
 * Import and call: createNotification({ title, message, type, ... })
 */
export async function createNotification({ title, message, type = "info", link, user_email, role, class_id, expires_at }) {
  try {
    await base44.entities.Notification.create({
      title,
      message,
      type,
      link: link || "",
      user_email: user_email || "",
      role: role || "",
      class_id: class_id || "",
      is_read: false,
      expires_at: expires_at || "",
    });
  } catch (e) {
    console.warn("Failed to create notification", e);
  }
}