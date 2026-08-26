import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'careertwin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && (!value || value.length < 32)) {
    throw new Error('SESSION_SECRET must contain at least 32 characters in production.');
  }
  return new TextEncoder().encode(value || 'careertwin-local-development-secret-change-me');
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId, type: 'session' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    priority: 'high',
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ['HS256'],
      typ: 'JWT',
    });
    return payload.type === 'session' && typeof payload.userId === 'string' ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function getUserId() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}
