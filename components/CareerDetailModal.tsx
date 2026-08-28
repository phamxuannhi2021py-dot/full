'use client';

import { useState } from 'react';
import { FigmaModal, InlineStatus } from './FigmaModal';

export type CareerView = {
  id:string; slug:string; title:string; category:string; description:string;
  salaryMin:number; salaryMax:number; demand:number; creativity:number; logic:number;
  communication:number; competition?:number; tags:string; requiredSkills?:string;
  workEnvironment?:string; roadmap:string; match?:number; saved?:boolean;
  breakdown?:{interest:number;skill:number;goal:number;aptitude:number};
  tasks?:{id:string;title:string;detail?:string|null}[];
  tools?:{id:string;name:string;category?:string|null}[];
  skillGap?:{key:string;name:string;current:number;target:number;status:string;priority:number}[];
  learningSequence?:{order:number;skill:string;reason:string;project:string}[];
};

export function CareerDetailModal({ career, onClose, onSaved }: {
  career: CareerView | null;
  onClose: () => void;
  onSaved?: (career: CareerView) => void;
}) {
  const [status, setStatus] = useState<{error?:string;success?:string;loading?:boolean}>({});
  if (!career) return null;
  const activeCareer: CareerView = career;
  async function toggleSaved() {
    setStatus({loading:true});
    const method = activeCareer.saved ? 'DELETE' : 'POST';
    try {
      const response = await fetch(`/api/careers/${activeCareer.slug}/save`, { method });
      const payload = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(payload.error || 'Không thể lưu nghề');
      const next: CareerView = {...activeCareer,saved:Boolean(payload.saved)};
      setStatus({success:payload.saved?'Đã lưu nghề vào hồ sơ':'Đã bỏ lưu nghề'});
      onSaved?.(next);
    } catch (error) { setStatus({error:error instanceof Error?error.message:'Có lỗi xảy ra'}); }
  }
  return <FigmaModal open title={activeCareer.title} onClose={onClose} wide>
    <InlineStatus error={status.error} success={status.success} />
    <p>{activeCareer.description}</p>
    <div className="ct-metric-grid">
      <div className="ct-metric"><small>Mức phù hợp</small><strong>{activeCareer.match ?? activeCareer.demand}%</strong></div>
      <div className="ct-metric"><small>Thu nhập</small><strong>{activeCareer.salaryMin}-{activeCareer.salaryMax}tr</strong></div>
      <div className="ct-metric"><small>Nhu cầu</small><strong>{activeCareer.demand}%</strong></div>
      <div className="ct-metric"><small>Môi trường</small><strong style={{fontSize:13}}>{activeCareer.workEnvironment||'Hybrid'}</strong></div>
    </div>
    <h3>Kỹ năng cần thiết</h3>
    <p>{(activeCareer.requiredSkills||activeCareer.tags).split(',').join(' · ')}</p>
    {Boolean(activeCareer.skillGap?.length)&&<>
      <h3>Skill gap cá nhân hóa</h3>
      <div className="ct-report-list">{activeCareer.skillGap?.slice(0,5).map((gap)=><div className="ct-report-row" key={gap.key}><span>{gap.name} · {gap.status}</span><b>{gap.current}/{gap.target}</b></div>)}</div>
    </>}
    {Boolean(activeCareer.tasks?.length)&&<>
      <h3>Nhiệm vụ thực tế</h3>
      <div className="ct-report-list">{activeCareer.tasks?.slice(0,5).map((task,index)=><div className="ct-report-row" key={task.id}><span>{index+1}. {task.title}</span><b>Task</b></div>)}</div>
    </>}
    {Boolean(activeCareer.learningSequence?.length)&&<>
      <h3>Nên học tiếp</h3>
      <div className="ct-report-list">{activeCareer.learningSequence?.slice(0,4).map((item)=><div className="ct-report-row" key={item.order}><span>{item.order}. {item.skill}</span><b>Priority</b></div>)}</div>
    </>}
    <h3>Lộ trình gợi ý</h3>
    <div className="ct-report-list">{activeCareer.roadmap.split('|').map((stage,index)=><div className="ct-report-row" key={stage}><span>{index+1}. {stage}</span><b>{index===0?'Bắt đầu':'Tiếp theo'}</b></div>)}</div>
    <div className="ct-actions">
      <button type="button" className="ct-secondary" onClick={toggleSaved} disabled={status.loading}>{activeCareer.saved?'Bỏ lưu nghề':'♡ Lưu nghề'}</button>
      <a className="ct-primary" href={`/career-map?career=${activeCareer.slug}`}>Xem Career Map</a>
      <a className="ct-primary" href={`/simulation?career=${activeCareer.slug}`}>Mô phỏng nghề</a>
    </div>
  </FigmaModal>;
}
