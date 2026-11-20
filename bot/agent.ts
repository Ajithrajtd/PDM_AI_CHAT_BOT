import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "PDM AI Chat BOT",
  description: "Demo PDM assistant. Answers BOM, AML, and Product Line questions. Oracle writes wait for Ajith.",
  model: {
    id: "grok-4.7",
    params: [
      { id: "reasoning_effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
});
