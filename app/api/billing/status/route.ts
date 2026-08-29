import {apiError,requireContext} from "@/lib/request-context";
import {syncBillingSummary} from "@/lib/billing";

export async function GET(req:Request){
 try{
  const ctx=await requireContext(req);
  return Response.json(await syncBillingSummary(ctx));
 }catch(e){return apiError(e)}
}
