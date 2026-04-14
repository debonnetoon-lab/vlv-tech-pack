/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "toon@vivelevelo.be";

/** Helper: verify the request is coming from the global admin */
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

/** GET /api/admin/organizations — list all organizations with their owners */
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    // Fetch all organizations
    const { data: orgs, error: orgErr } = await supabaseAdmin
      .from("organizations")
      .select(`
        *,
        members:organization_members(
          user_id,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 });

    // For each org, we might want to know the owner's email
    // This is a bit complex in Supabase without a direct join to auth.users
    // So we'll return the raw data and let the frontend handle basic display
    // or fetch additional profiles if needed.
    
    return NextResponse.json({ organizations: orgs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** PATCH /api/admin/organizations — update organization status */
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, organization: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
  }
}
