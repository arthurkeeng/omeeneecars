import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = () => {
  const cookieStore = cookies(); // Correct way to get cookies instance

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
               cookieStore.set(name, value, options as CookieOptions); // Ensure type safety
            });
          } catch (error) {
            console.error("Error setting cookies in setAll:", error);
          }
        },
      },
    }
  );
};
