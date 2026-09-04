import assert from "node:assert/strict";
import { collectCitations } from "./citation_service.js";

const calls: string[] = [];
const client = {
  embedding: async () => [0.1, 0.2],
  createCollection: async () => { calls.push("create"); },
  upsert: async () => { calls.push("upsert"); },
  query: async () => [
    { title: "Rule", url: "https://law.example/rule", excerpt: "same", score: 0.9 },
    { title: "Rule copy", url: "https://law.example/rule", excerpt: "duplicate", score: 0.8 },
    { title: "Case", url: "https://law.example/case", excerpt: "distinct", score: 0.7 }
  ]
};

const result = await collectCitations({
  matterId: "m-1", note: "A sufficiently detailed research note.",
  signedDocumentUrl: "https://example.com/doc.pdf", deadline: "2030-01-15T09:00:00.000Z"
}, client as never);

assert.equal(result.length, 2);
assert.deepEqual(calls, ["create", "upsert"]);
console.log("citation dedupe test passed");
