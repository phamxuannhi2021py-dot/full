import type { Career } from '@prisma/client';
import { recommend, type UserSignal } from './recommendation-engine';

export type AIReply = { answer: string; provider: 'gemini' | 'compatible' | 'local'; model: string };
type ConversationTurn = { role: string; content: string };

function buildContext(careers: Career[], signal: UserSignal) {
  const ranked = recommend(careers, signal).slice(0, 5);
  return {
    ranked,
    system: [
      'Bạn là CareerTwin AI, cố vấn hướng nghiệp dành cho học sinh, sinh viên và người đi làm tại Việt Nam.',
      'Trả lời bằng tiếng Việt rõ ràng, thực tế và tôn trọng quyền tự quyết của người dùng.',
      'Không khẳng định chắc chắn một nghề sẽ thành công. Nêu lý do dựa trên hồ sơ, điểm còn thiếu và bước thử nghiệm tiếp theo.',
      'Nếu câu hỏi liên quan sức khỏe tâm thần, pháp lý hoặc tài chính, chỉ cung cấp thông tin chung và khuyến nghị gặp chuyên gia.',
      `Các nghề phù hợp theo mô hình CareerTwin: ${ranked.map((item) => `${item.title} (${item.match}%)`).join(', ')}.`,
      'Giữ câu trả lời trong khoảng 150-350 từ, ưu tiên các bước hành động cụ thể.',
    ].join(' '),
  };
}

function localAnswer(careers: Career[], signal: UserSignal): AIReply {
  const ranked = recommend(careers, signal).slice(0, 3);
  const top = ranked[0];
  const answer = top
    ? `Dựa trên hồ sơ hiện tại, ba hướng phù hợp nhất là ${ranked.map((item) => `${item.title} (${item.match}%)`).join(', ')}. ${top.title} đang đứng đầu nhờ mức phù hợp về sở thích, kỹ năng và nhu cầu thị trường. Bạn nên thử một mô phỏng nghề, đối chiếu các kỹ năng còn thiếu trong Career Map, rồi hoàn thành một dự án nhỏ trong 2-4 tuần trước khi quyết định. Kết quả này là gợi ý định hướng, không phải kết luận cố định.`
    : 'Hãy hoàn thiện sở thích, kỹ năng và mục tiêu trong hồ sơ. CareerTwin sẽ dùng các dữ liệu đó để tạo gợi ý nghề và lộ trình phù hợp hơn.';
  return { answer, provider: 'local', model: 'careertwin-deterministic-v2' };
}

async function askGemini(question: string, system: string, history: ConversationTurn[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const primary = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.5-flash-lite')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const models = [...new Set([primary, ...fallbacks])];
  const contents = [
    ...history.slice(-8).map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content.slice(0, 2_000) }],
    })),
    { role: 'user', parts: [{ text: question }] },
  ];
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
          }),
          signal: AbortSignal.timeout(25_000),
        },
      );
      if (!response.ok) continue;
      const payload = await response.json();
      const answer = payload?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || '')
        .join('')
        .trim();
      if (answer) return { answer, provider: 'gemini' as const, model };
    } catch {
      // The next configured stable model is attempted automatically.
    }
  }
  return null;
}

async function askCompatible(question: string, system: string, history: ConversationTurn[]) {
  if (!process.env.AI_API_URL || !process.env.AI_API_KEY) return null;
  try {
    const response = await fetch(process.env.AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.AI_MODEL || undefined,
        messages: [
          { role: 'system', content: system },
          ...history.slice(-8),
          { role: 'user', content: question },
        ],
        temperature: 0.35,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const answer = payload?.choices?.[0]?.message?.content || payload?.output_text;
    return typeof answer === 'string' && answer.trim()
      ? { answer: answer.trim(), provider: 'compatible' as const, model: process.env.AI_MODEL || 'compatible-chat' }
      : null;
  } catch {
    return null;
  }
}

export async function answerCareerQuestion(
  question: string,
  careers: Career[],
  signal: UserSignal,
  history: ConversationTurn[] = [],
): Promise<AIReply> {
  const { system } = buildContext(careers, signal);
  return await askGemini(question, system, history)
    ?? await askCompatible(question, system, history)
    ?? localAnswer(careers, signal);
}
