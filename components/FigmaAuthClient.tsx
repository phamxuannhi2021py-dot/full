'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FigmaFrame from './FigmaFrame';
import { frames } from '@/lib/figmaFrames';
import { FigmaModal, InlineStatus } from './FigmaModal';

async function postJSON(url: string, body: unknown) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Không thể thực hiện yêu cầu');
  return payload;
}

export function FigmaLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [providerInfo, setProviderInfo] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await postJSON('/api/auth/login', { email, password });
      const requested = params.get('next');
      const destination = requested?.startsWith('/') ? requested : result.user?.onboardingCompleted ? '/dashboard' : '/onboarding/basic';
      router.push(destination);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Đăng nhập thất bại');
    } finally { setLoading(false); }
  }
  return <form onSubmit={submit}>
    <FigmaFrame frame={frames.login}>
      <input className="figma-input-overlay" style={{left:932,top:357,width:295,height:28}} type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Nhập email của bạn" aria-label="Email" required />
      <input className="figma-input-overlay" style={{left:932,top:432,width:276,height:28}} type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Nhập mật khẩu của bạn" aria-label="Mật khẩu" required />
      <button className="figma-action" style={{left:893,top:509,width:375,height:46}} aria-label="Đăng nhập" disabled={loading} />
      <button type="button" className="figma-action" style={{left:893,top:591,width:375,height:42}} aria-label="Đăng nhập với Google" onClick={()=>setProviderInfo(true)} />
      <Link className="figma-action" style={{left:1085,top:642,width:105,height:26}} href="/register" aria-label="Đăng ký ngay" />
      {loading && <span className="figma-overlay-spinner" style={{left:1070,top:519}} />}
      {error && <div className="figma-overlay-error" style={{left:893,top:676,width:350}}>{error}</div>}
    </FigmaFrame>
    <FigmaModal open={providerInfo} title="Đăng nhập Google" onClose={()=>setProviderInfo(false)}>
      <p>Phiên bản production hỗ trợ đăng nhập email/mật khẩu bảo mật. Google OAuth cần cấu hình Client ID và callback domain theo từng môi trường deploy; nút này được giữ đúng UI và sẽ sẵn sàng khi cấu hình nhà cung cấp.</p>
      <div className="ct-actions"><button type="button" className="ct-primary" onClick={()=>setProviderInfo(false)}>Đã hiểu</button></div>
    </FigmaModal>
  </form>;
}

export function FigmaRegister() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!agreed) return setError('Bạn cần đồng ý với điều khoản sử dụng');
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp');
    setError(''); setLoading(true);
    try {
      await postJSON('/api/auth/register', { name, email, password });
      router.push('/onboarding/basic'); router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Đăng ký thất bại');
    } finally { setLoading(false); }
  }
  return <form onSubmit={submit}>
    <FigmaFrame frame={frames.register}>
      <input className="figma-input-overlay" style={{left:1020,top:322,width:430,height:32}} value={name} onChange={(e)=>setName(e.target.value)} autoComplete="name" placeholder="Nhập họ và tên của bạn" aria-label="Họ và tên" required />
      <input className="figma-input-overlay" style={{left:1020,top:414,width:430,height:32}} value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" type="email" placeholder="Nhập email của bạn" aria-label="Email" required />
      <input className="figma-input-overlay" style={{left:1020,top:506,width:395,height:32}} value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="new-password" type="password" placeholder="Tạo mật khẩu" aria-label="Mật khẩu" required />
      <input className="figma-input-overlay" style={{left:1020,top:598,width:395,height:32}} value={confirm} onChange={(e)=>setConfirm(e.target.value)} autoComplete="new-password" type="password" placeholder="Nhập lại mật khẩu" aria-label="Xác nhận mật khẩu" required />
      <input className="figma-checkbox-overlay" style={{left:957,top:667}} type="checkbox" checked={agreed} onChange={(e)=>setAgreed(e.target.checked)} aria-label="Đồng ý điều khoản" />
      <button className="figma-action" style={{left:958,top:710,width:540,height:57}} aria-label="Tạo tài khoản" disabled={loading} />
      <Link className="figma-action" style={{left:1250,top:924,width:90,height:28}} href="/login" aria-label="Đăng nhập" />
      {loading && <span className="figma-overlay-spinner" style={{left:1215,top:726}} />}
      {error && <div className="figma-overlay-error" style={{left:958,top:780,width:515}}>{error}</div>}
    </FigmaFrame>
  </form>;
}
