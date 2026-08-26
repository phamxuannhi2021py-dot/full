'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';

type Step = 'basic' | 'interests' | 'skills' | 'goals';
type Status = { error?: string; loading?: boolean };

const interestKeys = ['creative','technology','business','science','people','problem-solving','communication','engineering','social'];
const skillKeys = ['coding','design','writing','language','analysis','management','communication','marketing','office','content','soft'];
const goalKeys = ['university','good-job','career-growth','startup','achievement','abroad','balance','other'];

async function saveOnboarding(body: unknown) {
  const response = await fetch('/api/onboarding', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Không thể lưu thông tin');
}

export default function FigmaOnboardingClient({ step }: { step: Step }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student'|'university'|'worker'>('student');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'female'|'male'|'other'>('female');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState<string[]>(['technology']);
  const [skills, setSkills] = useState<Record<string,number>>({coding:65,design:80,writing:50,language:55,analysis:65,management:45,communication:75,marketing:45,office:70,content:55,soft:65});
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['design','communication','office']);
  const [goals, setGoals] = useState<string[]>(['career-growth']);
  const [horizon, setHorizon] = useState<'under-1'|'1-3'|'3-5'|'over-5'>('1-3');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.ok ? response.json() : null).then((user) => {
      if (!user) return;
      setName(user.name || ''); setEmail(user.email || '');
      setRole(['student','university','worker'].includes(user.role) ? user.role : 'student');
      if (user.profile) {
        setBirthDate(user.profile.birthDate || ''); setGender(user.profile.gender || 'female'); setPhone(user.profile.phone || '');
      }
      if (user.interests?.length) setInterests(user.interests.map((item:{key:string})=>item.key));
      if (user.skills?.length) {
        setSelectedSkills(user.skills.map((item:{key:string})=>item.key));
        setSkills((current) => ({...current,...Object.fromEntries(user.skills.map((item:{key:string;level:number})=>[item.key,item.level]))}));
      }
      if (user.goals?.length) {
        setGoals(user.goals.map((item:{key:string})=>item.key));
        setHorizon(user.goals[0].horizon || '1-3'); setDetail(user.goals[0].detail || '');
      }
    }).catch(()=>{});
  }, []);

  const frame = useMemo(() => ({
    basic: frames.onboardingBasic,
    interests: frames.onboardingInterests,
    skills: frames.onboardingSkills,
    goals: frames.onboardingGoals,
  })[step], [step]);

  async function submit(body: unknown, destination: string) {
    setStatus({loading:true});
    try { await saveOnboarding(body); router.push(destination); }
    catch (error) { setStatus({error:error instanceof Error ? error.message : 'Không thể lưu thông tin'}); }
  }
  function toggle(value: string, list: string[], setList: (value:string[])=>void) {
    setList(list.includes(value) ? list.filter((item)=>item!==value) : [...list,value]);
  }

  return <FigmaFrame frame={frame}>
    {step === 'basic' && <>
      {(['student','university','worker'] as const).map((value,index)=><button key={value} type="button" className={`figma-choice ${role===value?'selected':''}`} style={{left:646+index*255,top:252,width:230,height:285}} onClick={()=>setRole(value)} aria-label={value} />)}
      <input className="figma-input-overlay" style={{left:692,top:604,width:285,height:34}} value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nhập họ và tên của bạn" aria-label="Họ và tên" />
      <input className="figma-input-overlay" style={{left:1085,top:604,width:255,height:34}} value={birthDate} onChange={(e)=>setBirthDate(e.target.value)} placeholder="DD/MM/YYYY" aria-label="Ngày sinh" />
      {(['female','male','other'] as const).map((value,index)=><button key={value} type="button" className={`figma-choice ${gender===value?'selected':''}`} style={{left:646+index*260,top:691,width:220,height:51}} onClick={()=>setGender(value)} aria-label={value} />)}
      <div className="figma-dynamic-text" style={{left:704,top:806,width:260,height:27,fontSize:12,color:'#8d97b5',padding:'6px 0'}}>{email}</div>
      <input className="figma-input-overlay" style={{left:1090,top:804,width:250,height:34}} value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Nhập số điện thoại của bạn" aria-label="Số điện thoại" />
      <button type="button" className="figma-action" style={{left:646,top:887,width:740,height:59}} onClick={()=>submit({basic:{name,role,birthDate,gender,phone}},'/onboarding/interests')} aria-label="Tiếp tục" disabled={status.loading} />
    </>}
    {step === 'interests' && <>
      {interestKeys.map((value,index)=> {
        const col=index%3,row=Math.floor(index/3);
        return <button key={value} type="button" className={`figma-choice ${interests.includes(value)?'selected':''}`} style={{left:633+col*255,top:257+row*165,width:240,height:150}} onClick={()=>toggle(value,interests,setInterests)} aria-label={value}/>;
      })}
      <button type="button" className="figma-action" style={{left:633,top:927,width:190,height:53}} onClick={()=>router.back()} aria-label="Quay lại" />
      <button type="button" className="figma-action" style={{left:843,top:927,width:550,height:53}} onClick={()=>submit({interests},'/onboarding/skills')} aria-label="Tiếp tục" disabled={!interests.length||status.loading} />
    </>}
    {step === 'skills' && <>
      {skillKeys.map((value,index)=> {
        const col=index%4,row=Math.floor(index/4);
        return <button key={value} type="button" className={`figma-choice ${selectedSkills.includes(value)?'selected':''}`} style={{left:638+col*190,top:278+row*78,width:175,height:60}} onClick={()=>toggle(value,selectedSkills,setSelectedSkills)} aria-label={value}/>;
      })}
      {[
        ['coding',638,589],['design',1023,589],['communication',638,698],['office',1023,698],
      ].map(([key,left,top])=><input key={String(key)} className="figma-range-overlay" style={{left:Number(left),top:Number(top),width:343}} type="range" min="0" max="100" step="5" value={skills[String(key)]||50} onChange={(e)=>setSkills({...skills,[String(key)]:Number(e.target.value)})} aria-label={String(key)} />)}
      <button type="button" className="figma-action" style={{left:638,top:917,width:190,height:52}} onClick={()=>router.back()} aria-label="Quay lại" />
      <button type="button" className="figma-action" style={{left:848,top:917,width:550,height:52}} onClick={()=>submit({skills:Object.fromEntries(selectedSkills.map((key)=>[key,skills[key]??50]))},'/onboarding/goals')} aria-label="Tiếp tục" disabled={!selectedSkills.length||status.loading} />
    </>}
    {step === 'goals' && <>
      {goalKeys.map((value,index)=> {
        const col=index%4,row=Math.floor(index/4);
        return <button key={value} type="button" className={`figma-choice ${goals.includes(value)?'selected':''}`} style={{left:638+col*190,top:272+row*160,width:175,height:145}} onClick={()=>toggle(value,goals,setGoals)} aria-label={value}/>;
      })}
      <textarea className="figma-input-overlay" style={{left:650,top:647,width:710,height:70,resize:'none',padding:'7px'}} value={detail} onChange={(e)=>setDetail(e.target.value.slice(0,300))} placeholder="Mô tả thêm về mục tiêu..." aria-label="Mô tả mục tiêu" />
      {(['under-1','1-3','3-5','over-5'] as const).map((value,index)=><button key={value} type="button" className={`figma-choice ${horizon===value?'selected':''}`} style={{left:638+index*185,top:797,width:170,height:44}} onClick={()=>setHorizon(value)} aria-label={value}/>)}
      <button type="button" className="figma-action" style={{left:638,top:907,width:190,height:52}} onClick={()=>router.back()} aria-label="Quay lại" />
      <button type="button" className="figma-action" style={{left:848,top:907,width:550,height:52}} onClick={()=>submit({goals,horizon,detail},'/dashboard')} aria-label="Hoàn tất" disabled={!goals.length||status.loading} />
    </>}
    {status.loading && <span className="figma-overlay-spinner" style={{left:1110,top:920}} />}
    {status.error && <div className="figma-overlay-error" style={{left:650,top:965,width:700}}>{status.error}</div>}
  </FigmaFrame>;
}
