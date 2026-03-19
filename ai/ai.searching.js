const { FAQ, VaccineFAQ } = require("../models");
const { getEmbedding, cosineSimilarity } = require("./ai.service");

/**
 * Search all FAQs using embeddings
 * @param {string} question
 * @param {number} threshold - similarity threshold
 * @returns {Promise<{bestMatch, score}>}
 */
async function findBestFAQMatch(question, threshold = 0.75) {
  const queryEmbedding = await getEmbedding(question);

  let bestMatch = null;
  let highestScore = 0;

  const faqs = await FAQ.findAll();
  const vaccineFaqs = await VaccineFAQ.findAll();

  const check = (items, type) => {
    for (let item of items) {
      if (!item.embedding) continue;

      const score = cosineSimilarity(queryEmbedding, item.embedding);

      if (score > highestScore) {
        highestScore = score;

        bestMatch = {
          ...item.toJSON(),
          type,
          answer:
            type === "general"
              ? item.answer
              : `${item.vaccine_name}: ${item.description}. Doses: ${item.doses}. Administration: ${item.administration}. Age Range: ${item.age_range || "N/A"}`
        };
      }
    }
  };

  check(faqs, "general");
  check(vaccineFaqs, "vaccine");

  if (highestScore >= threshold) return { bestMatch, score: highestScore };

  return { bestMatch: null, score: highestScore };
}

module.exports = { findBestFAQMatch };