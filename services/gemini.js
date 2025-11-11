require("dotenv").config();
const { mentionMap } = require("../config/gemini_system_instr");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args)); 

async function fetchGeminiResponse(systemInstruction, userMessage) {
  const body = {
    systemInstruction: {
      role: "system",
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errMsg = await response.text();
      console.error("Gemini API Error:", errMsg);
      return "Anne couldn’t process that right now";
    }

    const data = await response.json();
    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "I didn’t get that.";

    for (const [tag, mention] of Object.entries(mentionMap)) {
      const regex = new RegExp(tag, "gi");
      reply = reply.replace(regex, mention);
    }

    if (reply.startsWith("Anne:")) reply = reply.slice(5);

    return reply.trim();
  } catch (err) {
    console.error("Error calling Gemini API:", err.message);
    return "Error occurred while fetching Gemini response.";
  }
}


module.exports = { fetchGeminiResponse }