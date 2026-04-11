import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { token } = await params;

  // 1. Fetch share record
  const { data: share, error: shareError } = await supabase
    .from('shares')
    .select('*, products(*)')
    .eq('token', token)
    .single();

  if (shareError || !share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  // 2. Fetch Organization info
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', share.organization_id)
    .single();

  // 3. Return combined data
  return NextResponse.json({
    product: share.products,
    organization: org,
    metadata: {
      created_at: share.created_at,
      expires_at: share.expires_at
    }
  });
}
