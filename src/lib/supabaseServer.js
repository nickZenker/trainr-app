import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const supabaseServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          // In Server Components kann cookies().set nicht verwendet werden.
          // Diese set/remove werden von Supabase hauptsächlich im Middleware/Route-Handler Kontext benötigt.
        },
        remove(name, options) {
          // noop (siehe Kommentar oben)
        },
      },
    }
  );
};


