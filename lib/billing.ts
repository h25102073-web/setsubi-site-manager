import {eq} from "drizzle-orm";
import {subscriptions} from "@/db/schema";
import type {RequestContext} from "@/lib/request-context";
import {ApiError} from "@/lib/request-context";

export type BillingPlan="free"|"pro";
export type BillingInterval="month"|"year";

export const PLAN_CATALOG={
 free:{id:"free" as const,name:"FREE",monthlyPriceYen:0,yearlyPriceYen:0,features:["基本的な設備情報","基本計算","施工ルールの一部","ToDo基本機能","お気に入り3件まで"]},
 pro:{id:"pro" as const,name:"PRO",monthlyPriceYen:980,yearlyPriceYen:9800,features:["全配管材・継手・パッキン検索","異種管接続検索","吊りピッチ・支持金物の全データ","配管重量・勾配・高さの全計算","区画貫通・施工要領の詳細","お気に入り無制限","施工動画すべて","AI機能の拡張","現場別設定・高度な管理機能"]}
} as const;

const ACTIVE_STATUSES=new Set(["active","trialing","past_due"]);
export function isProStatus(plan:string,status:string){return plan==="pro"&&ACTIVE_STATUSES.has(status)}
export async function getBillingSummary(ctx:RequestContext){
 const row=await ctx.db.query.subscriptions.findFirst({where:eq(subscriptions.email,ctx.email)});
 const isPro=Boolean(row&&isProStatus(row.plan,row.status));
 return{plan:(isPro?"pro":"free") as BillingPlan,status:row?.status||"inactive",billingInterval:(row?.billingInterval||"month") as BillingInterval,currentPeriodEnd:row?.currentPeriodEnd||"",cancelAtPeriodEnd:Boolean(row?.cancelAtPeriodEnd),stripeCustomerId:row?.stripeCustomerId||"",isPro,catalog:PLAN_CATALOG};
}
export async function requirePro(ctx:RequestContext){const billing=await getBillingSummary(ctx);if(!billing.isPro)throw new ApiError(402,"この機能はPROプラン（月額980円）で利用できます");return billing}
