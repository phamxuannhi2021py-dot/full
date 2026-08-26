import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const publicPages = new Set(['/login', '/register']);
const publicApi = new Set(['/api/auth/login', '/api/auth/register', '/api/health']);

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get('careertwin_session')?.value;
  if (!token) return false;
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'careertwin-local-development-secret-change-me');
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'], typ: 'JWT' });
    return payload.type === 'session' && typeof payload.userId === 'string';
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authenticated = await isAuthenticated(request);
  if ((publicPages.has(pathname) || publicApi.has(pathname)) && authenticated && publicPages.has(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  const isPublic = pathname === '/' || publicPages.has(pathname) || publicApi.has(pathname);
  if (!isPublic && !authenticated) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|figma/|robots.txt|sitemap.xml).*)'],
};
