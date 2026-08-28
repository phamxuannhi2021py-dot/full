'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import { FigmaModal, InlineStatus } from './FigmaModal';
import type { CareerView } from './CareerDetailModal';

type Question={id:string;text:string;low:string;high:string};
type History={id:string;score:number;minutes:number;career:{title:string};createdAt:string;feedback?:string};
type SimulationPayload={title:string;scenario:string;questions:Question[];history:History[]};

export default function FigmaSimulationPageClient(){
  const params=useSearchParams();
  const [careers,setCareers]=useState<CareerView[]>([]);
  const [questions,setQuestions]=useState<Question[]>([]);
  const [scenario,setScenario]=useState('');
  const [history,setHistory]=useState<History[]>([]);
  const [selected,setSelected]=useState<CareerView|null>(null);
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [picker,setPicker]=useState(false);
  const [running,setRunning]=useState(false);
  const [result,setResult]=useState<History|null>(null);
  const [status,setStatus]=useState<{error?:string;loading?:boolean}>({});
  async function loadSimulation(slug?:string){
    const response=await fetch(`/api/simulation${slug?`?career=${encodeURIComponent(slug)}`:''}`);
    if(!response.ok)throw new Error('Không thể tải dữ liệu mô phỏng');
    const simulation:SimulationPayload=await response.json();
    setQuestions(simulation.questions||[]);
    setScenario(simulation.scenario||'');
    setHistory(simulation.history||[]);
    setAnswers(Object.fromEntries((simulation.questions||[]).map((q:Question)=>[q.id,70])));
  }
  useEffect(()=>{Promise.all([fetch('/api/careers').then((r)=>r.json()),loadSimulation(params.get('career')||undefined)]).then(([careerList])=>{setCareers(careerList);const slug=params.get('career');if(slug){const found=careerList.find((career:CareerView)=>career.slug===slug);if(found){setSelected(found);setRunning(true);}}}).catch(()=>setStatus({error:'Không thể tải dữ liệu mô phỏng'}));},[params]);
  async function start(career:CareerView){
    setStatus({loading:true});
    try{await loadSimulation(career.slug);setSelected(career);setPicker(false);setRunning(true);setResult(null);setStatus({});}
    catch(error){setStatus({error:error instanceof Error?error.message:'Không thể tải mô phỏng'});}
  }
  async function submit(){if(!selected)return;setStatus({loading:true});
    try{const response=await fetch('/api/simulation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({careerId:selected.id,minutes:45,answers:questions.map((question)=>({questionId:question.id,value:answers[question.id]||0}))})});const payload=await response.json();if(!response.ok)throw new Error(payload.error||'Không thể lưu kết quả');setResult(payload);setHistory((current)=>[payload,...current]);setRunning(false);setStatus({});}
    catch(error){setStatus({error:error instanceof Error?error.message:'Không thể lưu kết quả'});}
  }
  const totalMinutes=history.reduce((sum,item)=>sum+item.minutes,0);
  return <>
    <FigmaFrame frame={frames.simulation} desktopNav>
      <div className="figma-dynamic-text" style={{left:1068,top:195,width:48,height:29,fontSize:16,fontWeight:800,padding:'5px'}}>{String(history.length).padStart(2,'0')}</div>
      <div className="figma-dynamic-text" style={{left:1244,top:195,width:82,height:29,fontSize:14,fontWeight:800,padding:'6px'}}>{Math.floor(totalMinutes/60)}h {totalMinutes%60}m</div>
      <button className="figma-action" style={{left:309,top:226,width:172,height:39}} onClick={()=>setPicker(true)} aria-label="Chọn nghề để mô phỏng"/>
      {(careers.length?careers.slice(0,5):[]).map((career,index)=><button key={career.id} className="figma-action" style={{left:250+index*228,top:365,width:214,height:270}} onClick={()=>start(career)} aria-label={`Mô phỏng ${career.title}`}/>)}
      <button className="figma-action" style={{left:1315,top:328,width:80,height:30}} onClick={()=>setPicker(true)} aria-label="Xem tất cả nghề"/>
      {status.error&&<div className="figma-overlay-error" style={{left:1050,top:278,width:320}}>{status.error}</div>}
    </FigmaFrame>
    <FigmaModal open={picker} title="Chọn nghề để mô phỏng" onClose={()=>setPicker(false)} wide>
      <div className="ct-career-list">{careers.map((career)=><button type="button" className="ct-career-option" key={career.id} onClick={()=>start(career)}><strong>{career.title}</strong><small>{career.description}</small><small>Khoảng 45 phút · phù hợp {career.match}%</small></button>)}</div>
    </FigmaModal>
    <FigmaModal open={running} title={`Mô phỏng · ${selected?.title||''}`} onClose={()=>setRunning(false)} wide>
      <p>{scenario||'Đánh giá cách bạn xử lý các tình huống công việc. Điểm được tính trên câu trả lời, không sinh ngẫu nhiên.'}</p>
      {questions.map((question)=><div className="ct-question" key={question.id}><p>{question.text}</p><input type="range" min="0" max="100" step="10" value={answers[question.id]||0} onChange={(event)=>setAnswers({...answers,[question.id]:Number(event.target.value)})}/><div className="ct-question-labels"><span>{question.low}</span><span>{question.high}</span></div></div>)}
      <InlineStatus error={status.error}/><div className="ct-actions"><button className="ct-secondary" type="button" onClick={()=>setRunning(false)}>Để sau</button><button className="ct-primary" type="button" onClick={submit} disabled={status.loading}>{status.loading?'Đang chấm điểm…':'Hoàn thành mô phỏng'}</button></div>
    </FigmaModal>
    <FigmaModal open={Boolean(result)} title="Kết quả mô phỏng" onClose={()=>setResult(null)}>
      {result&&<><div className="ct-metric-grid"><div className="ct-metric"><small>Điểm</small><strong>{result.score}/100</strong></div><div className="ct-metric"><small>Thời gian</small><strong>{result.minutes}p</strong></div></div><p>{result.feedback}</p><div className="ct-actions"><a className="ct-secondary" href="/reports">Xem báo cáo</a><a className="ct-primary" href={`/career-map?career=${selected?.slug||''}`}>Xem Career Map</a></div></>}
    </FigmaModal>
  </>;
}
