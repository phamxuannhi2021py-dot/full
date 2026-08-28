import { z } from 'zod';

export const SimulationOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  consequence: z.string(),
  scores: z.record(z.string(), z.number().min(-20).max(30)),
  nextStep: z.number().nullable().optional(),
});

export const SimulationWorldSchema = z.object({
  role: z.string(),
  workplace: z.string(),
  mission: z.string(),
  scenario: z.string(),
  artifacts: z.array(z.object({
    type: z.string(),
    title: z.string(),
    data: z.unknown(),
  })),
  tasks: z.array(z.object({
    step: z.number().int().min(1),
    type: z.string(),
    prompt: z.string(),
    artifacts: z.array(z.string()).default([]),
    options: z.array(SimulationOptionSchema).min(2),
  })).min(1),
  evaluationDimensions: z.record(z.string(), z.number().min(1).max(100)),
});

export type SimulationWorld = z.infer<typeof SimulationWorldSchema>;

const baseDimensions = {
  logic: 20,
  problemSolving: 20,
  communication: 20,
  attentionToDetail: 20,
  decisionMaking: 20,
};

export function buildTemplateWorld(career: { title: string; category: string; description: string; tags: string; requiredSkills?: string | null }): SimulationWorld {
  const text = `${career.title} ${career.category} ${career.tags} ${career.requiredSkills ?? ''}`.toLowerCase();
  const classifier = `${career.title} ${career.category} ${career.tags}`.toLowerCase();
  if (classifier.includes('data')) {
    return SimulationWorldSchema.parse({
      role: 'Junior Data Analyst',
      workplace: 'E-commerce analytics team',
      mission: 'Tìm nguyên nhân doanh thu giảm 18% trước cuộc họp 3 giờ chiều.',
      scenario: 'Sáng thứ hai, manager gửi dashboard doanh thu giảm mạnh. Bạn có dữ liệu đơn hàng, funnel checkout và phản hồi khách hàng cần phân tích nhanh.',
      artifacts: [
        { type: 'kpi', title: 'Revenue KPI', data: { revenueChange: '-18%', conversionChange: '-11%', aovChange: '+2%' } },
        { type: 'table', title: 'Checkout Funnel', data: [['Step','Last Month','This Month'],['Cart','100%','100%'],['Shipping','72%','61%'],['Payment','55%','42%']] },
        { type: 'reviews', title: 'Customer Feedback', data: ['Phí ship hiển thị quá muộn', 'Thanh toán bị timeout', 'Không thấy mã giảm giá'] },
      ],
      tasks: [
        { step: 1, type: 'investigate', prompt: 'Bạn kiểm tra điểm nào trước?', artifacts: ['Revenue KPI','Checkout Funnel'], options: [
          { id: 'aov', label: 'Tập trung vào AOV vì liên quan doanh thu', consequence: 'AOV tăng nhẹ nên không giải thích được mức giảm lớn.', scores: { logic: -3 } },
          { id: 'funnel', label: 'So sánh funnel từng bước để tìm điểm rớt bất thường', consequence: 'Bạn xác định bước Shipping/Payment là nguồn giảm chính.', scores: { analyticalThinking: 15, logic: 10 } },
        ] },
        { step: 2, type: 'hypothesis', prompt: 'Giả thuyết nào đáng kiểm chứng?', artifacts: ['Customer Feedback'], options: [
          { id: 'ads', label: 'Quảng cáo sai tệp khách hàng', consequence: 'Có thể đúng nhưng chưa được dữ liệu checkout ủng hộ.', scores: { decisionMaking: -4 } },
          { id: 'shipping', label: 'Phí ship và lỗi payment làm rớt conversion', consequence: 'Giả thuyết khớp funnel và feedback.', scores: { problemSolving: 12, communication: 6 } },
        ] },
      ],
      evaluationDimensions: { analyticalThinking: 30, logic: 25, problemSolving: 20, communication: 15, attentionToDetail: 10 },
    });
  }

  if (classifier.includes('software') || classifier.includes('developer') || classifier.includes('coding')) {
    return SimulationWorldSchema.parse({
      role: 'Software Engineer',
      workplace: 'Product engineering squad',
      mission: 'Điều tra bug khiến người dùng không lưu được thay đổi hồ sơ.',
      scenario: 'QA gửi bug report: PATCH /api/profile thỉnh thoảng trả 500. Bạn có log, snippet request và yêu cầu không phá flow hiện tại.',
      artifacts: [
        { type: 'logs', title: 'Server Logs', data: ['P2025: record not found', 'PATCH /api/profile 500', 'userId present in session'] },
        { type: 'code', title: 'Route Snippet', data: 'await tx.profile.update({ where: { userId }, data })' },
        { type: 'ticket', title: 'QA Ticket', data: { severity: 'high', repro: 'new account without profile edge case' } },
      ],
      tasks: [
        { step: 1, type: 'debug', prompt: 'Bạn xác định nguyên nhân nào?', artifacts: ['Server Logs','Route Snippet'], options: [
          { id: 'frontend', label: 'Đổ lỗi frontend gửi sai dữ liệu', consequence: 'Session có userId nên hướng này thiếu bằng chứng.', scores: { logic: -5 } },
          { id: 'upsert', label: 'Profile chưa tồn tại nên update cần thành upsert', consequence: 'Bạn tìm đúng edge case dữ liệu.', scores: { logic: 14, attentionToDetail: 10 } },
        ] },
        { step: 2, type: 'tradeoff', prompt: 'Bạn chọn cách fix nào?', artifacts: ['QA Ticket'], options: [
          { id: 'quick', label: 'Catch lỗi rồi trả ok để UI không đỏ', consequence: 'Che lỗi và làm mất dữ liệu.', scores: { decisionMaking: -10 } },
          { id: 'safe', label: 'Dùng upsert, thêm validation và test regression', consequence: 'Fix bền và giữ đúng hợp đồng API.', scores: { problemSolving: 12, decisionMaking: 10 } },
        ] },
      ],
      evaluationDimensions: { logic: 30, problemSolving: 25, attentionToDetail: 20, decisionMaking: 15, communication: 10 },
    });
  }

  if (classifier.includes('security')) {
    return SimulationWorldSchema.parse({
      role: 'Junior Cybersecurity Analyst',
      workplace: 'SOC của một công ty SaaS',
      mission: 'Điều tra cảnh báo đăng nhập bất thường trước khi lan rộng.',
      scenario: 'Một cảnh báo high severity xuất hiện lúc 09:12. Có nhiều lần đăng nhập thất bại rồi thành công từ IP lạ vào tài khoản nhân sự.',
      artifacts: [
        { type: 'alert', title: 'SOC Alert', data: { severity: 'high', ip: '45.77.12.9', account: 'hr.lead@company.vn' } },
        { type: 'logs', title: 'Login Logs', data: [['09:03','fail','VN'],['09:09','fail','SG'],['09:12','success','SG']] },
      ],
      tasks: [
        { step: 1, type: 'investigate', prompt: 'Bạn ưu tiên hành động nào?', artifacts: ['SOC Alert','Login Logs'], options: [
          { id: 'ignore', label: 'Theo dõi thêm, chưa làm gì', consequence: 'Rủi ro tăng vì attacker có thêm thời gian.', scores: { decisionMaking: -10, attentionToDetail: -5 }, nextStep: 2 },
          { id: 'investigate', label: 'Kiểm tra log, thiết bị và phạm vi ảnh hưởng', consequence: 'Bạn có thêm bằng chứng trước khi chặn.', scores: { logic: 12, attentionToDetail: 12 }, nextStep: 2 },
          { id: 'block', label: 'Chặn IP và buộc reset phiên ngay', consequence: 'Mối đe dọa chậm lại nhưng cần kiểm tra false positive.', scores: { decisionMaking: 8, problemSolving: 6 }, nextStep: 2 },
        ] },
        { step: 2, type: 'communicate', prompt: 'Bạn báo cáo điều gì cho security lead?', artifacts: ['Login Logs'], options: [
          { id: 'vague', label: 'Có vẻ tài khoản bị hack', consequence: 'Thiếu bằng chứng nên khó quyết định.', scores: { communication: -6 } },
          { id: 'evidence', label: 'Nêu timeline, IP, account, impact và đề xuất containment', consequence: 'Lead có đủ dữ liệu để phê duyệt xử lý.', scores: { communication: 14, logic: 8 } },
        ] },
      ],
      evaluationDimensions: { logic: 25, attentionToDetail: 25, decisionMaking: 25, communication: 15, problemSolving: 10 },
    });
  }

  if (classifier.includes('design') || classifier.includes('ux') || classifier.includes('figma')) {
    return SimulationWorldSchema.parse({
      role: 'Product Designer',
      workplace: 'Team sản phẩm giáo dục',
      mission: 'Tìm nguyên nhân onboarding mobile rớt chuyển đổi và đề xuất thay đổi.',
      scenario: 'Conversion từ bước 2 sang bước 3 giảm mạnh trên mobile. PM cần bạn đưa evidence và phương án trước buổi review.',
      artifacts: [
        { type: 'dashboard', title: 'Funnel Metrics', data: { desktopDrop: '12%', mobileDrop: '38%', topComplaint: 'quá nhiều lựa chọn' } },
        { type: 'reviews', title: 'User Feedback', data: ['Không biết chọn kỹ năng nào', 'Nút tiếp tục nằm quá thấp', 'Màn hình hơi rối'] },
      ],
      tasks: [
        { step: 1, type: 'diagnose', prompt: 'Bạn chọn hướng điều tra nào?', artifacts: ['Funnel Metrics','User Feedback'], options: [
          { id: 'visual', label: 'Đổi màu CTA cho nổi hơn', consequence: 'Có thể giúp nhẹ nhưng chưa giải quyết nguyên nhân.', scores: { creativity: 4 } },
          { id: 'evidence', label: 'Kết hợp funnel, session replay và feedback để xác định bottleneck', consequence: 'Bạn tìm được vấn đề tương tác mobile.', scores: { logic: 10, problemSolving: 12, attentionToDetail: 8 } },
        ] },
        { step: 2, type: 'proposal', prompt: 'Bạn đề xuất gì trong review?', artifacts: ['User Feedback'], options: [
          { id: 'many-changes', label: 'Redesign toàn bộ onboarding', consequence: 'Rủi ro scope lớn và khó đo tác động.', scores: { decisionMaking: -5 } },
          { id: 'focused', label: 'Giảm lựa chọn mỗi bước, sticky CTA, test A/B trên mobile', consequence: 'Giải pháp đo được và phù hợp constraint.', scores: { communication: 10, decisionMaking: 12 } },
        ] },
      ],
      evaluationDimensions: { creativity: 25, problemSolving: 25, communication: 20, logic: 20, decisionMaking: 10 },
    });
  }

  if (classifier.includes('marketing') || classifier.includes('campaign') || classifier.includes('content')) {
    return SimulationWorldSchema.parse({
      role: 'Marketing Specialist',
      workplace: 'Growth team của một ứng dụng học tập',
      mission: 'Chẩn đoán chiến dịch ads có CTR ổn nhưng conversion thấp.',
      scenario: 'Chiến dịch mới tiêu 60% ngân sách tuần nhưng signup thấp. Bạn có KPI, audience và creative feedback.',
      artifacts: [
        { type: 'kpi', title: 'Campaign Metrics', data: { ctr: '3.8%', cpc: '4,200đ', signupRate: '0.7%', budgetSpent: '60%' } },
        { type: 'table', title: 'Audience Split', data: [['Audience','CTR','Signup'],['Students','4.4%','1.1%'],['Workers','3.1%','0.3%']] },
        { type: 'brief', title: 'Creative', data: 'Thông điệp nhấn mạnh AI nhưng landing page nói về trắc nghiệm nghề nghiệp.' },
      ],
      tasks: [
        { step: 1, type: 'diagnose', prompt: 'Bạn đọc dữ liệu thế nào?', artifacts: ['Campaign Metrics','Audience Split'], options: [
          { id: 'ctr', label: 'CTR ổn nên tăng ngân sách ngay', consequence: 'Bạn có thể đốt ngân sách khi conversion chưa ổn.', scores: { decisionMaking: -8 } },
          { id: 'segment', label: 'Tách performance theo audience và xem message-match', consequence: 'Bạn phát hiện Workers signup thấp và thông điệp lệch landing page.', scores: { analyticalThinking: 12, problemSolving: 10 } },
        ] },
        { step: 2, type: 'strategy', prompt: 'Bạn tối ưu gì trước?', artifacts: ['Creative'], options: [
          { id: 'new-logo', label: 'Đổi hình ảnh thương hiệu cho bắt mắt', consequence: 'Không nhắm đúng vấn đề conversion.', scores: { creativity: 3 } },
          { id: 'message', label: 'Tạo landing variant khớp ad và giảm ngân sách nhóm Workers', consequence: 'Bạn cải thiện funnel với thay đổi đo được.', scores: { decisionMaking: 12, communication: 8 } },
        ] },
      ],
      evaluationDimensions: { analyticalThinking: 25, creativity: 20, decisionMaking: 25, communication: 15, problemSolving: 15 },
    });
  }

  if (classifier.includes('recruiter') || classifier.includes('hr')) {
    return SimulationWorldSchema.parse({
      role: 'HR Recruiter',
      workplace: 'Talent acquisition team',
      mission: 'Shortlist ứng viên cho vị trí Frontend Developer trong 48 giờ.',
      scenario: 'Hiring manager cần 3 ứng viên phỏng vấn. Bạn có JD, 5 CV ngắn và constraint về lương/kỹ năng.',
      artifacts: [
        { type: 'document', title: 'Job Description', data: { mustHave: ['React','API','CSS'], niceToHave: ['Testing','Design system'] } },
        { type: 'cv', title: 'Candidate Snapshot', data: ['A: React mạnh, giao tiếp trung bình', 'B: Angular, salary cao', 'C: React + testing, ít năm kinh nghiệm'] },
      ],
      tasks: [
        { step: 1, type: 'shortlist', prompt: 'Bạn shortlist theo nguyên tắc nào?', artifacts: ['Job Description','Candidate Snapshot'], options: [
          { id: 'years', label: 'Chọn người nhiều năm kinh nghiệm nhất', consequence: 'Có thể bỏ qua fit kỹ năng thực tế.', scores: { decisionMaking: -3 } },
          { id: 'criteria', label: 'Chấm theo must-have, salary fit và bằng chứng dự án', consequence: 'Danh sách công bằng và bám nhu cầu tuyển dụng.', scores: { logic: 10, attentionToDetail: 10 } },
        ] },
        { step: 2, type: 'communication', prompt: 'Bạn trao đổi gì với hiring manager?', artifacts: ['Job Description'], options: [
          { id: 'names', label: 'Gửi tên 3 ứng viên', consequence: 'Thiếu lý do nên khó ra quyết định.', scores: { communication: -4 } },
          { id: 'evidence', label: 'Gửi shortlist kèm trade-off và câu hỏi phỏng vấn đề xuất', consequence: 'Manager hiểu rõ vì sao nên gặp từng người.', scores: { communication: 14, problemSolving: 6 } },
        ] },
      ],
      evaluationDimensions: { communication: 30, decisionMaking: 20, attentionToDetail: 20, logic: 15, empathy: 15 },
    });
  }

  if (classifier.includes('teacher') || classifier.includes('giáo viên') || classifier.includes('education')) {
    return SimulationWorldSchema.parse({
      role: 'Teacher',
      workplace: 'Lớp học trung học',
      mission: 'Thiết kế và điều chỉnh một tiết học khi học sinh có mức hiểu khác nhau.',
      scenario: 'Bạn cần dạy bài mới trong 45 phút. Một nhóm học sinh hiểu nhanh, một nhóm mất gốc, và lớp bắt đầu mất tập trung.',
      artifacts: [
        { type: 'profiles', title: 'Student Profiles', data: ['Nhóm A: làm bài nhanh', 'Nhóm B: sợ phát biểu', 'Nhóm C: thiếu nền tảng'] },
        { type: 'schedule', title: 'Lesson Plan', data: ['5p warm-up','15p concept','15p practice','10p reflection'] },
      ],
      tasks: [
        { step: 1, type: 'planning', prompt: 'Bạn chuẩn bị hoạt động học thế nào?', artifacts: ['Student Profiles','Lesson Plan'], options: [
          { id: 'lecture', label: 'Giảng một mạch để kịp bài', consequence: 'Nhóm mất gốc dễ bị bỏ lại.', scores: { empathy: -6 } },
          { id: 'differentiate', label: 'Chia mức bài tập và dùng kiểm tra nhanh giữa giờ', consequence: 'Bạn thấy nhóm nào cần hỗ trợ ngay.', scores: { empathy: 12, decisionMaking: 8 } },
        ] },
        { step: 2, type: 'classroom', prompt: 'Khi lớp mất tập trung, bạn làm gì?', artifacts: ['Student Profiles'], options: [
          { id: 'warn', label: 'Nhắc nhở chung cả lớp', consequence: 'Ổn định nhanh nhưng chưa kéo học sinh vào bài.', scores: { communication: 2 } },
          { id: 'active', label: 'Chuyển sang hoạt động cặp đôi có câu hỏi rõ ràng', consequence: 'Lớp tương tác lại và bạn quan sát được mức hiểu.', scores: { communication: 10, creativity: 8 } },
        ] },
      ],
      evaluationDimensions: { empathy: 25, communication: 25, creativity: 15, decisionMaking: 20, attentionToDetail: 15 },
    });
  }

  return SimulationWorldSchema.parse({
    role: `Junior ${career.title}`,
    workplace: `Môi trường ${career.category}`,
    mission: `Hoàn thành một nhiệm vụ thực tế của nghề ${career.title}.`,
    scenario: career.description,
    artifacts: [
      { type: 'brief', title: 'Work Brief', data: { career: career.title, context: career.description } },
      { type: 'tasks', title: 'Core Skills', data: (career.requiredSkills || career.tags).split(',').map((item) => item.trim()) },
    ],
    tasks: [
      { step: 1, type: 'planning', prompt: 'Bạn bắt đầu xử lý nhiệm vụ như thế nào?', artifacts: ['Work Brief'], options: [
        { id: 'rush', label: 'Làm ngay phần dễ thấy trước', consequence: 'Bạn có tiến độ nhanh nhưng dễ bỏ sót yêu cầu.', scores: { decisionMaking: -4 } },
        { id: 'plan', label: 'Xác định mục tiêu, dữ liệu cần có và tiêu chí hoàn thành', consequence: 'Bạn tạo được hướng làm rõ ràng.', scores: { logic: 10, problemSolving: 10 } },
      ] },
      { step: 2, type: 'delivery', prompt: 'Khi nhận phản hồi rằng kết quả chưa đủ tốt, bạn làm gì?', artifacts: ['Core Skills'], options: [
        { id: 'defend', label: 'Giải thích rằng mình đã làm đúng yêu cầu ban đầu', consequence: 'Bạn bỏ lỡ cơ hội cải thiện đầu ra.', scores: { communication: -5 } },
        { id: 'iterate', label: 'Hỏi rõ tiêu chí, sửa phần quan trọng và ghi lại bài học', consequence: 'Bạn cải thiện chất lượng và cách phối hợp.', scores: { communication: 10, attentionToDetail: 8 } },
      ] },
    ],
    evaluationDimensions: baseDimensions,
  });
}

export function scoreWorldDecisions(world: SimulationWorld, decisions: string[]) {
  const dimensionScores = Object.fromEntries(Object.keys(world.evaluationDimensions).map((key) => [key, 50]));
  const consequences: string[] = [];
  for (const task of world.tasks) {
    const option = task.options.find((item) => decisions.includes(item.id));
    if (!option) continue;
    consequences.push(option.consequence);
    for (const [dimension, delta] of Object.entries(option.scores)) {
      dimensionScores[dimension] = Math.max(0, Math.min(100, (dimensionScores[dimension] ?? 50) + delta));
    }
  }
  const totalWeight = Object.values(world.evaluationDimensions).reduce((sum, value) => sum + value, 0);
  const score = Math.round(Object.entries(world.evaluationDimensions).reduce((sum, [dimension, weight]) => {
    return sum + (dimensionScores[dimension] ?? 50) * weight;
  }, 0) / totalWeight);
  return { score, dimensionScores, consequences };
}
