require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.list();
    const models = response; // Assuming response is iterable or has a property
    for await (const model of models) {
      console.log(model.name);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
