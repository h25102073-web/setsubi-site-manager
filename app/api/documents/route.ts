import {and,desc,eq,like,or} from "drizzle-orm";
import {documents} from "@/db/schema";
import {apiError,audit,requireContext,requireEditor} from "@/lib/request-context";
import {extractText,getDocumentProxy} from "unpdf";

export async function GET(req:Request){
 try{const c=await requireContext(req);const q=new URL(req.url).searchParams.get("q")?.trim()||"";
 const terms=q.split(/[\s　、。・／/（）()「」『』？?のはをにでと]+/).filter(x=>x.length>1).slice(0,8);
 const conditions=terms.flatMap(term=>[like(documents.name,`%${term}%`),like(documents.extractedText,`%${term}%`)]);
 const rows=await c.db.select().from(documents).where(and(eq(documents.projectId,c.projectId),conditions.length?or(...conditions):undefined)).orderBy(desc(documents.id));
 return Response.json({documents:rows.map(({extractedText,...x})=>{const lower=extractedText.toLowerCase();const positions=terms.map(t=>lower.indexOf(t.toLowerCase())).filter(p=>p>=0);const hit=positions.length?Math.min(...positions):0;const start=Math.max(0,hit-90);return {...x,preview:(start?"…":"")+extractedText.slice(start,start+420)+(start+420<extractedText.length?"…":""),textLength:extractedText.length}})});}catch(e){return apiError(e)}
}
export async function POST(req:Request){
 try{const c=await requireContext(req);requireEditor(c);
 const form=await req.formData();const file=form.get("file");
 if(!(file instanceof File))return Response.json({error:"PDFを選択してください"},{status:400});
 if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf"))return Response.json({error:"PDFのみ登録できます"},{status:400});
 if(file.size>20*1024*1024)return Response.json({error:"PDFは20MB以下にしてください"},{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer());let extracted="",pages=0,status="読取済み";
 try{const pdf=await getDocumentProxy(bytes);const result=await extractText(pdf,{mergePages:true});pages=result.totalPages;extracted=String(result.text||"").trim();if(!extracted){status="画像PDF・OCR待ち";}}
 catch{status="読取エラー";}
 const {env}=await import("cloudflare:workers");if(!env.BUCKET)return Response.json({error:"資料保存領域が利用できません"},{status:503});
 const objectKey=`documents/${Date.now()}-${crypto.randomUUID()}.pdf`;await env.BUCKET.put(objectKey,bytes,{httpMetadata:{contentType:"application/pdf"}});
 const [row]=await c.db.insert(documents).values({projectId:c.projectId,name:String(form.get("name")||file.name.replace(/\.pdf$/i,"")),category:String(form.get("category")||"施工計画書"),fileName:file.name,objectKey,contentType:"application/pdf",fileSize:file.size,pageCount:pages,extractedText:extracted,status,sharing:String(form.get("sharing")||"自社のみ"),createdAt:new Date().toISOString()}).returning();
 await audit(c,"create","document",String(row.id),row.name);return Response.json({document:{...row,extractedText:undefined,preview:extracted.slice(0,360),textLength:extracted.length}},{status:201});}catch(e){return apiError(e)}
}
