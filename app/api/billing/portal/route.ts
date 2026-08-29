import {eq} from "drizzle-orm";
import {subscriptions} from "@/db/schema";
import {syncBillingSummary} from "@/lib/billing";
import {apiError,ApiError,requireContext} from "@/lib/request-context";

async function usableCustomerId(secret:string,id:string){
 if(!id.startsWith("cus_"))return "";
 let response:Response;
 let payload:any={};
 try{
  response=await fetch(`https://api.stripe.com/v1/customers/${encodeURIComponent(id)}`,{
   headers:{authorization:`Bearer ${secret}`}
  });
  payload=await response.json().catch(()=>({}));
 }catch{
  throw new ApiError(502,"Stripeの顧客情報を確認できませんでした");
 }
 if(response.ok&&!payload.deleted)return id;
 if(response.status===404&&payload?.error?.code==="resource_missing")return "";
 throw new ApiError(502,payload?.error?.message||"請求情報を確認できませんでした");
}

export async function POST(req:Request){
 try{
  const ctx=await requireContext(req);
  const {env}=await import("cloudflare:workers");
  const secret=String((env as any).STRIPE_SECRET_KEY||"");
  if(!secret)throw new ApiError(503,"Stripe設定がまだ完了していません");
  if(secret.startsWith("sk_test_"))throw new ApiError(503,"現在テスト用Stripeキーが設定されています。本番用Stripeキーに切り替えてください");

  const billing=await syncBillingSummary(ctx);
  if(!billing.isPro)throw new ApiError(409,"有効なPRO契約がありません。画面を再読み込みしてください");

  const sub=await ctx.db.query.subscriptions.findFirst({where:eq(subscriptions.email,ctx.email)});
  const customerId=await usableCustomerId(secret,sub?.stripeCustomerId||"");
  if(!customerId)throw new ApiError(409,"現在のStripe環境に有効な請求情報がありません。画面を再読み込みしてください");

  const origin=new URL(req.url).origin;
  const form=new URLSearchParams({
   customer:customerId,
   return_url:`${origin}/?billing=portal-return`
  });

  const r=await fetch("https://api.stripe.com/v1/billing_portal/sessions",{
   method:"POST",
   headers:{
    authorization:`Bearer ${secret}`,
    "content-type":"application/x-www-form-urlencoded"
   },
   body:form.toString()
  });

  const j=await r.json() as any;
  if(!r.ok||!j.url)throw new ApiError(502,j?.error?.message||"請求管理画面を開けませんでした");
  return Response.json({url:j.url});
 }catch(e){
  return apiError(e)
 }
}
