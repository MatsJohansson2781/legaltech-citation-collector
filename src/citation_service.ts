import { z } from "zod";
import { InfraiClient, Citation } from "./infrai_client.js";

export const MatterInput = z.object({
  matterId: z.string().min(1),
  note: z.string().min(10),
  signedDocumentUrl: z.string().url(),
  deadline: z.string().datetime()
});
export type MatterInput = z.infer<typeof MatterInput>;

export async function collectCitations(input: MatterInput, client: InfraiClient): Promise<Citation[]> {
  const matter = MatterInput.parse(input);
  const embedding = await client.embedding(matter.note);
  const collection = `matter-${matter.matterId}`;
  await client.createCollection(collection, embedding.length);
  await client.upsert(collection, [{ id: matter.signedDocumentUrl, values: embedding, metadata: { title: "Matter note", url: matter.signedDocumentUrl, excerpt: matter.note } }]);
  const citations = await client.query(collection, embedding, 10);
  const unique = new Map(citations.map((citation) => [citation.url, citation]));
  return [...unique.values()];
}
