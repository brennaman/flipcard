import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { upsertProfile, claimPendingEmailShares, acceptInviteByToken } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      const { user } = session;

      // Upsert profile so email is searchable for share-by-email
      if (user.email) {
        await upsertProfile(user.id, user.email);
        // Claim any pending email-based shares
        await claimPendingEmailShares(user.id, user.email);
      }

      // If the next URL contains a ?token= param, accept that invite
      const nextUrl = new URL(next.startsWith('/') ? `${origin}${next}` : next);
      const inviteToken = nextUrl.searchParams.get('token');
      if (inviteToken) {
        await acceptInviteByToken(inviteToken, user.id);
        nextUrl.searchParams.delete('token');
      }

      return NextResponse.redirect(nextUrl.toString());
    }
  }

  return NextResponse.redirect(origin);
}
