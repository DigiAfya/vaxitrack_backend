const express = require("express");
const router = express.Router();
const { askQuestion } = require("../assistant/vaccineAssistant_simple");
const sendResponse = require("../utilities/response.util");

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return sendResponse(res, { success: false, message: "Question is required", statusCode: 400 });
    }
    const answer = await askQuestion(question);
    return sendResponse(res, { success: true, message: "VaxiBot response", data: { answer, source: "groq" } });
  } catch (err) {
    return sendResponse(res, { success: false, message: err.message, statusCode: 500 });
  }
});

module.exports = router;