import { NextResponse } from 'next/server';

const systemPrompt = `
You are a flashcard creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`;

export async function POST(req) {
  const data = await req.text();

  const response = await fetch('https://api.gemini.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      prompt: systemPrompt + data,
      model: 'gemini-1',
      response_format: {type: 'json_object'},
    })
  });

  const result = await response.json();

  // Assuming the response structure is similar to OpenAI's:
  const flashcards = JSON.parse(result.choices[0].message.content);

  return NextResponse.json(flashcards.flashcard);
}

