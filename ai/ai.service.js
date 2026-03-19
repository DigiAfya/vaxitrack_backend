const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const OR_API_KEY = process.env.OPENROUTER_API_KEY;

if (!HF_API_KEY) throw new Error("HUGGINGFACE_API_KEY not set");
if (!OR_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

/**
 * Get embedding vector from Hugging Face Router
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function getEmbedding(text) {
  const response = await axios.post(
    "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2",
    { inputs: text, options: { wait_for_model: true } },
    { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
  );
  return response.data[0];
}

/**
 * Compute cosine similarity
 */
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

/**
 * Call OpenRouter LLM for fallback
 */
async function generateLLMAnswer(question, context = "") {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "Answer ONLY from the provided FAQ context." },
        { role: "user", content: `Question: ${question}\n\nContext: ${context}` },
      ],
    },
    { headers: { Authorization: `Bearer ${OR_API_KEY}` } }
  );
  return response.data.choices[0].message.content;
}

module.exports = { getEmbedding, cosineSimilarity, generateLLMAnswer };