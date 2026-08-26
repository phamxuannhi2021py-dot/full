import { Suspense } from 'react';
import { FigmaLogin } from '@/components/FigmaAuthClient';

export default function Page() {
  return <Suspense fallback={null}><FigmaLogin /></Suspense>;
}
