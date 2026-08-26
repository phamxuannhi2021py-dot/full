'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import { FigmaModal, InlineStatus } from './FigmaModal';
import type { CareerView } from './CareerDetailModal';

type RoadmapData={career:CareerView;stages:{stage:number;title:string;progress:number;completedAt?:string|null}[]};

export default function FigmaRoadmapClient({variant}:{variant:'map'|'roadmap'}) {
  const params=useSearchParams();
  const [careers,setCareers]=useState<CareerView[]>([]);
  const [data,setData]=useState<RoadmapData|null>(null);
  const [picker,setPicker]=useState(false);
  const [progressOpen,setProgressOpen]=useState(false);
  const [aiOpen,setAiOpen]=useState(false);
  const [ai,setAi]=useState('');
  const [status,setStatus]=useState<{error?:string;success?:string;loading?:boolean}>({});
  const load=useCallback(async(careerId?:string)=>{
    const response=await fetch(`/api/roadmap${careerId?`?careerId=${careerId}`:''}`);
    if(response.ok)setData(await response.json());
  },[]);
  useEffect(()=>{
    fetch('/api/careers').then((response)=>response.json()).then(async(list:CareerView[])=>{
      setCareers(list);const slug=params.get('career');const selected=slug?list.find((career)=>career.slug===slug):undefined;await load(selected?.id);
    }).catch(()=>setStatus({error:'Không thể tải Career Map'}));
  },[load,params]);
  async function choose(career:CareerView){await load(career.id);setPicker(false);}
  async function update(stage:number,progress:number){
    if(!data)return;setStatus({loading:true});
    try{const response=await fetch('/api/roadmap',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({careerId:data.career.id,stage,progress})});const payload=await response.json();if(!response.ok)throw new Error(payload.error||'Không thể lưu tiến độ');setData({...data,stages:data.stages.map((item)=>item.stage===stage?{...item,progress}:item)});setStatus({success:'Đã lưu tiến độ'});}
    catch(error){setStatus({error:error instanceof Error?error.message:'Không thể lưu tiến độ'});}
  }
  async function askAI(){
    if(!data)return;setAiOpen(true);setStatus({loading:true});
    try{const response=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:`Hãy tư vấn chi tiết lộ trình 6 tháng tiếp theo để tôi tiến gần nghề ${data.career.title}. Ưu tiên dựa trên kỹ năng và tiến độ hiện tại của tôi.`})});const payload=await response.json();if(!response.ok)throw new Error(payload.error);setAi(payload.answer);setStatus({});}
    catch(error){setStatus({error:error instanceof Error?error.message:'AI chưa thể trả lời'});}
  }
  const average=data?.stages.length?Math.round(data.stages.reduce((sum,item)=>sum+item.progress,0)/data.stages.length):0;
  const frame=variant==='map'?frames.careerMap:frames.roadmap;
  return <>
    <FigmaFrame frame={frame} desktopNav>
      {data&&variant==='map'&&<>
        <div className="figma-dynamic-text" style={{left:323,top:139,width:205,height:31,fontSize:18,fontWeight:800,padding:'1px 2px'}}>{data.career.title}</div>
        <div className="figma-dynamic-text" style={{left:527,top:130,width:90,height:26,fontSize:10,color:'#079d61',fontWeight:700,padding:'8px 3px'}}>{data.career.match??data.career.demand}% phù hợp</div>
        <div className="figma-dynamic-text" style={{left:1355,top:531,width:38,height:23,fontSize:11,fontWeight:700,padding:'5px'}}>{average}%</div>
        <button className="figma-action" style={{left:1244,top:123,width:146,height:36}} onClick={()=>setPicker(true)} aria-label="Thay đổi mục tiêu"/>
        <button className="figma-action" style={{left:1180,top:560,width:210,height:34}} onClick={()=>setProgressOpen(true)} aria-label="Xem chi tiết chặng"/>
        <button className="figma-action" style={{left:977,top:812,width:417,height:34}} onClick={askAI} aria-label="Nhận tư vấn chi tiết từ AI"/>
      </>}
      {data&&variant==='roadmap'&&<>
        <div className="figma-dynamic-text" style={{left:358,top:186,width:200,height:30,fontSize:14,fontWeight:800,padding:'2px'}}>{data.career.title}</div>
        <div className="figma-dynamic-text" style={{left:1172,top:461,width:53,height:35,fontSize:20,fontWeight:800,padding:'5px',textAlign:'center'}}>{average}%</div>
        <button className="figma-action" style={{left:565,top:931,width:220,height:32}} onClick={()=>setProgressOpen(true)} aria-label="Xem chi tiết từng giai đoạn"/>
        <button className="figma-action" style={{left:1190,top:936,width:190,height:30}} onClick={askAI} aria-label="Xem khóa học phù hợp"/>
        <button className="figma-action" style={{left:282,top:129,width:300,height:170}} onClick={()=>setPicker(true)} aria-label="Thay đổi nghề mục tiêu"/>
      </>}
      {status.error&&<div className="figma-overlay-error" style={{left:1000,top:78,width:370}}>{status.error}</div>}
    </FigmaFrame>
    <FigmaModal open={picker} title="Chọn nghề mục tiêu" onClose={()=>setPicker(false)} wide>
      <div className="ct-career-list">{careers.map((career)=><button type="button" key={career.id} className={`ct-career-option ${data?.career.id===career.id?'active':''}`} onClick={()=>choose(career)}><strong>{career.title} · {career.match}%</strong><small>{career.category} · nhu cầu {career.demand}%</small></button>)}</div>
    </FigmaModal>
    <FigmaModal open={progressOpen} title={`Tiến độ · ${data?.career.title||''}`} onClose={()=>setProgressOpen(false)} wide>
      <InlineStatus error={status.error} success={status.success}/>
      <div className="ct-report-list">{data?.stages.map((stage)=><div className="ct-question" key={stage.stage}><p>{stage.stage}. {stage.title} — {stage.progress}%</p><input type="range" min="0" max="100" step="10" value={stage.progress} onChange={(event)=>setData((current)=>current?{...current,stages:current.stages.map((item)=>item.stage===stage.stage?{...item,progress:Number(event.target.value)}:item)}:current)} onPointerUp={(event)=>update(stage.stage,Number((event.target as HTMLInputElement).value))}/><div className="ct-question-labels"><span>Chưa bắt đầu</span><span>Hoàn thành</span></div></div>)}</div>
    </FigmaModal>
    <FigmaModal open={aiOpen} title="CareerTwin AI · Gợi ý lộ trình" onClose={()=>setAiOpen(false)} wide>
      <InlineStatus error={status.error}/><p style={{whiteSpace:'pre-wrap'}}>{status.loading?'AI đang phân tích tiến độ của bạn…':ai}</p>
    </FigmaModal>
  </>;
}
