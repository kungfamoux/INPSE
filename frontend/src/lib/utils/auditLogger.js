import { base44 } from "@/api/base44Client";

/**
 * Append-only audit logger. Call from any page/mutation after a significant action.
 * Errors are swallowed silently — audit logging must never break app flow.
 *
 * @param {object} user - currentUser object (email, full_name, role)
 * @param {object} opts
 *   action       {string}  e.g. CREATE_STUDENT, UPDATE_ACCOUNT, DELETE_PAYMENT
 *   module       {string}  e.g. Students, Staff, Fees, Results
 *   entity_type  {string}  Entity name e.g. Student, Staff
 *   entity_id    {string}  ID of the affected record
 *   summary      {string}  Short human-readable description
 *   description  {string}  Longer detail (optional)
 *   old_values   {object}  State before the change (optional)
 *   new_values   {object}  State after the change (optional)
 *   status       {string}  "success" | "failed" | "denied" (default: "success")
 *   reason       {string}  Optional comment/reason
 */
export async function logAudit(user, {
  action,
  module = "",
  entity_type = "",
  entity_id = "",
  summary = "",
  description = "",
  old_values = null,
  new_values = null,
  status = "success",
  reason = "",
} = {}) {
  try {
    await base44.entities.AuditLog.create({
      user_email: user?.email || "system",
      user_full_name: user?.full_name || "",
      user_role: user?.role || "",
      action,
      module: module || entity_type || "",
      entity_type,
      entity_id: entity_id || "",
      summary,
      description,
      old_values: old_values || null,
      new_values: new_values || null,
      browser_info: typeof navigator !== "undefined" ? (navigator.userAgent || "").slice(0, 250) : "",
      page_route: typeof window !== "undefined" ? window.location.pathname : "",
      status,
      reason,
    });
  } catch (e) {
    console.warn("[AuditLog] Silent fail:", e);
  }
}