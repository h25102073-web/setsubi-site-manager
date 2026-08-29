import {eq} from "drizzle-orm";
import {subscriptions} from "@/db/schema";
import type {RequestContext} from "@/lib/request-context";
import {ApiError} from "@/lib/request-context";

export type BillingPlan="free"|"pro";
export type BillingInterval="month"|"year";
type SubscriptionRow=typeof subscriptions.$inferSelect;

export const PLAN_CATALOG={
 free:{id:"free" as const,name:"FREE",monthlyPriceYen:0,yearlyPriceYen:0,features:["基本的な設備情報","基本計算","施工ルールの一部","ToDo基本機能","お気に入り3件まで"]},
 pro:{id:"pro" as const,name:"PRO",monthlyPriceYen:980,yearlyPriceYen:9800,features:["全配管材・継手・パッキン検索","異種管接続検索","吊りピッチ・支持金物の全データ","配管重量・勾配・高さの全計算","区画貫通・施工要領の詳細","お気に入り無制限","施工動画すべて","AI機能の拡張","現場別設定・高度な管理機能"]}
} as const;

const ACTIVE_STATUSES=new Set(["active","trialing","past_due"]);
const isoFromUnix=(n:any)=>Number(n)>0?new Date(Number(n)*1000).toISOString():"";
const now=()=>new Date().toISOString();
const isStripeSubscriptionId=(v:string)=>v.startsWith("sub_");
const staleId=(v:string)=>v?`stale_${Date.now()}_${v}`:"";

export function isProStatus(plan:string,status:string){return plan==="pro"&&ACTIVE_STATUSES.has(status)}

function toSummary(row?:SubscriptionRow){
 const isPro=Boolean(row&&isProStatus(row.plan,row.status));
 return{
  plan:(isPro?"pro":"free") as BillingPlan,
  status:row?.status||"inactive",
  billingInterval:(row?.billingInterval||"month") as BillingInterval,
  currentPeriodEnd:row?.currentPeriodEnd||"",
  cancelAtPeriodEnd:Boolean(row?.cancelAtPeriodEnd),
  stripeCustomerId:row?.stripeCustomerId||"",
  isPro,
  catalog:PLAN_CATALOG
 };
}

export async function getBillingSummary(ctx:RequestContext){
 const row=await ctx.db.query.subscriptions.findFirst({where:eq(subscriptions.email,ctx.email)});
 return toSummary(row);
}

export async function syncBillingSummary(ctx:RequestContext){
 const row=await ctx.db.query.subscriptions.findFirst({where:eq(subscriptions.email,ctx.email)});
 if(!row||!isStripeSubscriptionId(row.stripeSubscriptionId))return toSummary(row);

 const {env}=await import("cloudflare:workers");
 const secret=String((env as any).STRIPE_SECRET_KEY||"");
 if(!secret)return toSummary(row);

 let response:Response;
 let payload:any={};
 try{
  response=await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(row.stripeSubscriptionId)}`,{
   headers:{authorization:`Bearer ${secret}`}
  });
  payload=await response.json().catch(()=>({}));
 }catch{
  return toSummary(row);
 }

 if(response.ok){
  const status=String(payload.status||"inactive");
  const patch={
   plan:ACTIVE_STATUSES.has(status)?"pro":"free",
   status,
   billingInterval:String(payload.metadata?.interval||row.billingInterval||"month"),
   stripeCustomerId:String(payload.customer||row.stripeCustomerId||""),
   stripeSubscriptionId:String(payload.id||row.stripeSubscriptionId||""),
   currentPeriodEnd:isoFromUnix(payload.current_period_end),
   cancelAtPeriodEnd:Boolean(payload.cancel_at_period_end),
   updatedAt:now()
  };
  await ctx.db.update(subscriptions).set(patch).where(eq(subscriptions.email,ctx.email));
  return toSummary({...row,...patch});
 }

 const resourceMissing=response.status===404&&payload?.error?.code==="resource_missing";
 if(resourceMissing){
  const patch={
   plan:"free",
   status:"inactive",
   stripeCustomerId:staleId(row.stripeCustomerId),
   stripeSubscriptionId:staleId(row.stripeSubscriptionId),
   currentPeriodEnd:"",
   cancelAtPeriodEnd:false,
   updatedAt:now()
  };
  await ctx.db.update(subscriptions).set(patch).where(eq(subscriptions.email,ctx.email));
  return toSummary({...row,...patch});
 }

 return toSummary(row);
}

export async function requirePro(ctx:RequestContext){
 const billing=await getBillingSummary(ctx);
 if(!billing.isPro)throw new ApiError(402,"この機能はPROプラン（月額980円）で利用できます");
 return billing;
}
