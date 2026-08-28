const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export type SimulationAnswer = {
  questionId: string;
  value: number;
};

export const simulationQuestionIds = ['planning', 'quality', 'feedback', 'learning'] as const;

export const simulationQuestions = [
  { id: 'planning', text: 'Bạn sẽ bắt đầu nhiệm vụ bằng cách nào?', low: 'Làm ngay theo cảm tính', high: 'Phân tích yêu cầu và lập kế hoạch' },
  { id: 'quality', text: 'Khi phát hiện kết quả chưa đạt yêu cầu, bạn sẽ làm gì?', low: 'Bỏ qua để kịp thời gian', high: 'Kiểm tra nguyên nhân và cải thiện' },
  { id: 'feedback', text: 'Bạn phản ứng thế nào với phản hồi từ đồng đội?', low: 'Bảo vệ ý tưởng bằng mọi giá', high: 'Lắng nghe, hỏi rõ và thử nghiệm' },
  { id: 'learning', text: 'Nếu gặp công cụ chưa biết, bạn sẽ xử lý ra sao?', low: 'Chờ người khác giải quyết', high: 'Tìm tài liệu và thử từng bước' },
] as const;

export type SimulationCareer = {
  title: string;
  category: string;
  description: string;
  tags: string;
  requiredSkills?: string | null;
};

function hasAny(career: SimulationCareer, values: string[]) {
  const haystack = `${career.title} ${career.category} ${career.tags} ${career.requiredSkills ?? ''}`.toLowerCase();
  return values.some((value) => haystack.includes(value));
}

export function buildSimulationScenario(career: SimulationCareer | null) {
  if (!career) {
    return {
      title: 'Mô phỏng công việc',
      scenario: 'Chọn một nghề để CareerTwin tạo tình huống mô phỏng phù hợp với nghề đó.',
      questions: simulationQuestions,
    };
  }

  if (hasAny(career, ['data', 'analyst', 'sql', 'power bi', 'statistics'])) {
    return {
      title: `Mô phỏng ${career.title}`,
      scenario: 'Bạn nhận một bộ dữ liệu hành vi người dùng bị thiếu và nhiễu. Nhiệm vụ là làm sạch dữ liệu, tìm insight chính và trình bày khuyến nghị cho team sản phẩm.',
      questions: [
        { id: 'planning', text: 'Bạn sẽ xác định câu hỏi phân tích và dữ liệu cần kiểm tra như thế nào?', low: 'Mở file và lọc ngẫu nhiên', high: 'Xác định metric, giả thuyết và tiêu chí dữ liệu' },
        { id: 'quality', text: 'Khi phát hiện dữ liệu thiếu hoặc lệch, bạn xử lý ra sao?', low: 'Bỏ qua dòng lỗi', high: 'Ghi rule làm sạch và kiểm tra tác động' },
        { id: 'feedback', text: 'Nếu stakeholder phản biện insight của bạn, bạn phản hồi thế nào?', low: 'Bảo vệ biểu đồ hiện tại', high: 'Truy vết số liệu và kiểm chứng giả thuyết' },
        { id: 'learning', text: 'Nếu cần dùng một hàm SQL/BI chưa biết, bạn làm gì?', low: 'Chuyển việc cho người khác', high: 'Đọc tài liệu, thử mẫu nhỏ rồi áp dụng' },
      ],
    };
  }

  if (hasAny(career, ['design', 'ui', 'ux', 'figma', 'creative'])) {
    return {
      title: `Mô phỏng ${career.title}`,
      scenario: 'Bạn cần cải thiện màn hình onboarding có tỷ lệ bỏ dở cao. Nhiệm vụ là hiểu vấn đề người dùng, chỉnh flow và trình bày prototype.',
      questions: [
        { id: 'planning', text: 'Bạn bắt đầu nghiên cứu vấn đề onboarding như thế nào?', low: 'Chọn màu và layout mới ngay', high: 'Xem dữ liệu, phỏng vấn nhanh và xác định pain point' },
        { id: 'quality', text: 'Bạn kiểm tra chất lượng prototype ra sao?', low: 'Chỉ nhìn bằng mắt', high: 'Test task chính, kiểm tra edge case và accessibility' },
        { id: 'feedback', text: 'Khi PM/dev góp ý thiết kế khó triển khai, bạn xử lý thế nào?', low: 'Giữ nguyên vì đẹp', high: 'Cùng trade-off để giữ UX và khả năng build' },
        { id: 'learning', text: 'Nếu gặp pattern UX mới, bạn học và áp dụng ra sao?', low: 'Copy từ app khác', high: 'Tìm nguyên tắc, thử biến thể và đo phản hồi' },
      ],
    };
  }

  if (hasAny(career, ['marketing', 'content', 'business', 'growth'])) {
    return {
      title: `Mô phỏng ${career.title}`,
      scenario: 'Bạn được giao ra mắt một chiến dịch thu hút người dùng mới trong 2 tuần với ngân sách giới hạn.',
      questions: [
        { id: 'planning', text: 'Bạn lập kế hoạch chiến dịch như thế nào?', low: 'Đăng nhiều nội dung nhất có thể', high: 'Chọn mục tiêu, chân dung khách hàng, kênh và KPI' },
        { id: 'quality', text: 'Nếu campaign không đạt chỉ số ngày đầu, bạn làm gì?', low: 'Đổi toàn bộ thông điệp ngay', high: 'Đọc số liệu, A/B test và tối ưu từng giả thuyết' },
        { id: 'feedback', text: 'Khi sales/support phản ánh khách hàng hiểu sai thông điệp, bạn xử lý sao?', low: 'Cho rằng họ chưa giải thích tốt', high: 'Điều chỉnh copy dựa trên phản hồi thực tế' },
        { id: 'learning', text: 'Nếu phải dùng nền tảng ads mới, bạn tiếp cận thế nào?', low: 'Chạy theo gợi ý mặc định', high: 'Test ngân sách nhỏ, đọc benchmark và đo CAC' },
      ],
    };
  }

  if (hasAny(career, ['engineer', 'developer', 'coding', 'software', 'security', 'ai'])) {
    return {
      title: `Mô phỏng ${career.title}`,
      scenario: 'Bạn cần xây một tính năng nhỏ nhưng phải ổn định: nhận yêu cầu, thiết kế giải pháp, xử lý lỗi và bàn giao cho người dùng.',
      questions: [
        { id: 'planning', text: 'Bạn phân rã yêu cầu kỹ thuật như thế nào?', low: 'Code ngay phần dễ thấy', high: 'Xác định dữ liệu, API, trạng thái lỗi và test case' },
        { id: 'quality', text: 'Khi tính năng chạy nhưng có edge case lỗi, bạn làm gì?', low: 'Chấp nhận vì luồng chính chạy', high: 'Viết test, sửa nguyên nhân và kiểm tra hồi quy' },
        { id: 'feedback', text: 'Khi reviewer yêu cầu đổi hướng triển khai, bạn phản hồi sao?', low: 'Phản đối vì mất công', high: 'Hỏi rõ rủi ro, so sánh trade-off và cập nhật patch' },
        { id: 'learning', text: 'Nếu gặp thư viện hoặc API mới, bạn học thế nào?', low: 'Copy snippet chưa hiểu', high: 'Đọc docs, dựng ví dụ nhỏ rồi tích hợp' },
      ],
    };
  }

  return {
    title: `Mô phỏng ${career.title}`,
    scenario: `Bạn đang thử một nhiệm vụ thực tế trong nghề ${career.title}: ${career.description}`,
    questions: simulationQuestions,
  };
}

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
