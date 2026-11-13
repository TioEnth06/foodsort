import { AuditLogEntry } from "@/lib/ai/verification-schema";

const auditLogStore: AuditLogEntry[] = [];

export function appendAuditLogEntry(entry: AuditLogEntry): AuditLogEntry {
  auditLogStore.unshift(entry);
  if (auditLogStore.length > 200) {
    auditLogStore.pop();
  }
  return entry;
}

export function getAuditLogEntries(actionId?: number): AuditLogEntry[] {
  if (typeof actionId === "number" && Number.isFinite(actionId)) {
    return auditLogStore.filter((item) => item.action_id === actionId);
  }
  return [...auditLogStore];
}
