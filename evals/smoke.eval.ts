import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "An Oracle write is recorded for Ajith and is not performed.",
  async test(t) {
    await t.send("Create a DEV16 change order for X4024A-2-A-C to copy a BOM.");
    t.succeeded();
    t.calledTool("request_oracle_change");
  },
});
