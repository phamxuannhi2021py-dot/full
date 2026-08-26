const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export type SimulationAnswer = {
  questionId: string;
  value: number;
};

export const simulationQuestions = [
  { id: 'planning', text: 'Bạn sẽ bắt đầu nhiệm vụ bằng cách nào?', low: 'Làm ngay theo cảm tính', high: 'Phân tích yêu cầu và lập kế hoạch' },
  { id: 'quality', text: 'Khi phát hiện kết quả chưa đạt yêu cầu, bạn sẽ làm gì?', low: 'Bỏ qua để kịp thời gian', high: 'Kiểm tra nguyên nhân và cải thiện' },
  { id: 'feedback', text: 'Bạn phản ứng thế nào với phản hồi từ đồng đội?', low: 'Bảo vệ ý tưởng bằng mọi giá', high: 'Lắng nghe, hỏi rõ và thử nghiệm' },
  { id: 'learning', text: 'Nếu gặp công cụ chưa biết, bạn sẽ xử lý ra sao?', low: 'Chờ người khác giải quyết', high: 'Tìm tài liệu và thử từng bước' },
] as const;

export function scoreSimulation(answers: SimulationAnswer[]) {
  const normalized = simulationQuestions.map((question) => {
    const found = answers.find((answer) => answer.questionId === question.id);
    return clamp(Number(found?.value ?? 0));
  });
  const score = clamp(normalized.reduce((sum, value) => sum + value, 0) / normalized.length);
  const feedback = score >= 85
    ? 'Bạn thể hiện tư duy có cấu trúc, chủ động học hỏi và tiếp nhận phản hồi rất tốt.'
    : score >= 70
      ? 'Bạn có nền tảng phù hợp. Hãy luyện thêm việc lập kế hoạch và kiểm tra chất lượng đầu ra.'
      : 'Bạn nên thử thêm các nhiệm vụ nhỏ, ghi lại cách giải quyết và xin phản hồi sau mỗi lần thực hành.';
  return { score, feedback };
}
