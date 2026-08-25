import {eq} from "drizzle-orm";
import {subscriptions} from "@/db/schema";
import {apiError,ApiError,requireContext} from "@/lib/request-context";

export async function POST(req:Request){
 try{
  const ctx=await requireContext(req);
  const {env}=await import("cloudflare:workers");
  const secret=String((env as any).STRIPE_SECRET_KEY||"");
  if(!secret)throw new ApiError(503,"Stripe設定がまだ完了していません");
  const sub=await ctx.db.query.subscriptions.findFirst({where:eq(subscriptions.email,ctx.email)});
  if(!sub?.stripeCustomerId)throw new ApiError(404,"請求情報がまだありません");

  const origin=new URL(req.url).origin;
  const form=new URLSearchParams({customer:sub.stripeCustomerId,return_url:`${origin}/?billing=portal-return`});
  const r=await fetch("https://api.stripe.com/v1/billing_portal/sessions",{
   method:"POST",
   headers:{authorization:`Bearer ${secret}`,"content-type":"application/x-www-form-urlencoded"},
   body:form.toString()
  });
  const j=await r.json() as any;
  if(!r.ok||!j.url)throw new ApiError(502,j?.error?.message||"請求管理画面を開けませんでした");
  return Response.json({url:j.url});
 }catch(e){return apiError(e)}
}
