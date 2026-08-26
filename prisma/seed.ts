import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const careers = [
  { slug:'ui-ux-designer', title:'UI/UX Designer', category:'Sáng tạo', description:'Thiết kế giao diện và trải nghiệm người dùng cho sản phẩm số.', salaryMin:18, salaryMax:30, demand:85, creativity:95, logic:72, communication:76, competition:60, tags:'design,creative,communication,problem-solving', requiredSkills:'Figma,UI Design,UX Research,Prototyping', workEnvironment:'Văn phòng / Hybrid', roadmap:'Nền tảng thiết kế|Figma và prototype|UX Research|Portfolio cá nhân|Thực tập sản phẩm|Product Design' },
  { slug:'product-designer', title:'Product Designer', category:'Sáng tạo', description:'Giải quyết vấn đề sản phẩm bằng nghiên cứu, thiết kế và thử nghiệm.', salaryMin:20, salaryMax:38, demand:89, creativity:94, logic:80, communication:84, competition:64, tags:'design,product,creative,analysis', requiredSkills:'Product Thinking,Figma,Research,Design System', workEnvironment:'Văn phòng / Hybrid', roadmap:'Visual basics|Product thinking|Research|Design system|Portfolio|Lead design' },
  { slug:'frontend-developer', title:'Frontend Developer', category:'Công nghệ thông tin', description:'Xây dựng giao diện web, ứng dụng và trải nghiệm tương tác.', salaryMin:20, salaryMax:35, demand:94, creativity:70, logic:92, communication:62, competition:70, tags:'technology,coding,logic,problem-solving', requiredSkills:'HTML,CSS,JavaScript,React,Testing', workEnvironment:'Văn phòng / Remote', roadmap:'HTML và CSS|JavaScript|React|API và Testing|Deployment|System Design' },
  { slug:'digital-marketing', title:'Digital Marketing', category:'Kinh doanh', description:'Lập chiến lược và triển khai các chiến dịch marketing số.', salaryMin:15, salaryMax:28, demand:88, creativity:88, logic:65, communication:90, competition:66, tags:'business,marketing,creative,communication', requiredSkills:'Content,Ads,Analytics,SEO,Campaign', workEnvironment:'Văn phòng / Hybrid', roadmap:'Marketing căn bản|Content|Ads|Analytics|Campaign|Growth' },
  { slug:'data-analyst', title:'Data Analyst', category:'Công nghệ thông tin', description:'Thu thập, làm sạch, phân tích và diễn giải dữ liệu để hỗ trợ quyết định.', salaryMin:18, salaryMax:32, demand:92, creativity:55, logic:96, communication:70, competition:58, tags:'technology,data,logic,analysis', requiredSkills:'Excel,SQL,Statistics,Python,Power BI', workEnvironment:'Văn phòng / Hybrid', roadmap:'Excel|SQL|Statistics|Python|BI Dashboard|Portfolio' },
  { slug:'software-engineer', title:'Software Engineer', category:'Công nghệ thông tin', description:'Thiết kế và phát triển hệ thống phần mềm giải quyết vấn đề thực tế.', salaryMin:22, salaryMax:45, demand:97, creativity:72, logic:98, communication:66, competition:72, tags:'technology,coding,logic,engineering', requiredSkills:'Programming,DSA,Database,Cloud,System Design', workEnvironment:'Văn phòng / Remote', roadmap:'Programming|DSA|Backend|Database|Cloud|System Design' },
  { slug:'product-manager', title:'Product Manager', category:'Kinh doanh', description:'Định hình sản phẩm từ vấn đề người dùng đến chiến lược và triển khai.', salaryMin:25, salaryMax:45, demand:86, creativity:82, logic:82, communication:95, competition:75, tags:'business,product,communication,analysis', requiredSkills:'Product Thinking,Research,Analytics,Leadership,Strategy', workEnvironment:'Văn phòng / Hybrid', roadmap:'Product thinking|Research|Roadmapping|Analytics|Leadership|Strategy' },
  { slug:'ai-engineer', title:'AI Engineer', category:'Công nghệ thông tin', description:'Xây dựng và triển khai hệ thống AI, machine learning và ứng dụng thông minh.', salaryMin:25, salaryMax:55, demand:99, creativity:78, logic:99, communication:62, competition:78, tags:'technology,ai,coding,math,analysis', requiredSkills:'Python,Math,Machine Learning,Deep Learning,MLOps', workEnvironment:'Văn phòng / Remote', roadmap:'Python|Math|Machine Learning|Deep Learning|MLOps|AI Product' },
  { slug:'cyber-security', title:'Chuyên viên An ninh mạng', category:'Công nghệ thông tin', description:'Bảo vệ hệ thống, dữ liệu và người dùng trước các rủi ro an toàn thông tin.', salaryMin:22, salaryMax:46, demand:96, creativity:60, logic:98, communication:65, competition:55, tags:'technology,security,logic,engineering', requiredSkills:'Networking,Linux,Security,SIEM,Incident Response', workEnvironment:'Văn phòng / Hybrid', roadmap:'Networking|Linux|Security basics|Blue Team|Cloud Security|Security Lead' },
  { slug:'business-analyst', title:'Business Analyst', category:'Kinh doanh', description:'Phân tích nhu cầu kinh doanh và kết nối các bên để tạo giải pháp hiệu quả.', salaryMin:18, salaryMax:35, demand:91, creativity:68, logic:90, communication:92, competition:62, tags:'business,analysis,communication,product', requiredSkills:'Requirement,Process,SQL,Communication,Documentation', workEnvironment:'Văn phòng / Hybrid', roadmap:'Business basics|Requirement|Process modeling|SQL|Product delivery|Lead BA' },
  { slug:'content-creator', title:'Content Creator', category:'Sáng tạo', description:'Sáng tạo nội dung đa nền tảng để truyền tải thông điệp và xây dựng cộng đồng.', salaryMin:12, salaryMax:30, demand:84, creativity:97, logic:55, communication:94, competition:82, tags:'creative,content,communication,marketing', requiredSkills:'Writing,Video,Storytelling,Social Media,Analytics', workEnvironment:'Linh hoạt / Remote', roadmap:'Storytelling|Writing|Video basics|Channel growth|Brand deals|Creative Lead' },
  { slug:'environmental-engineer', title:'Kỹ sư Môi trường', category:'Kỹ thuật', description:'Ứng dụng khoa học và kỹ thuật để xử lý ô nhiễm và phát triển bền vững.', salaryMin:16, salaryMax:32, demand:83, creativity:65, logic:91, communication:68, competition:45, tags:'science,engineering,environment,problem-solving', requiredSkills:'Chemistry,Data,Environmental Law,Project,Field Work', workEnvironment:'Văn phòng / Hiện trường', roadmap:'Science foundation|Environment basics|Field practice|Project|Certification|Technical Lead' },
] as const;

const articles = [
  { slug:'frontend-roadmap', title:'Lộ trình trở thành Frontend Developer', category:'Công nghệ', description:'Từ HTML/CSS đến React, API và triển khai sản phẩm.', minutes:10, featured:true, content:'Frontend Developer cần nền tảng HTML, CSS và JavaScript vững chắc. Sau đó, hãy học React, cách làm việc với API, quản lý trạng thái, kiểm thử và triển khai. Mỗi giai đoạn nên kết thúc bằng một dự án có thể trình bày trong portfolio.' },
  { slug:'career-goals', title:'Cách xác định mục tiêu nghề nghiệp phù hợp', category:'Hướng nghiệp', description:'Biến sở thích, điểm mạnh và giá trị cá nhân thành mục tiêu rõ ràng.', minutes:8, featured:true, content:'Một mục tiêu nghề nghiệp tốt nằm ở giao điểm giữa điều bạn thích, điều bạn làm tốt, nhu cầu thị trường và môi trường sống bạn mong muốn. Hãy viết mục tiêu theo mốc 6 tháng, 1 năm và 3 năm, sau đó đo bằng kỹ năng hoặc sản phẩm cụ thể.' },
  { slug:'communication', title:'Kỹ năng giao tiếp hiệu quả cho người đi làm', category:'Kỹ năng mềm', description:'Các nguyên tắc giao tiếp, phản hồi và trình bày trong học tập và công việc.', minutes:6, featured:false, content:'Giao tiếp hiệu quả bắt đầu bằng lắng nghe chủ động, đặt câu hỏi rõ ràng và xác nhận lại điều đã hiểu. Khi phản hồi, tập trung vào hành vi và tác động thay vì phán xét con người.' },
  { slug:'ai-future', title:'Trí tuệ nhân tạo và tương lai nghề nghiệp', category:'Công nghệ', description:'AI thay đổi công việc như thế nào và bạn nên chuẩn bị kỹ năng gì.', minutes:12, featured:true, content:'AI đang tự động hóa từng phần của công việc, đồng thời tạo ra vai trò mới. Kỹ năng bền vững gồm tư duy vấn đề, hiểu dữ liệu, giao tiếp, đạo đức số và khả năng cộng tác với công cụ AI.' },
  { slug:'study-method', title:'Phương pháp học tập hiệu quả', category:'Học tập', description:'Xây dựng hệ thống học tập bền vững, tập trung và đo lường được.', minutes:7, featured:false, content:'Hãy chia nội dung thành các phiên ngắn, chủ động nhớ lại kiến thức và ôn lặp lại theo khoảng cách. Theo dõi đầu ra bằng bài tập hoặc dự án, không chỉ bằng số giờ học.' },
  { slug:'time-management', title:'Quản lý thời gian hiệu quả dành cho học sinh', category:'Kỹ năng mềm', description:'Ưu tiên việc quan trọng và duy trì năng lượng học tập.', minutes:9, featured:false, content:'Lập kế hoạch theo tuần, chọn ba việc quan trọng mỗi ngày và bảo vệ các khung tập trung. Chừa khoảng trống cho việc phát sinh và đánh giá lại kế hoạch cuối tuần.' },
  { slug:'html-css-basics', title:'HTML, CSS cơ bản cho người mới bắt đầu', category:'Công nghệ', description:'Nền tảng đầu tiên để xây dựng giao diện web.', minutes:11, featured:false, content:'Bắt đầu với HTML semantic, box model, flexbox, grid và responsive design. Sau mỗi phần, hãy dựng lại một giao diện nhỏ để biến kiến thức thành kỹ năng.' },
  { slug:'future-careers', title:'Những ngành nghề hot trong 5 năm tới', category:'Hướng nghiệp', description:'Các nhóm nghề có nhu cầu tăng nhờ công nghệ và chuyển đổi xanh.', minutes:8, featured:false, content:'Dữ liệu, AI, an ninh mạng, y tế số, sản phẩm số và công nghệ xanh tiếp tục có nhu cầu. Tuy nhiên, nên chọn dựa trên mức độ phù hợp cá nhân thay vì chỉ chạy theo xu hướng.' },
] as const;

async function main() {
  for (const career of careers) {
    await prisma.career.upsert({ where:{slug:career.slug}, update:career, create:career });
  }
  for (const article of articles) {
    await prisma.article.upsert({ where:{slug:article.slug}, update:article, create:article });
  }

  const email = 'demo@careertwin.vn';
  const passwordHash = await bcrypt.hash('CareerTwin123!', 12);
  const user = await prisma.user.upsert({
    where:{email},
    update:{passwordHash},
    create:{name:'CareerTwin Demo',email,passwordHash,role:'student',onboardingCompletedAt:new Date()},
  });
  await prisma.profile.upsert({
    where:{userId:user.id},
    update:{},
    create:{userId:user.id,education:'Học sinh',grade:'12',city:'TP. Hồ Chí Minh',readiness:82},
  });
  await prisma.userSetting.upsert({where:{userId:user.id},update:{},create:{userId:user.id}});
  for (const key of ['technology','creative','problem-solving','design']) {
    await prisma.userInterest.upsert({where:{userId_key:{userId:user.id,key}},update:{weight:100},create:{userId:user.id,key,weight:100}});
  }
  for (const [key,level] of [['coding',70],['design',85],['communication',72],['office',78],['analysis',65]] as const) {
    await prisma.userSkill.upsert({where:{userId_key:{userId:user.id,key}},update:{level},create:{userId:user.id,key,level}});
  }
  await prisma.userGoal.upsert({
    where:{userId_key:{userId:user.id,key:'career-growth'}},
    update:{},
    create:{userId:user.id,key:'career-growth',horizon:'1-3',detail:'Phát triển nghề nghiệp theo thế mạnh cá nhân'},
  });
}

main()
  .then(() => console.log('CareerTwin seed completed.'))
  .finally(() => prisma.$disconnect());
