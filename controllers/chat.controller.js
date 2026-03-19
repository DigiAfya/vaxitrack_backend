const { FAQ, VaccineFAQ, UnansweredQuestion } = require("../models");
const { getEmbedding, generateLLMAnswer } = require("../ai/ai.service");
const {findBestFAQMatch} = require("../ai/ai.searching");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");

// user function
module.exports = {
  async getFaqs(req, res) {
    try {
      const faqs = await FAQ.findAll();
      return sendResponse(res, { success: true, message: "General FAQs retrieved", data: faqs });
    } catch (err) {
      return sendResponse(res, { success: false, message: err.message, statusCode: err.statusCode || 500 });
    }
  },

  async addFaq(req, res) {
    try {
      if (!req.user || req.user.role !== "admin") throw new ApiError(403, "Forbidden");
      const { question, answer, category } = req.body;
      const embedding = await getEmbedding(question);
      const faq = await FAQ.create({ question, answer, category, embedding });
      return sendResponse(res, { success: true, message: "FAQ added", data: faq });
    } catch (err) {
      return sendResponse(res, { success: false, message: err.message, data: err.errors || null, statusCode: err.statusCode || 500 });
    }
  },

  async getVaccineFaqs(req, res) {
    try {
      const faqs = await VaccineFAQ.findAll();
      return sendResponse(res, { success: true, message: "Vaccine FAQs retrieved", data: faqs });
    } catch (err) {
      return sendResponse(res, { success: false, message: err.message, statusCode: err.statusCode || 500 });
    }
  },

  async addVaccineFaq(req, res) {
    try {
      if (!req.user || req.user.role !== "admin") throw new ApiError(403, "Forbidden");
      const { vaccine_name, description, doses, info, administration, age_range, category } = req.body;
      const embedding = await getEmbedding(vaccine_name);
      const faq = await VaccineFAQ.create({
        vaccine_name, description, doses, info, administration, age_range, category, embedding
      });
      return sendResponse(res, { success: true, message: "Vaccine FAQ added", data: faq });
    } catch (err) {
      return sendResponse(res, { success: false, message: err.message, data: err.errors || null, statusCode: err.statusCode || 500 });
    }
  },

  async askAI(req, res) {
  try {
    const { question } = req.body;
    if (!question) 
      return sendResponse(res, { success: false, message: "Question is required", statusCode: 400 });

    //  Semantic search across FAQs
    const { bestMatch, score } = await findBestFAQMatch(question);

    if (bestMatch) {
      // Found a good FAQ match
      return sendResponse(res, { 
        success: true, 
        message: "FAQ answer retrieved", 
        data: { answer: bestMatch.answer, source: bestMatch.type, score } 
      });
    }

    //  No match → store unanswered question
    const unanswered = await UnansweredQuestion.create({ 
      question, 
      asked_by: req.user?.id || null, 
      target_type: "general" 
    });

    //  Fetch relevant FAQ context (top 3 closest FAQs)
    const faqs = await FAQ.findAll();
    const vaccineFaqs = await VaccineFAQ.findAll();
    const allFAQs = [...faqs, ...vaccineFaqs];

    // Get embeddings of all FAQs (precomputed)
    const contextItems = allFAQs
      .filter(f => f.embedding)
      .map(f => `${f.question}: ${f.answer}`)
      .slice(0, 3) // take top 3 for context
      .join("\n");

    //  Call OpenRouter with context
    const llmAnswer = await generateLLMAnswer(question, contextItems);

    return sendResponse(res, { 
      success: true, 
      message: "LLM answer generated (unmatched question recorded)", 
      data: { answer: llmAnswer, source: "llm" } 
    });

  } catch (err) {
    return sendResponse(res, { 
      success: false, 
      message: err.message, 
      statusCode: err.statusCode || 500 
    });
  }
  },

  // Admin: get unanswered
  async getUnansweredQuestions(req, res) {
    try {
      if (!req.user || req.user.role !== "admin") throw new ApiError(403, "Forbidden");
      const questions = await UnansweredQuestion.findAll();
      return sendResponse(res, { success: true, message: "Unanswered questions retrieved", data: questions });
    } catch (err) {
      return sendResponse(res, { success: false, message: err.message, statusCode: err.statusCode || 500 });
    }
  },

  // Admin: answer an unanswered question
  async answerUnansweredQuestion(req, res) {
    try {
      if (!req.user || req.user.role !== "admin") throw new ApiError(403, "Forbidden");
      const { id, answer, category } = req.body;

      const questionEntry = await UnansweredQuestion.findByPk(id);
      if (!questionEntry) throw new ApiError(404, "Unanswered question not found");

      let faq;
      if (questionEntry.target_type === "general") {
        const embedding = await getEmbedding(questionEntry.question);
        faq = await FAQ.create({ question: questionEntry.question, answer, category, embedding });
      } else if (questionEntry.target_type === "vaccine") {
        const embedding = await getEmbedding(questionEntry.question);
        faq = await VaccineFAQ.create({
          vaccine_name: questionEntry.question,
          description: answer,
          doses: "N/A",
          administration: "N/A",
          age_range: "N/A",
          category,
          embedding
        });
      }

      questionEntry.resolved_to_id = faq.faq_id;
      await questionEntry.save();

      return sendResponse(res, { success: true, message: "Unanswered question answered and added to FAQ", data: faq });
    } catch (err) {
      return sendResponse(res, { success: false, message: err.message, data: err.errors || null, statusCode: err.statusCode || 500 });
    }
  }
};