import {eq} from "drizzle-orm";
import {subscriptions} from "@/db/schema";
import {syncBillingSummary} from "@/lib/billing";
import {apiError,ApiError,requireContext} from "@/lib/request-context";

function stripeError(j:any){return j?.error?.message||"Stripe決済を開始できませんでした"}

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
 throw new ApiError(502,stripeError(payload));
}

export async function POST(req:Request){
 try{
  const ctx=await requireContext(req);
  const body=await req.json().catch(()=>({})) as {interval?:string};
  const interval=body.interval==="year"?"year":"month";
  const {env}=await import("cloudflare:workers");
  const secret=String((env as any).STRIPE_SECRET_KEY||"");
  const monthlyPrice=String((env as any).STRIPE_PRO_MONTHLY_PRICE_ID||"");
  const yearlyPrice=String((env as any).STRIPE_PRO_YEARLY_PRICE_ID||"");
  const priceId=interval==="year"?yearlyPrice:monthlyPrice;
  if(!secret||!priceId)throw new ApiError(503,"Stripe設定がまだ完了していません");
  if(secret.startsWith("sk_test_"))throw new ApiError(503,"現在テスト用Stripeキーが設定されています。本番用Stripeキーに切り替えてください");

  const billing=await syncBillingSummary(ctx);
  if(billing.isPro)throw new ApiError(409,"すでにPROプランをご利用中です");

  const existing=await ctx.db.query.subscriptions.findFirst({where:eq(subscriptions.email,ctx.email)});
  const customerId=await usableCustomerId(secret,existing?.stripeCustomerId||"");
  const origin=new URL(req.url).origin;
  const form=new URLSearchParams();
  form.set("mode","subscription");
  form.set("line_items[0][price]",priceId);
  form.set("line_items[0][quantity]","1");
  form.set("client_reference_id",ctx.email);
  form.set("success_url",`${origin}/?billing=success`);
  form.set("cancel_url",`${origin}/?billing=cancelled`);
  form.set("allow_promotion_codes","true");
  form.set("metadata[email]",ctx.email);
  form.set("metadata[interval]",interval);
  form.set("subscription_data[metadata][email]",ctx.email);
  form.set("subscription_data[metadata][interval]",interval);
  if(customerId)form.set("customer",customerId);
  else form.set("customer_email",ctx.email);

  const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{
   method:"POST",
   headers:{authorization:`Bearer ${secret}`,"content-type":"application/x-www-form-urlencoded"},
   body:form.toString()
  });
  const j=await r.json() as any;
  if(!r.ok||!j.url)throw new ApiError(502,stripeError(j));
  return Response.json({url:j.url});
 }catch(e){return apiError(e)}
}
