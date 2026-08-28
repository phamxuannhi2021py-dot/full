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

const broadCareers = [
  ['hr-recruiter','HR Recruiter','Nhân sự','Tuyển dụng, sàng lọc CV, phỏng vấn và phối hợp với hiring manager.',12,25,82,62,70,92,58,'business,people,communication,analysis,hr','Sourcing,Interviewing,Communication,ATS,Employer Branding','Văn phòng / Hybrid','Nền tảng nhân sự|Sourcing ứng viên|Phỏng vấn cấu trúc|Đánh giá năng lực|Employer branding|Talent partner'],
  ['teacher','Giáo viên','Giáo dục','Thiết kế bài học, hỗ trợ học sinh và đánh giá tiến bộ học tập.',10,24,78,84,68,96,42,'education,people,communication,empathy','Lesson Planning,Classroom Management,Assessment,Communication','Trường học / Trung tâm','Tâm lý học giáo dục|Thiết kế bài giảng|Quản lý lớp học|Đánh giá học sinh|Công nghệ giáo dục|Lead teacher'],
  ['financial-analyst','Financial Analyst','Tài chính','Phân tích dữ liệu tài chính, dự báo và hỗ trợ quyết định đầu tư/kinh doanh.',18,40,86,45,94,72,63,'finance,business,analysis,logic,data','Excel,Financial Modeling,Accounting,Power BI,Communication','Văn phòng / Hybrid','Kế toán nền tảng|Excel tài chính|Mô hình tài chính|Phân tích ngành|Dashboard|FP&A'],
  ['accountant','Kế toán viên','Kế toán','Ghi nhận, kiểm tra và báo cáo dữ liệu tài chính theo chuẩn kế toán.',12,28,80,35,88,66,50,'finance,accounting,logic,attention','Accounting,Excel,Tax,ERP,Attention to Detail','Văn phòng','Nguyên lý kế toán|Thuế|Excel/ERP|Báo cáo tài chính|Kiểm soát nội bộ|Chief accountant'],
  ['sales-executive','Sales Executive','Kinh doanh','Tìm kiếm khách hàng, tư vấn giải pháp, đàm phán và chốt hợp đồng.',12,35,88,74,62,98,70,'business,sales,communication,people','Prospecting,Negotiation,CRM,Presentation,Customer Insight','Văn phòng / Di chuyển','Sales basics|CRM|Discovery call|Negotiation|Account planning|Sales manager'],
  ['ecommerce-specialist','E-commerce Specialist','Thương mại điện tử','Quản lý gian hàng, chiến dịch bán hàng, dữ liệu vận hành và tăng trưởng online.',14,32,90,76,78,82,66,'business,marketing,data,ecommerce','Marketplace,Ads,Analytics,Merchandising,Operations','Văn phòng / Hybrid','Marketplace basics|Listing optimization|Ads|Data analysis|Promotion planning|E-commerce lead'],
  ['psychologist','Chuyên viên Tâm lý','Tâm lý','Đánh giá, tham vấn và hỗ trợ sức khỏe tinh thần trong phạm vi chuyên môn.',14,35,76,72,76,96,44,'science,people,communication,empathy','Counseling,Assessment,Ethics,Communication,Research','Phòng tư vấn / Trung tâm','Tâm lý học nền tảng|Kỹ năng tham vấn|Đánh giá|Đạo đức nghề|Thực hành giám sát|Chuyên gia'],
  ['pharmacist','Dược sĩ','Y tế','Tư vấn sử dụng thuốc, quản lý dược phẩm và đảm bảo an toàn cho người bệnh.',14,32,79,38,88,76,48,'healthcare,science,communication,attention','Pharmacology,Patient Counseling,Regulation,Inventory','Nhà thuốc / Bệnh viện','Dược lý|Tư vấn thuốc|Quy định ngành|Quản lý kho|Dược lâm sàng|Quản lý dược'],
  ['lawyer','Luật sư','Luật','Nghiên cứu pháp lý, tư vấn, soạn thảo hồ sơ và bảo vệ quyền lợi khách hàng.',18,55,77,58,95,96,80,'law,business,logic,communication','Legal Research,Writing,Negotiation,Ethics,Argumentation','Văn phòng / Tòa án','Pháp luật nền tảng|Nghiên cứu án lệ|Soạn thảo|Tranh tụng/tư vấn|Chuyên môn hóa|Partner'],
  ['civil-engineer','Kỹ sư Xây dựng','Kỹ thuật','Thiết kế, giám sát và quản lý chất lượng công trình xây dựng.',15,38,84,50,92,74,54,'engineering,construction,logic,project','Structural Basics,AutoCAD,Project Management,Site Supervision','Công trường / Văn phòng','Cơ học công trình|AutoCAD/BIM|Đọc bản vẽ|Giám sát|Quản lý dự án|Chủ nhiệm kỹ thuật'],
  ['mechanical-engineer','Kỹ sư Cơ khí','Kỹ thuật','Thiết kế, cải tiến và vận hành hệ thống cơ khí trong sản xuất.',15,36,82,58,91,65,50,'engineering,manufacturing,logic,problem-solving','CAD,Mechanics,Manufacturing,Maintenance,Quality','Nhà máy / Văn phòng','Cơ học|CAD|Gia công|Bảo trì|Lean manufacturing|Technical lead'],
  ['electrical-engineer','Kỹ sư Điện','Kỹ thuật','Thiết kế, vận hành và bảo trì hệ thống điện, tự động hóa.',16,40,86,48,94,66,52,'engineering,electrical,logic,automation','Electrical Systems,PLC,AutoCAD,Safety,Testing','Nhà máy / Công trình','Mạch điện|PLC|An toàn điện|Tự động hóa|Bảo trì|Engineering manager'],
  ['architect','Kiến trúc sư','Kiến trúc','Thiết kế không gian, phối hợp kỹ thuật và trình bày phương án kiến trúc.',16,42,78,96,78,88,72,'design,architecture,creative,engineering','Concept Design,AutoCAD,Revit,Presentation,Building Code','Studio / Công trình','Hình khối|AutoCAD/Revit|Quy chuẩn|Concept|Hồ sơ kỹ thuật|Design lead'],
  ['graphic-designer','Graphic Designer','Sáng tạo','Thiết kế nhận diện, ấn phẩm truyền thông và tài sản hình ảnh thương hiệu.',10,28,81,96,58,78,78,'design,creative,marketing,content','Typography,Branding,Adobe,Figma,Composition','Studio / Remote','Design principles|Adobe/Figma|Branding|Campaign assets|Portfolio|Art direction'],
  ['communications-specialist','Communication Specialist','Truyền thông','Lập kế hoạch truyền thông, viết thông điệp và quản lý kênh truyền thông.',14,32,83,86,68,95,62,'communication,media,content,business','Writing,PR,Campaign Planning,Stakeholder Management','Văn phòng / Hybrid','Writing|PR basics|Campaign|Media relations|Crisis communication|Comms manager'],
  ['logistics-coordinator','Logistics Coordinator','Logistics','Điều phối vận chuyển, kho bãi, chứng từ và tối ưu chuỗi cung ứng.',12,30,87,40,86,78,45,'logistics,business,operations,analysis','Supply Chain,Excel,Documentation,Vendor Coordination','Kho / Văn phòng','Supply chain basics|Chứng từ|Excel|Vendor coordination|Optimization|Logistics manager'],
  ['tourism-operator','Tourism Operator','Du lịch','Thiết kế tour, điều phối dịch vụ và chăm sóc trải nghiệm khách hàng.',10,26,74,82,62,94,56,'tourism,hospitality,communication,people','Itinerary Planning,Customer Service,Operations,Language','Văn phòng / Di chuyển','Tourism basics|Itinerary|Vendor coordination|Customer care|Operations|Tour manager'],
  ['hotel-manager','Hotel Manager','Hospitality','Quản lý vận hành khách sạn, dịch vụ khách hàng, nhân sự và doanh thu.',16,45,78,72,76,96,64,'hospitality,business,people,operations','Service Operations,Revenue,Leadership,Customer Experience','Khách sạn','Front office|Service quality|Revenue basics|Team management|Operations|General manager'],
  ['agricultural-engineer','Kỹ sư Nông nghiệp','Nông nghiệp','Ứng dụng kỹ thuật và dữ liệu để cải thiện sản xuất nông nghiệp.',12,30,76,58,86,62,38,'agriculture,science,engineering,environment','Crop Science,IoT,Data,Field Work,Sustainability','Trang trại / Hiện trường','Agronomy|Field practice|IoT/data|Sustainability|Project|Agritech lead'],
  ['public-policy-analyst','Chuyên viên Chính sách công','Dịch vụ công','Nghiên cứu dữ liệu xã hội, phân tích chính sách và đề xuất giải pháp công.',14,34,70,60,90,88,42,'public,analysis,communication,science','Policy Analysis,Research,Writing,Statistics,Stakeholder','Cơ quan / NGO','Public policy|Research methods|Statistics|Policy writing|Stakeholder consultation|Policy lead'],
] as const;

async function main() {
  for (const career of careers) {
    await prisma.career.upsert({ where:{slug:career.slug}, update:career, create:career });
  }
  for (const [slug,title,category,description,salaryMin,salaryMax,demand,creativity,logic,communication,competition,tags,requiredSkills,workEnvironment,roadmap] of broadCareers) {
    await prisma.career.upsert({
      where:{slug},
      update:{title,category,description,salaryMin,salaryMax,demand,creativity,logic,communication,competition,tags,requiredSkills,workEnvironment,roadmap},
      create:{slug,title,category,description,salaryMin,salaryMax,demand,creativity,logic,communication,competition,tags,requiredSkills,workEnvironment,roadmap},
    });
  }
  for (const article of articles) {
    await prisma.article.upsert({ where:{slug:article.slug}, update:article, create:article });
  }

  const allCareers = await prisma.career.findMany({ where: { active: true } });
  const now = new Date();
  const skillRows = new Map<string, { id: string; key: string; name: string; source: string; createdAt: Date; updatedAt: Date }>();
  const careerSkillInputs: { careerId: string; skillKey: string; importance: number; source: string }[] = [];
  const taskRows: { id: string; careerId: string; title: string; detail: string; order: number; source: string }[] = [];
  const interestRows: { careerId: string; key: string; weight: number; source: string }[] = [];
  const marketRows: { careerId: string; localTitle: string; salaryMin: number; salaryMax: number; demand: number; industriesHiring: string[]; educationRoutes: string[]; certifications: string[]; source: string; updatedAt: Date }[] = [];
  const pathRows: { careerId: string; level: string; order: number; title: string; skills: string[]; tasks: string[]; projects: string[]; createdAt: Date; updatedAt: Date }[] = [];

  for (const career of allCareers) {
    const skills = career.requiredSkills.split(',').map((item) => item.trim()).filter(Boolean);
    for (const [index, name] of skills.entries()) {
      const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const id = `skill-${key}`.slice(0, 120);
      skillRows.set(key, { id, key, name, source: 'careertwin-seed', createdAt: now, updatedAt: now });
      careerSkillInputs.push({ careerId: career.id, skillKey: key, importance: Math.max(55, 90 - index * 7), source: 'careertwin-seed' });
    }
    for (const [index, title] of career.roadmap.split('|').entries()) {
      taskRows.push({ id: `${career.slug}-task-${index + 1}`, careerId: career.id, title, detail: `Thực hành ${title} trong bối cảnh nghề ${career.title}`, order: index + 1, source: 'careertwin-seed' });
    }
    for (const key of career.tags.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 5)) {
      interestRows.push({ careerId: career.id, key, weight: 75, source: 'careertwin-seed' });
    }
    marketRows.push({
      careerId: career.id,
      localTitle: career.title,
      salaryMin: career.salaryMin,
      salaryMax: career.salaryMax,
      demand: career.demand,
      industriesHiring: [career.category],
      educationRoutes: ['Tự học có dự án', 'Đại học/Cao đẳng liên quan', 'Chứng chỉ nghề phù hợp'],
      certifications: skills.slice(0, 3),
      source: 'careertwin-vn-estimate',
      updatedAt: now,
    });
    pathRows.push({
      careerId: career.id,
      level: 'beginner',
      order: 1,
      title: `Bắt đầu với ${career.title}`,
      skills,
      tasks: career.roadmap.split('|').slice(0, 3),
      projects: [`Mini project mô phỏng ${career.title}`],
      createdAt: now,
      updatedAt: now,
    });
  }

  await prisma.skill.createMany({ data: [...skillRows.values()], skipDuplicates: true });
  const storedSkills = await prisma.skill.findMany({ where: { key: { in: [...skillRows.keys()] } }, select: { id: true, key: true } });
  const skillIds = new Map(storedSkills.map((skill) => [skill.key, skill.id]));
  const careerSkillRows = careerSkillInputs
    .map((input) => {
      const skillId = skillIds.get(input.skillKey);
      return skillId ? { careerId: input.careerId, skillId, importance: input.importance, source: input.source } : null;
    })
    .filter((item): item is { careerId: string; skillId: string; importance: number; source: string } => Boolean(item));
  await prisma.careerSkill.createMany({ data: careerSkillRows, skipDuplicates: true });
  await prisma.careerTask.createMany({ data: taskRows, skipDuplicates: true });
  await prisma.careerInterest.createMany({ data: interestRows, skipDuplicates: true });
  await prisma.careerMarketData.createMany({ data: marketRows, skipDuplicates: true });
  await prisma.careerLearningPath.createMany({ data: pathRows, skipDuplicates: true });

  if (process.env.CAREERTWIN_SEED_DEMO === 'true') {
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
}

main()
  .then(() => console.log('CareerTwin seed completed.'))
  .finally(() => prisma.$disconnect());
