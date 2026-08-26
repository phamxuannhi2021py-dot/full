'use client';

import { useEffect,useState } from 'react';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import { FigmaModal } from './FigmaModal';

type Article={id:string;slug:string;title:string;category:string;description:string;content:string;minutes:number};

export default function FigmaKnowledgeClient(){
  const[articles,setArticles]=useState<Article[]>([]);const[query,setQuery]=useState('');const[selected,setSelected]=useState<Article|null>(null);const[results,setResults]=useState(false);const[loading,setLoading]=useState(false);
  async function load(q=''){setLoading(true);const response=await fetch(`/api/articles${q?`?q=${encodeURIComponent(q)}`:''}`);if(response.ok)setArticles(await response.json());setLoading(false);}
  useEffect(()=>{load();},[]);
  function open(article:Article){setSelected(article);fetch(`/api/articles/${article.slug}/read`,{method:'POST'}).catch(()=>{});}
  function search(){load(query);setResults(true);}
  return <>
    <FigmaFrame frame={frames.knowledge} desktopNav>
      <input className="figma-input-overlay" style={{left:901,top:34,width:225,height:24}} value={query} onChange={(event)=>setQuery(event.target.value)} onKeyDown={(event)=>{if(event.key==='Enter')search();}} placeholder="Tìm kiếm bài viết, khóa học..." aria-label="Tìm kho kiến thức"/>
      <button className="figma-action" style={{left:875,top:26,width:283,height:42}} onClick={search} aria-label="Tìm kiếm"/>
      {articles.slice(0,8).map((article,index)=>{const col=index%4,row=Math.floor(index/4);return <button key={article.id} className="figma-action" style={{left:265+col*205,top:523+row*222,width:195,height:210}} onClick={()=>open(article)} aria-label={article.title}/>;})}
      <button className="figma-action" style={{left:595,top:957,width:160,height:32}} onClick={()=>setResults(true)} aria-label="Xem thêm"/>
      {loading&&<span className="figma-overlay-spinner" style={{left:1135,top:35,borderColor:'rgba(99,56,237,.25)',borderTopColor:'#6338ed'}}/>}
    </FigmaFrame>
    <FigmaModal open={results} title={query?`Kết quả cho “${query}”`:'Kho kiến thức'} onClose={()=>setResults(false)} wide><div className="ct-career-list">{articles.map((article)=><button type="button" className="ct-career-option" key={article.id} onClick={()=>{setResults(false);open(article);}}><strong>{article.title}</strong><small>{article.category} · {article.minutes} phút đọc</small><small>{article.description}</small></button>)}</div>{!articles.length&&!loading&&<p>Không tìm thấy nội dung phù hợp.</p>}</FigmaModal>
    <FigmaModal open={Boolean(selected)} title={selected?.title||''} onClose={()=>setSelected(null)} wide>{selected&&<><p><b>{selected.category} · {selected.minutes} phút đọc</b></p><p>{selected.content}</p><div className="ct-actions"><a className="ct-primary" href="/roadmap">Áp dụng vào lộ trình</a></div></>}</FigmaModal>
  </>;
}
