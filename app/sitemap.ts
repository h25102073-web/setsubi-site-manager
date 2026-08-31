import type {MetadataRoute} from "next";

const siteUrl="https://setsubi-site-manager.h25102073.chatgpt.site";

export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 return[
  {url:siteUrl,lastModified:now,changeFrequency:"daily",priority:1},
  {url:`${siteUrl}/work-assist`,lastModified:now,changeFrequency:"weekly",priority:0.8}
 ];
}
