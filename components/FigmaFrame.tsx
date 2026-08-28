'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { FrameSpec } from '@/lib/figmaFrames';

type Hotspot = { x:number; y:number; w:number; h:number; href?:string; onClick?:()=>void; label?:string };

type Props = {
  frame: FrameSpec;
  hotspots?: Hotspot[];
  desktopNav?: boolean;
  children?: React.ReactNode;
};

const desktopLinks = [
  { x:19,y:111,w:180,h:44,href:'/dashboard',label:'Trang chủ' },
  { x:19,y:164,w:180,h:44,href:'/explore',label:'Khám phá' },
  { x:19,y:217,w:180,h:44,href:'/career-map',label:'Career Map' },
  { x:19,y:270,w:180,h:44,href:'/simulation',label:'Mô phỏng nghề' },
  { x:19,y:323,w:180,h:44,href:'/reports',label:'Báo cáo kết quả' },
  { x:19,y:376,w:180,h:44,href:'/compare',label:'So sánh nghề' },
  { x:19,y:429,w:180,h:44,href:'/roadmap',label:'Lộ trình phát triển' },
  { x:19,y:482,w:180,h:44,href:'/knowledge',label:'Kho kiến thức' },
  { x:19,y:889,w:180,h:44,href:'/profile',label:'Hồ sơ của bạn' },
  { x:19,y:943,w:180,h:44,href:'/settings',label:'Cài đặt' },
];

export default function FigmaFrame({ frame, hotspots = [], desktopNav = false, children }: Props){
  const [src,setSrc] = useState(frame.local);
  const [scale,setScale] = useState(1);

  useEffect(()=>{
    const update = () => {
      // Keep the approved Figma canvas intact, but fit it to the actual
      // device width so all overlays remain reachable on small screens.
      const targetWidth = window.innerWidth;
      setScale(Math.min(1, targetWidth / frame.width));
    };
    update();
    window.addEventListener('resize',update);
    return ()=>window.removeEventListener('resize',update);
  },[frame.width]);

  const all = useMemo(()=>desktopNav ? [...desktopLinks,...hotspots] : hotspots,[desktopNav,hotspots]);
  const scaledHeight = frame.height * scale;

  return <div className="figma-viewport" style={{height:scaledHeight}}>
    <div className="figma-canvas" style={{width:frame.width,height:frame.height,transform:`scale(${scale})`}}>
      <img
        className="figma-frame-image"
        src={src}
        alt="CareerTwin interface"
        draggable={false}
        onError={()=>{ if(src !== frame.remote) setSrc(frame.remote); }}
      />
      {all.map((h,i)=> h.href ? (
        <Link key={`${h.href}-${i}`} href={h.href} aria-label={h.label || 'Đi tới trang'} className="figma-hotspot" style={{left:h.x,top:h.y,width:h.w,height:h.h}} />
      ) : (
        <button key={i} type="button" aria-label={h.label || 'Thao tác'} onClick={'onClick' in h ? h.onClick : undefined} className="figma-hotspot" style={{left:h.x,top:h.y,width:h.w,height:h.h}} />
      ))}
      {children}
    </div>
  </div>;
}
