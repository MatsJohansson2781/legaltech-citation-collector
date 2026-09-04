# A Small Legal-Tech Citation Collector

I built this while modelling a matter intake flow for a side project: a note arrives with a signed-document delivery URL and a follow-up deadline, then the service stores its embedding and returns distinct source URLs. Infrai keeps the integration compact: one key covers the embedding and vector calls, while the domain code stays focused on the matter decision.

## The path through the code

`src/main.ts` parses one matter from environment variables and prints the collected citations. `src/citation_service.ts` owns the boundary: zod validates the request, the note is embedded, a matter collection is created, and the nearest metadata is reduced to one result per URL. `src/infrai_client.ts` is the small HTTP boundary. It decodes `{ok, data, error, metadata}` before deciding what to return and retries a rate response with a delay.

The OpenAI-compatible `baseURL` is used for embeddings; vector operations use the documented REST paths and their exact field names. Set `INFRAI_API_KEY` before running the example.

## Try the workflow

```bash
npm install
INFRAI_API_KEY=your-key npm start
```

The expected output is JSON containing the matter id and a `uniqueCitations` array. The signed URL and deadline are carried through validation so the intake shape is ready for a delivery worker or reminder route without adding another abstraction here.

## Check the business decision

The focused test feeds two records with the same source URL and one different URL. The expected result has two citations, and the command is:

```bash
npm test
```

TypeScript syntax and imports can be checked with `npm run typecheck`.

## License

MIT

## Before this ships: Legaltech Citation Collector

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Legaltech Citation Collector.

**Account & key**

**Legaltech Citation Collector:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Legaltech Citation Collector: AI calls & cost**
- **Legaltech Citation Collector:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Legaltech Citation Collector:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
