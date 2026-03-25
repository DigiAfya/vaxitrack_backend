/**
 * Simple Q&A Vaccine Assistant using Groq
 * No conversation history - each question is independent.
 *
 * HOW THE BACKEND USES IT:
 *   const { askQuestion } = require('./vaccineAssistant_simple');
 *   const answer = await askQuestion("What is BCG?");
 */

"use strict";

require("dotenv").config();
const Groq = require("groq-sdk");

// Initialise Groq client using API key from .env file
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are VaxiBot, a friendly and knowledgeable vaccine assistant for VaxiTrack — 
a digital vaccination tracking app.

Your job is to help users understand vaccines, vaccination schedules, 
and immunisation in general.

RULES YOU MUST FOLLOW:
1. Only answer questions related to vaccines, immunisation, and vaccination schedules.
2. If a user asks something unrelated to vaccines (e.g. politics, cooking, coding), 
   politely say: "I can only help with vaccine-related questions. Please ask your doctor for other health concerns."
3. Always be friendly, simple, and easy to understand — users may not have medical backgrounds.
4. Never diagnose a disease or prescribe medication.
5. Always end responses that involve personal health decisions with: 
   "Please consult a healthcare provider for personal medical advice."
6. Keep answers concise — no more than 4 short paragraphs.
7. If you don't know something, say so honestly rather than guessing.

You support users in Nigeria and Africa, so be aware of locally relevant vaccines 
like Yellow Fever, Meningitis, and the Nigerian routine immunisation schedule.
`.trim();


/**
 * Ask a single question and get an answer - no history tracking.
 *
 * @param {string} question - The question the user typed
 * @returns {string} The AI's response
 *
 * EXAMPLE:
 *   const answer = await askQuestion("What is the BCG vaccine?");
 *   console.log(answer);
 */
async function askQuestion(question) {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: question }
    ],
    temperature: 0.7,
    max_tokens: 512,
  });

  return response.choices[0]?.message?.content || "Sorry, I could not generate a response. Please try again.";
}


// EXPORTS
module.exports = { askQuestion };


// INTERACTIVE MODE — run: node vaccineAssistant_simple.js
if (require.main === module) {
  const readline = require("readline");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n===== VaxiBot - Simple Q&A =====");
  console.log("Ask me anything about vaccines!");
  console.log("Type 'exit' to quit.\n");

  const prompt = () => {
    rl.question("You: ", async (input) => {
      const question = input.trim();

      if (question.toLowerCase() === "exit") {
        console.log("\nGoodbye! Stay vaccinated!\n");
        rl.close();
        return;
      }

      if (!question) {
        prompt();
        return;
      }

      try {
        const answer = await askQuestion(question);
        console.log("\nVaxiBot:", answer, "\n");
      } catch (error) {
        console.log("\nError:", error.message, "\n");
      }

      prompt();
    });
  };

  prompt();
}
