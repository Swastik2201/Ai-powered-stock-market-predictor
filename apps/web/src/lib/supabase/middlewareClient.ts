import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh user auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = ['/dashboard', '/trade', '/clans', '/backtest', '/settings'];
  const authRoutes = ['/login', '/signup'];
  const currentPath = request.nextUrl.pathname;

  // Redirect unauthenticated users targeting protected routes to /login
  if (!user && protectedRoutes.some((route) => currentPath.startsWith(route))) {
    // If Supabase environment credentials are mock or not set, allow dev preview
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock')) {
      return response;
    }
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', currentPath);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages to /dashboard
  if (user && authRoutes.some((route) => currentPath.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}
