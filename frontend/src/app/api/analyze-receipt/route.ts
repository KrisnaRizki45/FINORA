import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    const prompt = `
      Extract the following details from this image (which could be a store receipt or a bank transfer screenshot).
      Return the output STRICTLY as a JSON object matching this exact schema:
      {
        "amount": (number, the total amount paid or received. Do NOT include currency symbols, just the number),
        "merchant": (string, name of the store, recipient, or sender),
        "date": (string, format YYYY-MM-DD, guess the closest date if format differs),
        "reference": (string, reference number if any, else ""),
        "category_hint": (string, a short category guess like 'Food', 'Transfer', 'Shopping', 'Utilities'),
        "notes": (string, a short summary of the transaction),
        "type": (string, MUST BE exactly "expense" or "income". If it's a payment receipt or shopping it is "expense". If it's receiving money it is "income")
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: file.type, data: base64Data } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json({ error: 'Failed to parse AI response into JSON' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process image' }, { status: 500 });
  }
}
