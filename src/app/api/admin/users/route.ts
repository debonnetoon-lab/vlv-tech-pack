/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "toon@vivelevelo.be";

/** Helper: verify the request is coming from the admin */
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

/** GET /api/admin/users — list all users with their profiles */
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    // Fetch auth users + profiles in parallel
    const [{ data: authData, error: authErr }, { data: profiles, error: profileErr }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from("profiles").select("id, full_name, role"),
    ]);

    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const users = (authData?.users ?? []).map((u) => {
      const profile = profileMap.get(u.id) as any;
      return {
        id: u.id,
        email: u.email ?? "",
        full_name: profile?.full_name ?? u.user_metadata?.full_name ?? "",
        role: profile?.role ?? "input",
        created_at: u.created_at,
      };
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** POST /api/admin/users — create a new user */
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Alleen de beheerder kan gebruikers aanmaken." }, { status: 403 });

  try {
    const { email, full_name, role, password } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, wachtwoord en rol zijn verplicht." }, { status: 400 });
    }

    // Create user
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) return NextResponse.json({ error: createError.message }, { status: 400 });

    // Update profile (created by DB trigger)
    await supabaseAdmin
      .from("profiles")
      .update({ role, full_name })
      .eq("id", data.user.id);

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Interne serverfout" }, { status: 500 });
  }
}

/** PATCH /api/admin/users — reset a user's password */
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { user_id, password } = await req.json();

    if (!user_id || !password) {
      return NextResponse.json({ error: "user_id en password zijn verplicht." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Wachtwoord moet minstens 6 tekens zijn." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Interne serverfout" }, { status: 500 });
  }
}
