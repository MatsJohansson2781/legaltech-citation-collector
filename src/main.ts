import { collectCitations, MatterInput } from "./citation_service.js";
import { InfraiClient } from "./infrai_client.js";

const input = MatterInput.parse({
  matterId: process.env.MATTER_ID ?? "demo-matter",
  note: process.env.RESEARCH_NOTE ?? "A signed delivery deadline follows the court filing rule.",
  signedDocumentUrl: process.env.SIGNED_DOCUMENT_URL ?? "https://example.com/signed-delivery.pdf",
  deadline: process.env.DEADLINE ?? "2030-01-15T09:00:00.000Z"
});

const citations = await collectCitations(input, new InfraiClient());
console.log(JSON.stringify({ matterId: input.matterId, uniqueCitations: citations }, null, 2));
