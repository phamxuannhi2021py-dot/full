import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import { errorResponse } from '@/lib/api';

export async function POST(_request:Request,context:{params:Promise<{slug:string}>}){
  const userId=await getUserId();if(!userId)return errorResponse('Unauthorized',401);
  const {slug}=await context.params;const article=await db.article.findUnique({where:{slug}});
  if(!article)return errorResponse('Không tìm thấy bài viết',404);
  await db.activity.create({data:{userId,type:'article',title:'Đọc bài viết',detail:article.title,metadata:{slug}}});
  return Response.json({ok:true});
}
