import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
  // Create a base response that we can mutate cookies on
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(data.user);
  const { pathname } = request.nextUrl;

  const isAppRoute = pathname === "/" || pathname.startsWith("/app");

  if (!isLoggedIn && isAppRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    response = NextResponse.redirect(loginUrl);
    return response;
  }

  if (isLoggedIn && pathname === "/") {
    const appUrl = new URL("/app", request.url);
    response = NextResponse.redirect(appUrl);
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/", "/app/:path*", "/auth/:path*", "/login"],
};


