export type FrameSpec = {
  key: string;
  local: string;
  remote: string;
  width: number;
  height: number;
};

export const frames: Record<string, FrameSpec> = {
  login: { key:'login', local:'/figma/login.png', remote:'https://www.figma.com/api/mcp/asset/bb47beb7-97af-4b11-8a31-2b61b74f21b4.png', width:1440, height:1013 },
  register: { key:'register', local:'/figma/register.png', remote:'https://www.figma.com/api/mcp/asset/282dde02-b743-4619-9d62-c9b19d525c99.png', width:1669, height:1237 },
  onboardingBasic: { key:'onboarding-basic', local:'/figma/onboarding-basic.png', remote:'https://www.figma.com/api/mcp/asset/88fb0a56-b81d-4fa3-b457-44f8d3a74c7e.png', width:1440, height:1024 },
  onboardingInterests: { key:'onboarding-interests', local:'/figma/onboarding-interests.png', remote:'https://www.figma.com/api/mcp/asset/df981920-7da3-4772-a754-7a0fd419c8a3.png', width:1440, height:1024 },
  onboardingSkills: { key:'onboarding-skills', local:'/figma/onboarding-skills.png', remote:'https://www.figma.com/api/mcp/asset/e748f133-6cd8-413f-b366-9e3acfcf0d98.png', width:1440, height:1024 },
  onboardingGoals: { key:'onboarding-goals', local:'/figma/onboarding-goals.png', remote:'https://www.figma.com/api/mcp/asset/761c4a16-046e-4cf1-832a-0628513296d6.png', width:1440, height:1024 },
  dashboard: { key:'dashboard', local:'/figma/dashboard.png', remote:'https://www.figma.com/api/mcp/asset/c767ff40-8111-4636-bf19-fd217ac8412b.png', width:1440, height:1024 },
  explore: { key:'explore', local:'/figma/explore.png', remote:'https://www.figma.com/api/mcp/asset/a1113a81-7195-4023-bb78-a12a53d6247b.png', width:1440, height:1024 },
  careerMap: { key:'career-map', local:'/figma/career-map.png', remote:'https://www.figma.com/api/mcp/asset/eb9e24ac-839e-4f8d-8212-d3e2e4524aee.png', width:1440, height:1024 },
  simulation: { key:'simulation', local:'/figma/simulation.png', remote:'https://www.figma.com/api/mcp/asset/4288a82a-26c9-4c7d-ac54-efad96f66a23.png', width:1440, height:1024 },
  reports: { key:'reports', local:'/figma/reports.png', remote:'https://www.figma.com/api/mcp/asset/17776688-5bff-4012-81eb-571db42ad3a6.png', width:1440, height:1024 },
  compare: { key:'compare', local:'/figma/compare.png', remote:'https://www.figma.com/api/mcp/asset/32b49cce-dd97-4ec1-af87-a76367d246ee.png', width:1440, height:1024 },
  roadmap: { key:'roadmap', local:'/figma/roadmap.png', remote:'https://www.figma.com/api/mcp/asset/a49402b6-bcf4-4a7d-b840-37cea4037f3d.png', width:1440, height:1024 },
  knowledge: { key:'knowledge', local:'/figma/knowledge.png', remote:'https://www.figma.com/api/mcp/asset/69118455-c9f2-4e65-9398-fbefc72371c0.png', width:1440, height:1024 },
  profile: { key:'profile', local:'/figma/profile.png', remote:'https://www.figma.com/api/mcp/asset/52052573-86a7-4d6f-ae9d-199f72ac30a4.png', width:1440, height:1024 },
  settings: { key:'settings', local:'/figma/settings.png', remote:'https://www.figma.com/api/mcp/asset/3e8d6e97-1496-47df-86ba-981b1a5472fd.png', width:1440, height:1024 },
};
