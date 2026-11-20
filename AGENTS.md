# pdm-ai-demo

Agent SDK project (`@grok/agent-sdk`). The served prompt is `bot/instructions.md`.

## Loop

```bash
node ../node_modules/@grok/agent-sdk/dist/bin/agent-serve.js validate --dir .
npx tsc --noEmit -p .
node ../node_modules/@grok/agent-sdk/dist/bin/agent-serve.js tool call lookup_part --dir . --input "{\"itemNumber\":\"X4024A-2-A-C\"}"
```

Run the CLI under Node, never Bun.

Oracle calls use `ORACLEPLM_PASSWORD` and the user `oracleplm@netapp.com`. Do not put the password in a file in this project.
