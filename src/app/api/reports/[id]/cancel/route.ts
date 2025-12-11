import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: reportId } = await context.params;
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice('bearer '.length)
    : null;

  if (!token) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createAdminSupabaseClient();
  } catch (error: any) {
    console.error('[reports/cancel] Supabase client init failed:', error?.message ?? error);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const { data: authUser, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authUser?.user) {
    console.error('[reports/cancel] Failed to verify user:', authError?.message ?? 'No user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: report, error: fetchError } = await supabase
    .from('reports')
    .select('id, user_id, status')
    .eq('id', reportId)
    .single();

  if (fetchError) {
    const status = fetchError.code === 'PGRST116' ? 404 : 400;
    return NextResponse.json({ error: fetchError.message }, { status });
  }

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (report.user_id !== authUser.user.id) {
    return NextResponse.json({ error: 'You do not own this report' }, { status: 403 });
  }

  const { data: deleted, error: deleteError } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .select('id');

  if (deleteError) {
    console.error('[reports/cancel] Delete failed:', deleteError.message);
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json({ error: 'Report not found after delete' }, { status: 404 });
  }

  return NextResponse.json({ success: true, deletedId: deleted[0].id });
}
