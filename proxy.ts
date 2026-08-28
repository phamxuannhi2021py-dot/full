import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const publicPages = new Set(['/login', '/register']);
const publicApi = new Set(['/api/auth/login', '/api/auth/register', '/api/health']);

function isPublicApiRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicApi.has(pathname)) return true;

  if (request.method === 'GET') {
    return (
      pathname === '/api/careers' ||
      /^\/api\/careers\/[^/]+$/.test(pathname) ||
      pathname === '/api/articles'
    );
  }

  return false;
}

interface SessionPayload {
  type: string;
  userId: string;
  onboardingCompleted: boolean;
  tokenVersion: number;
}

async function getUserSessionPayload(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get('careertwin_session')?.value;
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'careertwin-local-development-secret-change-me');
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'], typ: 'JWT' });
    if (
      payload.type === 'session' &&
      typeof payload.userId === 'string' &&
      typeof payload.onboardingCompleted === 'boolean' &&
      typeof payload.tokenVersion === 'number'
    ) {
      return payload as unknown as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await getUserSessionPayload(request);
  const authenticated = Boolean(session);

  if (authenticated && publicPages.has(pathname)) {
    const targetPath = session?.onboardingCompleted ? '/dashboard' : '/onboarding/basic';
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  const isPublic = pathname === '/' || publicPages.has(pathname) || isPublicApiRequest(request);
  
  if (!isPublic && !authenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Ensure search params are included properly for login redirect
    const fullTargetUrl = pathname + search;
    const login = new URL('/login', request.url);
    login.searchParams.set('next', fullTargetUrl);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|figma/|robots.txt|sitemap.xml).*)'],
};
