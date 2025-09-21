// Serverless endpoint: POST /api/chat
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Optioneel: CORS beperken tot jouw site
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || ""; // bv. https://krachtuitnatuur.nl

export default async function handler(req, res) {
  // CORS
  if (ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const systemPrompt = `
Je bent een Nederlandstalige assistent voor krachtuitnatuur.nl.
- Antwoord kort en duidelijk, in het Nederlands.
- Link waar passend naar interne pagina’s (relatieve urls).
- Leg toedieningsvormen uit (eten, drinken, druppels, huid, geur) indien relevant.
- Geen medische claims. Sluit af met: "Informatief; geen medisch advies."
- Weet je iets niet zeker? Zeg dat eerlijk of verwijs naar de Kennisbank-overzichtspagina.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ]
    });

    res.status(200).json({ reply: completion.choices?.[0]?.message?.content ?? "" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat endpoint error" });
  }
}

