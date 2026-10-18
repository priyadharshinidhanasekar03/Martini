const BASE = 'http://localhost:5000/api/gemini';

export async function askGemini(prompt) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || data.error || `Gemini error: ${res.status}`);
  }

  return data.text || '';
}