
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies(); 


  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
         getAll() {
          console.log(cookieStore.getAll() )
          return cookieStore.getAll(); 
        },
        setAll(cookiesToSet) {
          try {
            console.log('getting cookies' )
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            console.error("Error setting cookies in setAll:", error);
          }
        },
      },
    }
  );
};
