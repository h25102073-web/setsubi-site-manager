import {eq} from "drizzle-orm";
import {getDb} from "@/db";
import {subscriptions} from "@/db/schema";

const enc=new TextEncoder();

async function hmacHex(secret:string,payload:string){
 const key=await crypto.subtle.importKey(
  "raw",
  enc.encode(secret),
  {name:"HMAC",hash:"SHA-256"},
  false,
  ["sign"]
 );
 const sig=await crypto.subtle.sign("HMAC",key,enc.encode(payload));
 return Array.from(new Uint8Array(sig))
  .map(x=>x.toString(16).padStart(2,"0"))
  .join("");
}

function safeEqual(a:string,b:string){
 if(a.length!==b.length)return false;
 let out=0;
 for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);
 return out===0;
}

async function verify(body:string,header:string,secret:string){
 const parts=header.split(",").map(x=>x.trim());
 const t=parts.find(x=>x.startsWith("t="))?.slice(2)||"";
 const v1=parts.filter(x=>x.startsWith("v1=")).map(x=>x.slice(3));
 if(!t||!v1.length)return false;
 if(Math.abs(Date.now()/1000-Number(t))>300)return false;
 const expected=await hmacHex(secret,`${t}.${body}`);
 return v1.some(x=>safeEqual(x,expected));
}

const isoFromUnix=(n:any)=>Number(n)>0
 ? new Date(Number(n)*1000).toISOString()
 : "";

const now=()=>new Date().toISOString();

async function upsert(email:string,data:{
 plan?:string;
 status?:string;
 billingInterval?:string;
 stripeCustomerId?:string;
 stripeSubscriptionId?:string;
 currentPeriodEnd?:string;
 cancelAtPeriodEnd?:boolean;
}){
 if(!email)return;

 const db=await getDb();
 const t=now();

 const existing=await db.query.subscriptions.findFirst({
  where:eq(subscriptions.email,email)
 });

 const values={
  email,
  plan:data.plan||existing?.plan||"free",
  status:data.status||existing?.status||"inactive",
  billingInterval:data.billingInterval||existing?.billingInterval||"month",
  stripeCustomerId:data.stripeCustomerId||existing?.stripeCustomerId||"",
  stripeSubscriptionId:data.stripeSubscriptionId||existing?.stripeSubscriptionId||"",
  currentPeriodEnd:data.currentPeriodEnd||existing?.currentPeriodEnd||"",
  cancelAtPeriodEnd:data.cancelAtPeriodEnd??existing?.cancelAtPeriodEnd??false,
  createdAt:existing?.createdAt||t,
  updatedAt:t
 };

 await db.insert(subscriptions)
  .values(values)
  .onConflictDoUpdate({
   target:subscriptions.email,
   set:values
  });
}

export async function POST(req:Request){
 const body=await req.text();

 const {env}=await import("cloudflare:workers");
 const secret=String((env as any).STRIPE_WEBHOOK_SECRET||"");
 const signature=req.headers.get("stripe-signature")||"";

 if(!secret||!(await verify(body,signature,secret))){
  return new Response("invalid signature",{status:400});
 }

 let event:any;
 try{
  event=JSON.parse(body)
 }catch{
  return new Response("invalid json",{status:400});
 }

 const o=event?.data?.object||{};

 if(event.type==="checkout.session.completed"){
  const email=String(
   o.client_reference_id||
   o.customer_details?.email||
   o.metadata?.email||
   ""
  ).toLowerCase();

  await upsert(email,{
   plan:"pro",
   status:"active",
   billingInterval:o.metadata?.interval||"month",
   stripeCustomerId:String(o.customer||""),
   stripeSubscriptionId:String(o.subscription||"")
  });
 }

 if([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted"
 ].includes(event.type)){
  let email=String(o.metadata?.email||"").toLowerCase();

  if(!email&&o.id){
   const db=await getDb();
   const existing=await db.query.subscriptions.findFirst({
    where:eq(subscriptions.stripeSubscriptionId,String(o.id))
   });
   email=existing?.email||"";
  }

  await upsert(email,{
   plan:event.type==="customer.subscription.deleted"?"free":"pro",
   status:String(o.status||"inactive"),
   billingInterval:String(o.metadata?.interval||"month"),
   stripeCustomerId:String(o.customer||""),
   stripeSubscriptionId:String(o.id||""),
   currentPeriodEnd:isoFromUnix(o.current_period_end),
   cancelAtPeriodEnd:Boolean(o.cancel_at_period_end)
  });
 }

 return Response.json({received:true});
}
