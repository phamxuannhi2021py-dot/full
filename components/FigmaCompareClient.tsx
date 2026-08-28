'use client';

import { useEffect, useMemo, useState } from 'react';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import type { CareerView } from './CareerDetailModal';
import { CareerDetailModal } from './CareerDetailModal';

const rowTops=[415,452,501,550,599,648,697];

export default function FigmaCompareClient(){
  const [careers,setCareers]=useState<CareerView[]>([]);
  const [ids,setIds]=useState<string[]>([]);
  const [selected,setSelected]=useState<CareerView|null>(null);
  useEffect(()=>{fetch('/api/careers').then((response)=>response.json()).then((list:CareerView[])=>{setCareers(list);setIds(list.slice(0,3).map((item)=>item.id));});},[]);
  const compared=useMemo(()=>ids.map((id)=>careers.find((career)=>career.id===id)).filter(Boolean) as CareerView[],[ids,careers]);
  function value(career:CareerView,row:number){
    if(row===0)return `${career.match??career.demand}%`;
    if(row===1)return `${career.salaryMin} - ${career.salaryMax} triệu/tháng`;
    if(row===2)return career.demand>=92?'Rất cao':career.demand>=82?'Cao':'Trung bình';
    if(row===3)return (career.competition??60)>=75?'Cao':(career.competition??60)>=55?'Trung bình':'Thấp';
    if(row===4)return '★'.repeat(Math.max(1,Math.round(career.creativity/20)));
    if(row===5)return (career.requiredSkills||career.tags).split(',').slice(0,4).join(', ');
    return career.workEnvironment||'Văn phòng / Hybrid';
  }
  return <>
    <FigmaFrame frame={frames.compare} desktopNav>
      {ids.map((id,index)=><select key={index} className="figma-select-overlay" style={{left:470+index*250,top:347,width:200,height:42,color:['#5631e7','#ef3a9b','#1976ef'][index]}} value={id} onChange={(event)=>setIds((current)=>current.map((value,i)=>i===index?event.target.value:value))} aria-label={`Nghề so sánh ${index+1}`}>{careers.filter((career)=>!ids.includes(career.id)||career.id===id).map((career)=><option value={career.id} key={career.id}>{career.title}</option>)}</select>)}
      {compared.map((career,index)=><div key={`compare-head-${career.id}`} className="figma-dynamic-text" style={{left:433+index*254,top:302,width:220,height:36,fontSize:12,fontWeight:800,padding:'4px 6px',lineHeight:1.2,textAlign:'center',overflow:'hidden'}}>
        {career.title}
        <small style={{display:'block',fontSize:9,color:['#5631e7','#ef3a9b','#1976ef'][index]}}>{career.match??career.demand}% phù hợp</small>
      </div>)}
      {compared.map((career,col)=>rowTops.map((top,row)=><button type="button" key={`${career.id}-${row}`} className="figma-dynamic-text" style={{left:433+col*254,top,width:252,height:row===5?49:47,border:0,borderBottom:'1px solid #e5e8f2',padding:'13px 36px',fontSize:row===5?10:11,textAlign:'left',cursor:'pointer',overflow:'hidden'}} onClick={()=>setSelected(career)}>{value(career,row)}</button>))}
    </FigmaFrame>
    <CareerDetailModal career={selected} onClose={()=>setSelected(null)}/>
  </>;
}
