import { currentUser } from '@/lib/current-user';
import { errorResponse } from '@/lib/api';

export async function GET() {
  const user = await currentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  return Response.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    onboardingCompleted: Boolean(user.onboardingCompletedAt),
    profile: user.profile,
    settings: user.settings,
    interests: user.interests,
    skills: user.skills,
    goals: user.goals,
  });
}
