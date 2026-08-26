'use client';

import { FormEvent,useEffect,useState } from 'react';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import { FigmaModal,InlineStatus } from './FigmaModal';

type ProfileData={name:string;email:string;role:string;profile:Record<string,string|number|null>;skills:{key:string;level:number}[];activities:{id:string;title:string;detail?:string}[]};

export default function FigmaProfileClient(){
  const[data,setData]=useState<ProfileData|null>(null);const[edit,setEdit]=useState(false);const[activities,setActivities]=useState(false);const[form,setForm]=useState<Record<string,string>>({});const[status,setStatus]=useState<{error?:string;success?:string;loading?:boolean}>({});
  async function load(){const response=await fetch('/api/profile');const payload=await response.json();if(!response.ok)throw new Error(payload.error);setData(payload);setForm({name:payload.name||'',birthDate:payload.profile?.birthDate||'',gender:payload.profile?.gender||'female',phone:payload.profile?.phone||'',city:payload.profile?.city||'',school:payload.profile?.school||'',education:payload.profile?.education||'',major:payload.profile?.major||'',grade:payload.profile?.grade||'',bio:payload.profile?.bio||''});}
  useEffect(()=>{load().catch((error)=>setStatus({error:error.message}));},[]);
  async function save(event:FormEvent){event.preventDefault();setStatus({loading:true});try{const response=await fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const payload=await response.json();if(!response.ok)throw new Error(payload.error);await load();setStatus({success:'Đã cập nhật hồ sơ'});setEdit(false);}catch(error){setStatus({error:error instanceof Error?error.message:'Không thể lưu hồ sơ'});}}
  const profile=data?.profile||{};
  return <>
    <FigmaFrame frame={frames.profile} desktopNav>
      {data&&<>
        <div className="figma-dynamic-text" style={{left:420,top:137,width:270,height:29,fontSize:18,fontWeight:800,padding:'2px'}}>{data.name}</div>
        <div className="figma-dynamic-text" style={{left:444,top:174,width:250,height:23,fontSize:9,color:'#65708f',padding:'4px'}}>{data.email}</div>
        <div className="figma-dynamic-text" style={{left:444,top:203,width:230,height:23,fontSize:9,color:'#65708f',padding:'4px'}}>{String(profile.phone||'Chưa cập nhật')}</div>
        <div className="figma-dynamic-text" style={{left:444,top:231,width:250,height:23,fontSize:9,color:'#65708f',padding:'4px'}}>{String(profile.city||'Chưa cập nhật')}</div>
        <div className="figma-dynamic-text" style={{left:444,top:260,width:180,height:23,fontSize:9,color:'#65708f',padding:'4px'}}>{String(profile.birthDate||'Chưa cập nhật')}</div>
        <div className="figma-dynamic-text" style={{left:1160,top:189,width:74,height:48,fontSize:28,fontWeight:800,textAlign:'center',padding:'5px'}}>{Number(profile.readiness||0)}%</div>
      </>}
      <button className="figma-action" style={{left:1138,top:294,width:245,height:32}} onClick={()=>setEdit(true)} aria-label="Cập nhật hồ sơ"/>
      <button className="figma-action" style={{left:1138,top:936,width:245,height:32}} onClick={()=>setActivities(true)} aria-label="Xem tất cả hoạt động"/>
      {status.error&&<div className="figma-overlay-error" style={{left:1040,top:68,width:350}}>{status.error}</div>}
    </FigmaFrame>
    <FigmaModal open={edit} title="Cập nhật hồ sơ" onClose={()=>setEdit(false)} wide>
      <form onSubmit={save}><InlineStatus error={status.error} success={status.success}/><div className="ct-form-grid">
        {['name','birthDate','phone','city','school','education','major','grade'].map((key)=><div className="ct-form-field" key={key}><label>{({name:'Họ và tên',birthDate:'Ngày sinh',phone:'Số điện thoại',city:'Thành phố',school:'Trường học',education:'Bậc học',major:'Chuyên ngành',grade:'Lớp / Khóa'} as Record<string,string>)[key]}</label><input value={form[key]||''} onChange={(event)=>setForm({...form,[key]:event.target.value})}/></div>)}
        <div className="ct-form-field"><label>Giới tính</label><select value={form.gender||'female'} onChange={(event)=>setForm({...form,gender:event.target.value})}><option value="female">Nữ</option><option value="male">Nam</option><option value="other">Khác</option></select></div>
        <div className="ct-form-field full"><label>Giới thiệu</label><textarea rows={4} value={form.bio||''} onChange={(event)=>setForm({...form,bio:event.target.value})}/></div>
      </div><div className="ct-actions"><button type="button" className="ct-secondary" onClick={()=>setEdit(false)}>Hủy</button><button className="ct-primary" disabled={status.loading}>Lưu hồ sơ</button></div></form>
    </FigmaModal>
    <FigmaModal open={activities} title="Lịch sử hoạt động" onClose={()=>setActivities(false)} wide><div className="ct-report-list">{data?.activities.map((activity)=><div className="ct-report-row" key={activity.id}><span>{activity.title}</span><small>{activity.detail}</small></div>)}</div></FigmaModal>
  </>;
}
