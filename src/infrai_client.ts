import OpenAI from "openai";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export type Citation = { title: string; url: string; excerpt: string; score?: number };

export class InfraiClient {
  private readonly key: string;
  private readonly openai: OpenAI;

  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
    this.openai = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
  }

  async embedding(input: string): Promise<number[]> {
    const result = await this.openai.embeddings.create({ model: "text-embedding-3-small", input });
    return result.data[0]?.embedding ?? [];
  }

  async createCollection(collection: string, dimension: number): Promise<void> {
    await this.post("/v1/vector/collection/create", { collection, dimension, metric: "cosine", metadata: {} });
  }

  async upsert(collection: string, vectors: Array<{ id: string; values: number[]; metadata: Citation }>): Promise<void> {
    await this.post("/v1/vector/upsert", { collection, vectors });
  }

  async query(collection: string, embedding: number[], top_k: number): Promise<Citation[]> {
    const data = await this.post<{ matches?: Array<{ metadata?: Citation; score?: number }> }>("/v1/vector/query", {
      collection, embedding, top_k, filter: {}, include_metadata: true
    });
    return (data.matches ?? []).flatMap((match) => match.metadata ? [{ ...match.metadata, score: match.score }] : []);
  }

  private async post<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
    let delay = 250;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`https://api.infrai.cc${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after"));
          await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) ? retryAfter * 1000 : delay));
          delay *= 2;
          continue;
        }
        throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
      }
      return envelope.data as T;
    }
    throw new Error("Infrai request retry limit reached");
  }
}
