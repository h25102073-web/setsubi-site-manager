import {and,eq,inArray} from "drizzle-orm";
import {getDb} from "@/db";
import {auditLogs,documents,feedback,knowledgeReports,knowledgeRevisions,materials,meetingMinutes,penetrations,projectMembers,projects,projectSettings,schedules,tasks,userSettings} from "@/db/schema";

export class ApiError extends Error{constructor(public status:number,message:string){super(message)}}
export type RequestContext={db:Awaited<ReturnType<typeof getDb>>;email:string;projectId:string;role:string};
const now=()=>new Date().toISOString();
const SCREENSHOT_EMAIL="sites-screenshot-service-noreply@chatgpt.com";
async function defaultProjectId(email:string){
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(email));
 return "default-"+Array.from(new Uint8Array(digest)).slice(0,12).map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function moveProjectData(db:Awaited<ReturnType<typeof getDb>>,fromIds:string[],toId:string){
 const ids=fromIds.filter(x=>x&&x!==toId);if(!ids.length)return;
 for(const table of [tasks,schedules,materials,penetrations,documents,knowledgeReports,meetingMinutes,feedback,knowledgeRevisions]){
  await db.update(table).set({projectId:toId}).where(inArray(table.projectId,ids));
 }
}

export async function requireContext(req:Request):Promise<RequestContext>{
 const email=(req.headers.get("oai-authenticated-user-email")||req.headers.get("x-user-email")||"").trim().toLowerCase();
 if(!email)throw new ApiError(401,"ログイン情報を確認できません");
 const db=await getDb();
 let setting=await db.query.userSettings.findFirst({where:eq(userSettings.email,email)});
 let projectId=setting?.activeProjectId||"";
 let member=projectId?await db.query.projectMembers.findFirst({where:and(eq(projectMembers.projectId,projectId),eq(projectMembers.email,email))}):undefined;
 if(!member){
  member=await db.query.projectMembers.findFirst({where:eq(projectMembers.email,email)});
  projectId=member?.projectId||"";
 }
 if(!projectId){
  projectId=await defaultProjectId(email);const t=now();
  await db.insert(projects).values({id:projectId,ownerEmail:email,name:"設備工事現場",createdAt:t,updatedAt:t}).onConflictDoNothing();
  await db.insert(projectMembers).values({projectId,email,role:"owner",createdAt:t}).onConflictDoNothing();
  await db.insert(projectSettings).values({projectId,updatedAt:t}).onConflictDoNothing();
  member=await db.query.projectMembers.findFirst({where:and(eq(projectMembers.projectId,projectId),eq(projectMembers.email,email))});
  if(email!==SCREENSHOT_EMAIL)await moveProjectData(db,[""],projectId);
 }
 if(!setting){
  const t=now();await db.insert(userSettings).values({email,activeProjectId:projectId,createdAt:t,updatedAt:t}).onConflictDoNothing();
 }else if(setting.activeProjectId!==projectId)await db.update(userSettings).set({activeProjectId:projectId,updatedAt:now()}).where(eq(userSettings.email,email));
 if(email!==SCREENSHOT_EMAIL){
 const legacy=await db.select({id:projects.id}).from(projects).where(eq(projects.ownerEmail,SCREENSHOT_EMAIL));
  const legacyIds=legacy.map(x=>x.id);
  await moveProjectData(db,legacyIds,projectId);
  if(legacyIds.length)await db.update(projects).set({ownerEmail:"legacy-recovered@local",updatedAt:now()}).where(inArray(projects.id,legacyIds));
 }
 return{db,email,projectId,role:member?.role||"viewer"};
}
export function apiError(e:unknown){return e instanceof ApiError?Response.json({error:e.message},{status:e.status}):Response.json({error:e instanceof Error?e.message:"処理できませんでした"},{status:500})}
export function requireEditor(ctx:RequestContext){if(!["owner","editor"].includes(ctx.role))throw new ApiError(403,"編集権限がありません")}
export async function audit(ctx:RequestContext,action:string,entityType:string,entityId:string,summary:string,before?:unknown,after?:unknown){
 await ctx.db.insert(auditLogs).values({projectId:ctx.projectId,actorEmail:ctx.email,action,entityType,entityId,summary,beforeJson:before?JSON.stringify(before):"",afterJson:after?JSON.stringify(after):"",createdAt:now()});
}
