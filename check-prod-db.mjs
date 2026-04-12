import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking DB state...");
    
    // 1. Get all users
    const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
    if (userErr) { console.error(userErr); return; }
    
    console.log(`Found ${users.users.length} users.`);
    for (const user of users.users) {
        console.log(`\nUser: ${user.email} (ID: ${user.id})`);
        
        // 2. Check their organization_members
        const { data: mems } = await supabase.from('organization_members').select('*').eq('user_id', user.id);
        console.log(`  Memberships: ${mems?.length || 0}`);
        
        for (const mem of mems || []) {
            console.log(`    Org ID: ${mem.organization_id} (Role: ${mem.role})`);
            
            // Check organization exists
            const { data: org, error: orgErr } = await supabase.from('organizations').select('*').eq('id', mem.organization_id).single();
            if (orgErr) {
                console.log(`    ⚠️ Organization lookup failed:`, orgErr.message);
            } else {
                console.log(`    ✅ Organization exists: ${org.name}`);
            }
        }
    }

    // Also let's check collections
    const { data: collections } = await supabase.from('collections').select('id, name, organization_id, created_by');
    console.log(`\nFound ${collections?.length} collections.`);
    for (const c of collections || []) {
        console.log(`  - ${c.name} (Org: ${c.organization_id})`);
    }
}

check();
