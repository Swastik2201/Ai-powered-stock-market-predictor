import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middlewareClient';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/trade/:path*',
    '/clans/:path*',
    '/backtest/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};
