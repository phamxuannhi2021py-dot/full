'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import { FigmaModal, InlineStatus } from './FigmaModal';
import { CareerDetailModal, type CareerView } from './CareerDetailModal';

type DashboardData = {
  user:{name:string;email:string;role:string;onboardingCompleted:boolean};
  readiness:number;
  recommendations:CareerView[];
  activities:{id:string;title:string;detail?:string;createdAt:string}[];
  savedCareers:CareerView[];
  simulations:{id:string;score:number;career:{title:string};createdAt:string}[];
  stats:{simulations:number;savedCareers:number;roadmapStages:number;latestReportAt?:string|null};
};

export default function FigmaDashboardClient() {
  const router = useRouter();
  const [data,setData]=useState<DashboardData|null>(null);
  const [question,setQuestion]=useState('');
  const [answer,setAnswer]=useState('');
  const [aiOpen,setAiOpen]=useState(false);
  const [accountOpen,setAccountOpen]=useState(false);
  const [selected,setSelected]=useState<CareerView|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/dashboard').then(async(response)=>response.ok?response.json():Promise.reject()).then(setData).catch(()=>setError('Không thể tải dữ liệu cá nhân hóa'));},[]);
  async function ask(questionOverride?:string) {
    const prompt=(questionOverride||question).trim(); if(!prompt)return;
    setLoading(true);setError('');setAiOpen(true);
    try{
      const response=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:prompt})});
      const payload=await response.json(); if(!response.ok)throw new Error(payload.error||'AI chưa thể trả lời');
      setAnswer(payload.answer);setQuestion('');
    }catch(caught){setError(caught instanceof Error?caught.message:'AI chưa thể trả lời');}
    finally{setLoading(false);}
  }
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});router.push('/login');router.refresh();}
  return <>
    <FigmaFrame frame={frames.dashboard} desktopNav>
      {data && <>
        <div className="figma-dynamic-text" style={{left:1278,top:31,width:100,height:32,fontSize:11,fontWeight:700,padding:'2px 0'}}>{data.user.name}<small style={{display:'block',fontSize:8,color:'#69728e'}}>CareerTwin User</small></div>
        <div className="figma-dynamic-text" style={{left:1353,top:145,width:45,height:28,fontSize:12,color:'#6338ed',fontWeight:800,padding:'5px'}}>{data.readiness}%</div>
        <div className="figma-dynamic-text" style={{left:329,top:306,width:74,height:30,fontSize:18,fontWeight:800,padding:'2px',textAlign:'center'}}>{data.recommendations.length}</div>
        <div className="figma-dynamic-text" style={{left:585,top:306,width:74,height:30,fontSize:18,fontWeight:800,padding:'2px',textAlign:'center'}}>{data.stats.simulations}</div>
        <div className="figma-dynamic-text" style={{left:840,top:306,width:74,height:30,fontSize:18,fontWeight:800,padding:'2px',textAlign:'center'}}>{data.stats.savedCareers}</div>
        {data.recommendations.slice(0,3).map((career,index)=><div key={`rec-${career.id}`} className="figma-dynamic-text" style={{left:282+index*248,top:787,width:180,height:45,fontSize:11,fontWeight:800,padding:'3px 5px',lineHeight:1.25,overflow:'hidden'}}>{career.title}<small style={{display:'block',fontSize:10,color:'#6338ed'}}>{career.match}% phù hợp</small></div>)}
        {(data.activities.length?data.activities:[{id:'empty',title:'Chưa có hoạt động',detail:'Hoàn thành onboarding để bắt đầu',createdAt:''}]).slice(0,4).map((activity,index)=><div key={activity.id} className="figma-dynamic-text" style={{left:1056,top:367+index*62,width:290,height:42,fontSize:11,fontWeight:700,padding:'2px 4px',lineHeight:1.3,overflow:'hidden'}}>{activity.title}<small style={{display:'block',fontSize:9,color:'#69728e',fontWeight:500}}>{activity.detail||'Dữ liệu được lưu từ hành động thật'}</small></div>)}
      </>}
      <button className="figma-action" style={{left:1225,top:20,width:180,height:55}} onClick={()=>setAccountOpen(true)} aria-label="Mở tài khoản"/>
      <input className="figma-input-overlay" style={{left:1084,top:693,width:250,height:27}} value={question} onChange={(event)=>setQuestion(event.target.value)} onKeyDown={(event)=>{if(event.key==='Enter')ask();}} placeholder="Nhập câu hỏi của bạn..." aria-label="Hỏi CareerTwin AI"/>
      <button className="figma-action" style={{left:1345,top:687,width:38,height:42}} onClick={()=>ask()} aria-label="Gửi câu hỏi"/>
      {['Mình hợp ngành nào?','Nên học ngành gì?','So sánh IT và Marketing','Cần chuẩn bị gì vào đại học?'].map((prompt,index)=><button key={prompt} className="figma-action" style={{left:index%2===0?1074:1203,top:index<2?760:795,width:index%2===0?120:180,height:28}} onClick={()=>ask(prompt)} aria-label={prompt}/>)}
      {(data?.recommendations||[]).slice(0,3).map((career,index)=><button key={career.id} className="figma-action" style={{left:266+index*248,top:616,width:233,height:238}} onClick={()=>setSelected(career)} aria-label={`Khám phá ${career.title}`}/>)}
      {error && !aiOpen && <div className="figma-overlay-error" style={{left:1040,top:870,width:350}}>{error}</div>}
    </FigmaFrame>
    <FigmaModal open={aiOpen} title="CareerTwin AI tư vấn" onClose={()=>setAiOpen(false)} wide>
      <InlineStatus error={error}/>
      {loading?<p>AI đang phân tích hồ sơ và gợi ý phù hợp cho bạn…</p>:<p style={{whiteSpace:'pre-wrap'}}>{answer||'Hãy nhập câu hỏi để bắt đầu.'}</p>}
      <div className="ct-actions"><a className="ct-secondary" href="/reports">Xem báo cáo</a><a className="ct-primary" href="/career-map">Mở Career Map</a></div>
    </FigmaModal>
    <FigmaModal open={accountOpen} title="Tài khoản" onClose={()=>setAccountOpen(false)}>
      <p><b>{data?.user.name}</b><br/>{data?.user.email}</p>
      <div className="ct-actions"><a className="ct-secondary" href="/profile">Hồ sơ</a><button type="button" className="ct-danger" onClick={logout}>Đăng xuất</button></div>
    </FigmaModal>
    <CareerDetailModal career={selected} onClose={()=>setSelected(null)} onSaved={(career)=>{setSelected(career);setData((current)=>current?{...current,recommendations:current.recommendations.map((item)=>item.id===career.id?career:item)}:current);}}/>
  </>;
}
