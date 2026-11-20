export const APPROVER_EMAILS = ["ajithraj.td@netapp.com", "ajithraj@netapp.com"] as const;

export const INTEGRATION_USER = "oracleplm@netapp.com";

export type ChangeRequest = {
  requestId: string;
  environment: "DEV16" | "PRODUCTION";
  action: "create_change_order" | "update_item";
  summary: string;
  itemNumber: string;
  status: "pending_approval" | "approved";
  approver: string;
  requestedAt: string;
  approvedAt?: string;
};

export function approvalKey(requestId: string): string {
  return `oracle-change:${requestId}`;
}

export function isApprover(email: string): boolean {
  return APPROVER_EMAILS.includes(email.trim().toLowerCase() as (typeof APPROVER_EMAILS)[number]);
}
