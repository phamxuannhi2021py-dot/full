const key = process.env.GEMINI_API_KEY;
const models = [...new Set([
  process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  ...(process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.5-flash-lite').split(',').map((item) => item.trim()),
].filter(Boolean))];

if (!key) {
  console.log(`Gemini smoke test skipped: GEMINI_API_KEY is empty. Configured model chain: ${models.join(' -> ')}`);
  process.exit(0);
}

let passed = 0;
for (const model of models) {
  const started = Date.now();
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Trả lời đúng hai từ: CareerTwin OK' }] }],
          // Gemini 3.6 can consume part of the output budget for reasoning before emitting text.
          generationConfig: { maxOutputTokens: 512, temperature: 0 },
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );
    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!response.ok || !text) throw new Error(payload?.error?.message || `HTTP ${response.status}`);
    passed += 1;
    console.log(`PASS ${model} (${Date.now() - started}ms): ${text.slice(0, 80)}`);
  } catch (error) {
    console.error(`FAIL ${model} (${Date.now() - started}ms): ${error instanceof Error ? error.message : error}`);
  }
}

console.log(`Gemini model smoke test: ${passed}/${models.length} passed.`);
if (passed === 0) process.exitCode = 1;
