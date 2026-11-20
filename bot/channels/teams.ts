import { defineChannel, POST, sharedSecretAuth } from "@grok/agent-sdk/channels";
import * as z from "zod/v4";

import { approvalKey, isApprover, type ChangeRequest } from "../lib/approvals.js";

const approvePattern = /^approve\s+(\S+)\s*$/i;

export default defineChannel({
  auth: [sharedSecretAuth({ header: "x-pdm-bot-secret", secret: "TEAMS_WEBHOOK_SECRET" })],
  routes: [
    POST("/message", {
      description: "Teams message forwarded by Power Automate.",
      bodySchema: z.object({
        from: z.string(),
        text: z.string(),
        channel: z.string().default("General"),
      }),
      handler: async (_request, { send, host, body }) => {
        const approval = body.text.match(approvePattern);
        if (approval) {
          const requestId = approval[1] || "";
          const current = (await host.kv.get(approvalKey(requestId))) as ChangeRequest | undefined;
          if (!isApprover(body.from)) {
            return Response.json({
              ok: false,
              message: "Only Ajith can approve an Oracle change.",
            });
          }
          if (!current) {
            return Response.json({ ok: false, message: `No pending request ${requestId}.` });
          }
          const approved: ChangeRequest = {
            ...current,
            status: "approved",
            approvedAt: new Date().toISOString(),
          };
          await host.kv.put(approvalKey(requestId), approved);
          return Response.json({
            ok: true,
            ...approved,
            oracleWrite: false,
            message: "Approved. This demo does not write to Oracle.",
          });
        }
        await send(body.text, {
          continuationToken: `teams:${body.channel}:${body.from}`,
          title: `${body.channel} ${body.from}`,
        });
        return new Response(null, { status: 202 });
      },
    }),
  ],
});
