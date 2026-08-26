import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root,'public','figma');
await fs.mkdir(out,{recursive:true});
const items = {
  'login.png':'https://www.figma.com/api/mcp/asset/bb47beb7-97af-4b11-8a31-2b61b74f21b4.png',
  'register.png':'https://www.figma.com/api/mcp/asset/282dde02-b743-4619-9d62-c9b19d525c99.png',
  'onboarding-basic.png':'https://www.figma.com/api/mcp/asset/88fb0a56-b81d-4fa3-b457-44f8d3a74c7e.png',
  'onboarding-interests.png':'https://www.figma.com/api/mcp/asset/df981920-7da3-4772-a754-7a0fd419c8a3.png',
  'onboarding-skills.png':'https://www.figma.com/api/mcp/asset/e748f133-6cd8-413f-b366-9e3acfcf0d98.png',
  'onboarding-goals.png':'https://www.figma.com/api/mcp/asset/761c4a16-046e-4cf1-832a-0628513296d6.png',
  'dashboard.png':'https://www.figma.com/api/mcp/asset/c767ff40-8111-4636-bf19-fd217ac8412b.png',
  'explore.png':'https://www.figma.com/api/mcp/asset/a1113a81-7195-4023-bb78-a12a53d6247b.png',
  'career-map.png':'https://www.figma.com/api/mcp/asset/eb9e24ac-839e-4f8d-8212-d3e2e4524aee.png',
  'simulation.png':'https://www.figma.com/api/mcp/asset/4288a82a-26c9-4c7d-ac54-efad96f66a23.png',
  'reports.png':'https://www.figma.com/api/mcp/asset/17776688-5bff-4012-81eb-571db42ad3a6.png',
  'compare.png':'https://www.figma.com/api/mcp/asset/32b49cce-dd97-4ec1-af87-a76367d246ee.png',
  'roadmap.png':'https://www.figma.com/api/mcp/asset/a49402b6-bcf4-4a7d-b840-37cea4037f3d.png',
  'knowledge.png':'https://www.figma.com/api/mcp/asset/69118455-c9f2-4e65-9398-fbefc72371c0.png',
  'profile.png':'https://www.figma.com/api/mcp/asset/52052573-86a7-4d6f-ae9d-199f72ac30a4.png',
  'settings.png':'https://www.figma.com/api/mcp/asset/3e8d6e97-1496-47df-86ba-981b1a5472fd.png'
};
let ok=0;
for(const [name,url] of Object.entries(items)){
  try{
    const target=path.join(out,name);
    try{ const st=await fs.stat(target); if(st.size>1000){ok++;continue;} }catch{}
    const res=await fetch(url,{redirect:'follow'});
    if(!res.ok) throw new Error(`${res.status}`);
    const buf=Buffer.from(await res.arrayBuffer());
    await fs.writeFile(target,buf); ok++;
    console.log(`✓ ${name}`);
  }catch(e){ console.warn(`⚠ ${name}: ${e.message}`); }
}
console.log(`CareerTwin Figma frames cached: ${ok}/${Object.keys(items).length}`);
// Never fail npm install just because Figma is temporarily unreachable.
