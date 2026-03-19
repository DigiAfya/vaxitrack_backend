const express = require("express");
const router = express.Router();
const { authorize } = require("../middleware/role.middleware");
const {
  getFaqs,
  addFaq,
  getVaccineFaqs,
  addVaccineFaq,
  askAI,
  getUnansweredQuestions,
  answerUnansweredQuestion,
} = require("../controllers/chat.controller");

// =======================
// General FAQs (user & admin)
// =======================

// Get all general FAQs (user)
router.get("/", getFaqs);

// Add a general FAQ (admin only)
router.post("/admin", authorize("admin"), addFaq);

// =======================
// Vaccine FAQs (user & admin)
// =======================

// Get all vaccine FAQs (user)
router.get("/vaccine", getVaccineFaqs);

// Add a vaccine FAQ (admin only)
router.post("/vaccine/admin", authorize("admin"), addVaccineFaq);

// =======================
// Chatbot AI
// =======================

// User asks a question (semantic search + OpenRouter fallback)
router.post("/ask", askAI);

// =======================
// Admin: Unanswered Questions
// =======================

// Get all unanswered questions
router.get("/unanswered", authorize("admin"), getUnansweredQuestions);

// Answer an unanswered question and add it to the FAQ
router.post("/unanswered/answer", authorize("admin"), answerUnansweredQuestion);

module.exports = router;