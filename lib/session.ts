import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export const SESSION_COOKIE = 'careertwin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

export type SessionPayload = {
  userId: string;
  type: 'session';
  onboardingCompleted: boolean;
  tokenVersion: number;
};

function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && (!value || value.length < 32)) {
    throw new Error('SESSION_SECRET must contain at least 32 characters in production.');
  }
  return new TextEncoder().encode(value || 'careertwin-local-development-secret-change-me');
}

export async function createSession(payload: Omit<SessionPayload, 'type'>) {
  const token = await new SignJWT({ 
    userId: payload.userId,
    type: 'session',
    onboardingCompleted: payload.onboardingCompleted,
    tokenVersion: payload.tokenVersion,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(payload.userId)
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

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ['HS256'],
      typ: 'JWT',
    });

    if (
      payload.type !== 'session' ||
      typeof payload.userId !== 'string' ||
      typeof payload.onboardingCompleted !== 'boolean' ||
      typeof payload.tokenVersion !== 'number'
    ) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { tokenVersion: true },
    });

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return null;
    }

    return {
      userId: payload.userId,
      type: 'session',
      onboardingCompleted: payload.onboardingCompleted,
      tokenVersion: payload.tokenVersion,
    };
  } catch {
    return null;
  }
}

export async function getUserId() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  return (payload?.userId as string) || null;
}
