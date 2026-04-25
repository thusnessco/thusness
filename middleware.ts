import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export async function middleware(request: NextRequest) {
  const cfg = getSupabasePublicConfig();
  let response = NextResponse.next({ request });

  if (cfg) {
    const supabase = createServerClient(cfg.url, cfg.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isAdmin = path === "/admin" || path.startsWith("/admin/");
    const isAdminLogin = path.startsWith("/admin/login");

    if (isAdmin && !isAdminLogin && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon-32.png|apple-touch-icon.png|safari-pinned-tab.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
