import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

const URLS = {
  DEV16: "https://eygu-dev16.fa.ocs.oraclecloud.com",
  PRODUCTION: "https://fa-eygu-saasfaprod1.fa.ocs.oraclecloud.com",
} as const;

const USER = "oracleplm@netapp.com";
const PASSWORD_VARS = {
  DEV16: "ORACLEPLM_PASSWORD_DEV16",
  PRODUCTION: "ORACLEPLM_PASSWORD_PRODUCTION",
} as const;

export default defineTool({
  description: "Read one IMO item from DEV16 or Production: description, lifecycle, open AML count, and open Primary component count. Does not change Oracle.",
  effect: "read",
  inputSchema: z.object({
    itemNumber: z.string().describe("Item number, for example X4024A-2-A-C"),
    environment: z.enum(["DEV16", "PRODUCTION"]).default("DEV16"),
  }),
  async execute({ itemNumber, environment }) {
    const password = process.env[PASSWORD_VARS[environment]] || "";
    if (!password) {
      return {
        configured: false,
        integrationUser: USER,
        environment,
        itemNumber,
        message: `${PASSWORD_VARS[environment]} is not set. No Oracle call was made.`,
      };
    }
    const base = `${URLS[environment]}/fscmRestApi/resources/11.13.18.05`;
    const auth = "Basic " + Buffer.from(`${USER}:${password}`).toString("base64");
    const headers = { Accept: "application/json", Authorization: auth };
    const query = encodeURIComponent(`ItemNumber='${itemNumber.replaceAll("'", "''")}';OrganizationCode='IMO'`);
    const itemResponse = await fetch(
      `${base}/itemsV2?q=${query}&fields=ItemNumber,ItemDescription,ItemClass,LifecyclePhaseValue&limit=1&onlyData=true`,
      { headers },
    );
    if (!itemResponse.ok) {
      return { configured: true, environment, itemNumber, http: itemResponse.status, message: "Item lookup failed." };
    }
    const item = ((await itemResponse.json()) as { items?: Record<string, string>[] }).items?.[0];
    if (!item) {
      return { configured: true, environment, itemNumber, found: false };
    }
    const amlQuery = encodeURIComponent(`Item='${itemNumber.replaceAll("'", "''")}'`);
    const amlResponse = await fetch(
      `${base}/tradingPartnerItemRelationships?q=${amlQuery}&fields=RelationshipStatus,EndDateTime&limit=50&onlyData=true`,
      { headers },
    );
    const amlRows = amlResponse.ok
      ? (((await amlResponse.json()) as { items?: { EndDateTime?: string | null }[] }).items || [])
      : [];
    const openAml = amlRows.filter((row) => !row.EndDateTime).length;
    return {
      configured: true,
      environment,
      found: true,
      itemNumber: item.ItemNumber,
      description: item.ItemDescription || "",
      itemClass: item.ItemClass || "",
      lifecycle: item.LifecyclePhaseValue || "",
      openAmlCount: openAml,
    };
  },
});
