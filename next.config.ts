import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental : {
    serverComponentsHmrCache : false
  },
  images :{
  remotePatterns : [{
    protocol : "https",
    hostname :"jimiwhwevswprehymuqb.supabase.co"
  }]
  },
  /* config options here */
  async headers(){
    return [{
      source : "/embed" , 
      headers : [
       { key : "Content-Security-Policy" , 
        value : "frame-src 'self' https://waitlist-378.created.app"
      }]
    }]
  }
};

export default nextConfig;
