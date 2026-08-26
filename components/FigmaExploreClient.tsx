'use client';

import { useEffect, useState } from 'react';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import { FigmaModal } from './FigmaModal';
import { CareerDetailModal, type CareerView } from './CareerDetailModal';

const categories = [
  {key:'all',label:'Tất cả',left:250,width:86},
  {key:'Công nghệ thông tin',label:'Công nghệ thông tin',left:347,width:164},
  {key:'Kinh doanh',label:'Kinh doanh',left:521,width:120},
  {key:'Sáng tạo',label:'Sáng tạo',left:651,width:110},
  {key:'Kỹ thuật',label:'Kỹ thuật',left:772,width:104},
  {key:'Xã hội',label:'Xã hội',left:886,width:94},
];

export default function FigmaExploreClient() {
  const [careers,setCareers]=useState<CareerView[]>([]);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const [resultsOpen,setResultsOpen]=useState(false);
  const [selected,setSelected]=useState<CareerView|null>(null);
  const [loading,setLoading]=useState(false);
  async function load(nextCategory=category,nextQuery=query) {
    setLoading(true);
    const params=new URLSearchParams(); if(nextCategory!=='all')params.set('category',nextCategory);if(nextQuery.trim())params.set('q',nextQuery.trim());
    try{const response=await fetch(`/api/careers?${params}`);if(response.ok)setCareers(await response.json());}finally{setLoading(false);}
  }
  useEffect(()=>{load('all','');},[]);
  function chooseCategory(value:string){setCategory(value);setQuery('');load(value,'');}
  function search(){load(category,query);setResultsOpen(true);}
  return <>
    <FigmaFrame frame={frames.explore} desktopNav>
      <input className="figma-input-overlay" style={{left:902,top:34,width:225,height:24}} value={query} onChange={(event)=>setQuery(event.target.value)} onKeyDown={(event)=>{if(event.key==='Enter')search();}} placeholder="Tìm kiếm nghề nghiệp, kỹ năng..." aria-label="Tìm kiếm nghề nghiệp"/>
      <button className="figma-action" style={{left:875,top:26,width:284,height:42}} onClick={search} aria-label="Tìm kiếm"/>
      {categories.map((item)=><button key={item.key} className={`figma-choice ${category===item.key?'selected':''}`} style={{left:item.left,top:444,width:item.width,height:35,borderRadius:10}} onClick={()=>chooseCategory(item.key)} aria-label={item.label}/>)}
      {(careers.length?careers:[]).slice(0,5).map((career,index)=><button key={career.id} className="figma-action" style={{left:250+index*236,top:535,width:214,height:270}} onClick={()=>setSelected(career)} aria-label={`Xem ${career.title}`}/>)}
      <button className="figma-action" style={{left:327,top:260,width:170,height:44}} onClick={()=>setResultsOpen(true)} aria-label="Làm trắc nghiệm"/>
      <button className="figma-action" style={{left:1315,top:444,width:94,height:35}} onClick={()=>setResultsOpen(true)} aria-label="Bộ lọc"/>
      {loading&&<span className="figma-overlay-spinner" style={{left:1140,top:35,borderColor:'rgba(99,56,237,.25)',borderTopColor:'#6338ed'}}/>}
    </FigmaFrame>
    <FigmaModal open={resultsOpen} title={query?`Kết quả cho “${query}”`:'Khám phá nghề phù hợp'} onClose={()=>setResultsOpen(false)} wide>
      <div className="ct-career-list">{careers.map((career)=><button type="button" className="ct-career-option" key={career.id} onClick={()=>{setResultsOpen(false);setSelected(career);}}><strong>{career.title} · {career.match}%</strong><small>{career.category} · {career.salaryMin}-{career.salaryMax} triệu/tháng</small><small>{career.description}</small></button>)}</div>
      {!careers.length&&!loading&&<p>Chưa tìm thấy nghề phù hợp với bộ lọc này.</p>}
    </FigmaModal>
    <CareerDetailModal career={selected} onClose={()=>setSelected(null)} onSaved={(career)=>{setSelected(career);setCareers((current)=>current.map((item)=>item.id===career.id?career:item));}}/>
  </>;
}
