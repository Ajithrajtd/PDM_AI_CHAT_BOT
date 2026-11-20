import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

import { approvalKey, type ChangeRequest } from "../lib/approvals.js";

export default defineTool({
  description: "Record an Oracle create or update for Ajith to approve. Does not write to Oracle.",
  effect: "write",
  inputSchema: z.object({
    environment: z.enum(["DEV16", "PRODUCTION"]).default("DEV16"),
    action: z.enum(["create_change_order", "update_item"]),
    summary: z.string().describe("What the person asked to change"),
    itemNumber: z.string().default(""),
  }),
  async execute({ environment, action, summary, itemNumber }, ctx) {
    const requestId = `req_${Date.now().toString(36)}`;
    const record: ChangeRequest = {
      requestId,
      environment,
      action,
      summary,
      itemNumber,
      status: "pending_approval",
      approver: "ajithraj.td@netapp.com",
      requestedAt: new Date().toISOString(),
    };
    await ctx.host.kv.put(approvalKey(requestId), record);
    return {
      ...record,
      oracleWrite: false,
      approvalChannel: "Approvals",
      message: "Pending in the Approvals channel. Ajith is the approver. Nothing was written to Oracle.",
    };
  },
});
