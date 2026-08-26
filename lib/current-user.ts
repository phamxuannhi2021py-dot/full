import { db } from './db';
import { getUserId } from './session';

export async function currentUser() {
  const id = await getUserId();
  if (!id) return null;
  return db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      settings: true,
      interests: true,
      skills: true,
      goals: true,
    },
  });
}
