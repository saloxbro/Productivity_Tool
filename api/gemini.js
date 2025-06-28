// /api/gemini.js

export default async function handler(request, response) {
  // 1. We only accept POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Get the secret API key from Environment Variables
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ message: 'API key not configured.' });
  }

  const { prompt } = request.body;

  if (!prompt) {
    return response.status(400).json({ message: 'Prompt is required.' });
  }

  // 3. The URL for the actual Google API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    // 4. Make the call to the Google API from the server
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      // Forward the error from Google's API
      return response.status(geminiResponse.status).json({ message: `Google API Error: ${errorBody}` });
    }

    const data = await geminiResponse.json();

    // 5. Send the result back to your front-end
    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
}