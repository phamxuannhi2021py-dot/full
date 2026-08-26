'use client';

import { useEffect, useState } from 'react';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import { FigmaModal, InlineStatus } from './FigmaModal';
import { CareerDetailModal, type CareerView } from './CareerDetailModal';

type Report={
  user:{name:string;email:string};readiness:number;exploredCareers:number;completedSimulations:number;evaluatedSkills:number;
  averageSkill:number;averageSimulation:number;strengths:{key:string;score:number}[];improvements:{key:string;score:number}[];recommendations:CareerView[];
};

export default function FigmaReportsClient(){
  const [report,setReport]=useState<Report|null>(null);
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState<CareerView|null>(null);
  const [aiOpen,setAiOpen]=useState(false);
  const [ai,setAi]=useState('');
  const [status,setStatus]=useState<{error?:string;success?:string;loading?:boolean}>({});
  useEffect(()=>{fetch('/api/reports').then(async(response)=>{const payload=await response.json();if(!response.ok)throw new Error(payload.error);setReport(payload);}).catch((error)=>setStatus({error:error.message||'Không thể tạo báo cáo'}));},[]);
  async function snapshot(){setStatus({loading:true});try{const response=await fetch('/api/reports',{method:'POST'});if(!response.ok)throw new Error('Không thể lưu báo cáo');setStatus({success:'Đã lưu một bản báo cáo vào lịch sử'});}catch(error){setStatus({error:error instanceof Error?error.message:'Có lỗi xảy ra'});}}
  async function askAI(){setAiOpen(true);setStatus({loading:true});try{const response=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Dựa trên toàn bộ hồ sơ và kết quả mô phỏng của tôi, hãy phân tích 3 điểm mạnh, 3 điểm cần cải thiện và kế hoạch hành động trong 30 ngày.'})});const payload=await response.json();if(!response.ok)throw new Error(payload.error);setAi(payload.answer);setStatus({});}catch(error){setStatus({error:error instanceof Error?error.message:'AI chưa thể trả lời'});}}
  function printReport(){setOpen(true);setTimeout(()=>window.print(),150);}
  return <>
    <FigmaFrame frame={frames.reports} desktopNav>
      {report&&<>
        <div className="figma-dynamic-text" style={{left:1134,top:179,width:95,height:52,fontSize:32,color:'#5130dc',fontWeight:800,padding:'3px'}}>{report.readiness}<span style={{fontSize:16,color:'#566080'}}> /100</span></div>
        {[[report.exploredCareers,322],[report.completedSimulations,616],[report.evaluatedSkills,890],[`${report.readiness}%`,1200]].map(([value,left])=><div key={String(left)} className="figma-dynamic-text" style={{left:Number(left),top:369,width:80,height:34,fontSize:16,fontWeight:800,padding:'4px'}}>{value}</div>)}
        {(report.recommendations||[]).slice(0,5).map((career,index)=><button key={career.id} className="figma-action" style={{left:1070,top:488+index*48,width:310,height:45}} onClick={()=>setSelected(career)} aria-label={career.title}/>)}
      </>}
      <button className="figma-action" style={{left:1144,top:914,width:220,height:34}} onClick={()=>setOpen(true)} aria-label="Xem lộ trình đề xuất"/>
      <button className="figma-action" style={{left:1144,top:951,width:220,height:29}} onClick={printReport} aria-label="Tải báo cáo PDF"/>
      <button className="figma-action" style={{left:268,top:785,width:850,height:195}} onClick={askAI} aria-label="CareerTwin AI nhận định"/>
      {status.error&&<div className="figma-overlay-error" style={{left:1060,top:282,width:320}}>{status.error}</div>}
    </FigmaFrame>
    <FigmaModal open={open} title="Báo cáo nghề nghiệp cá nhân" onClose={()=>setOpen(false)} wide>
      <div className="ct-print-report">
        <InlineStatus error={status.error} success={status.success}/>
        {report&&<><h2>{report.user.name}</h2><p>{report.user.email}</p><div className="ct-metric-grid"><div className="ct-metric"><small>Sẵn sàng nghề nghiệp</small><strong>{report.readiness}%</strong></div><div className="ct-metric"><small>Mô phỏng</small><strong>{report.completedSimulations}</strong></div><div className="ct-metric"><small>Kỹ năng</small><strong>{report.evaluatedSkills}</strong></div><div className="ct-metric"><small>Điểm mô phỏng TB</small><strong>{report.averageSimulation||'—'}</strong></div></div><h3>Điểm mạnh</h3><div className="ct-report-list">{report.strengths.map((skill)=><div className="ct-report-row" key={skill.key}><span>{skill.key}</span><b>{skill.score}%</b></div>)}</div><h3>Top nghề phù hợp</h3><div className="ct-report-list">{report.recommendations.slice(0,5).map((career)=><div className="ct-report-row" key={career.id}><span>{career.title}</span><b>{career.match}%</b></div>)}</div></>}
      </div>
      <div className="ct-actions"><button className="ct-secondary" type="button" onClick={snapshot} disabled={status.loading}>Lưu lịch sử</button><button className="ct-primary" type="button" onClick={()=>window.print()}>In / Lưu PDF</button></div>
    </FigmaModal>
    <FigmaModal open={aiOpen} title="CareerTwin AI nhận định" onClose={()=>setAiOpen(false)} wide><InlineStatus error={status.error}/><p style={{whiteSpace:'pre-wrap'}}>{status.loading?'AI đang tổng hợp báo cáo…':ai}</p></FigmaModal>
    <CareerDetailModal career={selected} onClose={()=>setSelected(null)}/>
  </>;
}
