/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

const GLOBAL_ADMIN_EMAIL = "toon@vivelevelo.be";

/** 
 * Helper: verify authority. 
 * Returns { user, isGlobalAdmin, orgId, role } 
 */
async function verifyAuthority(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const isGlobalAdmin = user.email === GLOBAL_ADMIN_EMAIL;

  // If not global admin, we need to know their role in THEIR org
  let orgId = null;
  let role = null;

  if (!isGlobalAdmin) {
    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();
    
    if (!member || !['owner', 'admin'].includes(member.role)) return null;
    orgId = member.organization_id;
    role = member.role;
  }

  return { user, isGlobalAdmin, orgId, role };
}

/** GET /api/admin/users — list users for authorized person */
export async function GET(req: NextRequest) {
  const auth = await verifyAuthority(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    let query = supabaseAdmin.from("profiles").select("id, full_name, role");
    
    // If not global admin, only show users from the same organization
    if (!auth.isGlobalAdmin) {
      const { data: memberIds } = await supabaseAdmin
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", auth.orgId);
      
      const ids = (memberIds ?? []).map(m => m.user_id);
      query = query.in("id", ids);
    }

    const { data: profiles, error: profileErr } = await query;
    if (profileErr) throw profileErr;

    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    if (authErr) throw authErr;

    const authMap = new Map((authData?.users ?? []).map(u => [u.id, u]));

    const users = (profiles ?? []).map((p: any) => {
      const u = authMap.get(p.id);
      return {
        id: p.id,
        email: u?.email ?? "",
        full_name: p.full_name,
        role: p.role,
        created_at: u?.created_at,
      };
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** POST /api/admin/users — create a new user in the organization */
export async function POST(req: NextRequest) {
  const auth = await verifyAuthority(req);
  if (!auth) return NextResponse.json({ error: "Onvoldoende rechten." }, { status: 403 });

  try {
    const { email, full_name, role, password } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Ontbrekende velden." }, { status: 400 });
    }

    // Role Hierarchy check
    if (!auth.isGlobalAdmin && role === 'owner') {
      return NextResponse.json({ error: "Alleen de systeembeheerder kan eigenaren aanmaken." }, { status: 403 });
    }

    // Create user
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) return NextResponse.json({ error: createError.message }, { status: 400 });

    const newUserId = data.user.id;

    // Update profile & add to organization
    await Promise.all([
      supabaseAdmin.from("profiles").update({ role, full_name }).eq("id", newUserId),
      auth.isGlobalAdmin ? Promise.resolve() : supabaseAdmin.from("organization_members").insert({
        organization_id: auth.orgId,
        user_id: newUserId,
        role: role === 'admin' ? 'admin' : 'input' // map frontend roles to DB roles
      })
    ]);

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** PATCH /api/admin/users — partial update (password/role) */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAuthority(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { user_id, password, role, full_name } = await req.json();

    if (!user_id) return NextResponse.json({ error: "user_id is verplicht." }, { status: 400 });

    // Authorization check: same org?
    if (!auth.isGlobalAdmin) {
      const { data: isMember } = await supabaseAdmin
        .from("organization_members")
        .select("role")
        .eq("organization_id", auth.orgId)
        .eq("user_id", user_id)
        .single();
      
      if (!isMember) return NextResponse.json({ error: "Gebruiker niet gevonden in uw organisatie." }, { status: 403 });
      
      // Admin cannot change Owner's data
      if (auth.role === 'admin' && isMember.role === 'owner') {
        return NextResponse.json({ error: "U kunt de eigenaar niet wijzigen." }, { status: 403 });
      }
    }

    const updates: any = {};
    if (password) {
      if (password.length < 6) return NextResponse.json({ error: "Wachtwoord te kort." }, { status: 400 });
      await supabaseAdmin.auth.admin.updateUserById(user_id, { password });
    }

    const profileUpdates: any = {};
    if (role) profileUpdates.role = role;
    if (full_name) profileUpdates.full_name = full_name;

    if (Object.keys(profileUpdates).length > 0) {
      await supabaseAdmin.from("profiles").update(profileUpdates).eq("id", user_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** DELETE /api/admin/users — remove user from organization / system */
export async function DELETE(req: NextRequest) {
  const auth = await verifyAuthority(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ error: "user_id is verplicht." }, { status: 400 });

    // Safeguard: Cannot delete self
    if (user_id === auth.user.id) {
      return NextResponse.json({ error: "U kunt uzelf niet verwijderen." }, { status: 400 });
    }

    // Hierarchy Check
    if (!auth.isGlobalAdmin) {
      const { data: target } = await supabaseAdmin
        .from("organization_members")
        .select("role")
        .eq("organization_id", auth.orgId)
        .eq("user_id", user_id)
        .single();
      
      if (!target) return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });

      // Admin cannot delete Owner
      if (auth.role === 'admin' && target.role === 'owner') {
        return NextResponse.json({ error: "Beheerders kunnen de eigenaar niet verwijderen." }, { status: 403 });
      }
    }

    // Perform deletion
    // The DB trigger `trg_check_member_deletion` will also enforce safeguards at the DB level.
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (delError) throw delError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

