import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
You are a flashcard creator. You take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards": [
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`;

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function POST(req) {
  const data = await req.text();

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro", // Ensure you use the correct model name
  });

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  // Send the system prompt with the user data to Gemini AI
  const result = await chatSession.sendMessage(systemPrompt + data);

  // Assuming the result is in the format we expect (plain text containing JSON)
  let flashcards;
  try {
    flashcards = JSON.parse(result.response.text());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse response from Gemini AI' }, { status: 500 });
  }

  return NextResponse.json(flashcards.flashcard);
}
