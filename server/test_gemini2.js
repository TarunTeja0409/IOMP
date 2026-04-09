require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testModel(modelName) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log(`Testing model: ${modelName}`);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Hello",
    });
    console.log(`Success with ${modelName}!`);
  } catch (err) {
    console.error(`Error with ${modelName}:`, err.message);
  }
}

async function run() {
  await testModel('gemini-2.0-flash-lite');
  await testModel('gemini-3.1-flash-live-preview');
  await testModel('gemini-2.5-pro');
}

run();
