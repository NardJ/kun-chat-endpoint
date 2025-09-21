export default function handler(req, res) {
  res.status(200).json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    allowedOrigin: process.env.ALLOWED_ORIGIN || null
  });
}
