# PDM AI demo — Teams trigger

Flow definition: `PDM_AI_Demo_Approvals_Trigger.json`.

It takes the same JSON that `teams_post.py` already sends (`type`, `text`,
and an Adaptive Card attachment) and posts `text` into the team
**PDM AI Chat BOT-Demo Version**.

## Import

1. Power Automate → My flows → Import → Import package (Legacy), and choose
   **`PDM_AI_Demo_Approvals_Trigger.zip`** (not the JSON).
   The zip holds `manifest.json` and the flow folder with `definition.json`
   and `apiProperties.json`. I could not test this import from here. If it
   rejects the package, use the designer steps below.
2. Designer route: New flow → Instant cloud flow → When an HTTP request is
   received. Set the request body schema to match `definition.json`, then
   add the Teams action.
3. Open the Teams action. Set the team to **PDM AI Chat BOT-Demo Version**
   and the channel to **Approvals**. The file has the team id filled in and
   leaves `REPLACE_WITH_APPROVALS_CHANNEL_ID` for the channel.
4. Sign in to the Teams connection when the designer asks.
5. Save the flow, copy the **HTTP POST URL** from the trigger, and send it
   back so the bot posts through it.

## After the URL is set

```powershell
$env:PA_TRIGGER = "<the HTTP POST URL>"
$env:PA_TEXT = "PDM AI demo check."
python "...\CO-Change-Analyst\_post_teams_text.py"
```

The first run saves the URL to `%AppData%\Roaming\CO-Change-Analyst\pa_trigger.txt`.
Later runs read it from there, so the URL never goes on the command line again.
A reply of HTTP 200 or 202 counts as sent.

## Reply flow (Approvals channel back to the bot)

This is a second flow. It watches the Approvals channel and forwards each new
message to the bot, which decides whether the sender may approve.

1. Create → Automated cloud flow. Name it `PDM AI Demo Approvals Reply`.
   Trigger: **When a new channel message is added** (Microsoft Teams).
2. Set the trigger to team **PDM AI Chat BOT-Demo Version** and channel
   **Approvals**.
3. New step → **HTTP**.
   - Method: POST
   - URI: the bot address, ending in `/message`
   - Headers: `Content-Type` = `application/json`, and `x-pdm-bot-secret` =
     the value of `TEAMS_WEBHOOK_SECRET`
   - Body:

```json
{
  "from": "@{triggerOutputs()?['body/from/user/email']}",
  "text": "@{triggerOutputs()?['body/body/plainTextContent']}",
  "channel": "Approvals"
}
```

4. Save the flow.

The bot approves only when `from` is ajithraj.td@netapp.com or
ajithraj@netapp.com and `text` is `approve <request id>`. Any other message
is passed to the assistant as a question. The bot's `/message` route is what
makes this body shape right, so keep the three field names as they are.
