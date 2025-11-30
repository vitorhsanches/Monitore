import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminSetupResponse {
  success: boolean;
  message: string;
  userExists?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const projectUrl = Deno.env.get('PROJECT_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE') ?? '';

    if (!projectUrl || !serviceRoleKey) {
      console.error('Missing PROJECT_URL or SERVICE_ROLE environment variables');
      throw new Error('Missing PROJECT_URL or SERVICE_ROLE environment variables');
    }

    const supabaseAdmin = createClient(projectUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const adminEmail = 'admin.monitore@monitore.com';
    const adminPassword = 'Monitore10';

    // Check if admin user already exists
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }

    const existingAdmin = existingUsers.users.find(
      (user) => user.email === adminEmail
    );

    if (existingAdmin) {
      console.log('Admin user already exists');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin user already exists',
          userExists: true,
        } as AdminSetupResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin user
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Administrador Monitore',
        },
      });

    if (createError) {
      console.error('Error creating admin user:', createError);
      throw createError;
    }

    console.log('Admin user created successfully:', newUser.user.id);

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'admin',
      });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      throw roleError;
    }

    console.log('Admin role assigned successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        userExists: false,
      } as AdminSetupResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in setup-admin function:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to setup admin user';

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
      } as AdminSetupResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
