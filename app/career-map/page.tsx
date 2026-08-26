import { Suspense } from 'react';
import FigmaRoadmapClient from '@/components/FigmaRoadmapClient';
export default function Page(){return <Suspense fallback={null}><FigmaRoadmapClient variant="map"/></Suspense>;}
