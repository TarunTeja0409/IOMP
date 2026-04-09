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
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.5-flash');
  await testModel('gemma-3-1b-it');
}

run();
