"use server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { sendWelcomeEmail, generateTempPassword } from "@/lib/services/emailService";

export async function CreateUser(formData: FormData) {
    const role = formData.get("role") as string;
    const email = formData.get("email") as string;
    
    // Validate role
    if (
        role !== "admin" &&
        role !== "fleet manager" &&
        role !== "fc" &&
        role !== "customer"
    ) {
        redirect(`/userManagement?message=Invalid role`);
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create Supabase client with service role
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // Create user using service role
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            role,
        },
    });

    if (createError) {
        console.error("Error creating user:", createError.message);
        redirect(`/userManagement?message=${encodeURIComponent(createError.message)}`);
    }

    const userId = newUser.user?.id;
    if (!userId) {
        redirect("/userManagement?message=No+user+ID+returned");
    }

    // Get permissions from form data or use default
    const permissionsData = formData.get("permissions") as string;
    let permissions = permissionsData ? JSON.parse(permissionsData) : null;
    
    // Special case: admin@eps.com gets all permissions
    if (email === "admin@eps.com") {
        permissions = [
            { page: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'fleetJobs', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'loadPlan', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'fuel', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'drivers', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'vehicles', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'costCenters', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'financials', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'inspections', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'userManagement', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'systemSettings', actions: ['view', 'create', 'edit', 'delete'] }
        ];
    }

    // Insert into users table
    const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email,
        role,
        created_at: new Date().toISOString(),
        tech_admin: false,
        first_login: true,
        permissions: permissions,
        energyrite: false,
        cost_code: "",
        company: "EPS Courier Services"
    });

    if (insertError) {
        console.error("Error inserting user profile:", insertError.message);
        redirect(`/userManagement?message=Failed+to+create+user+profile`);
    }

    // Send welcome email
    const emailResult = await sendWelcomeEmail({
        email,
        password: tempPassword,
        role,
        company: "EPS Courier Services",
        cost_code: "",
        site_id: ""
    });

    if (emailResult.success) {
        console.log("✅ User created successfully");
        if (emailResult.message?.includes('skipped')) {
            redirect("/userManagement?message=User+created+successfully+(email+not+configured)");
        } else {
            redirect("/userManagement?message=User+created+successfully+and+welcome+email+sent");
        }
    } else {
        console.log("⚠️ User created but email failed:", emailResult.error);
        redirect("/userManagement?message=User+created+successfully+(email+failed)");
    }
}




export async function createWorkshopWithAdmin(formData: FormData) {
  const supabase = await createClient();

  const workshopName = formData.get("workshopName") as string;
  const location = formData.get("location") as string;

  const adminFirstName = formData.get("adminFirstName") as string;
  const adminLastName = formData.get("adminLastName") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminPhone = formData.get("adminPhone") as string;

  // ✅ 1. Insert workshop
  const { data: workshop, error: workshopError } = await supabase
    .from("workshop")
    .insert([
      {
        work_name: workshopName,
        location: location,
      }
    ])
    .select()
    .single();

  if (workshopError || !workshop) {
    console.error("Error creating workshop:", workshopError?.message);
    redirect("/register?message=Failed to create workshop");
  }

  // ✅ 2. Create admin user using service role
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPhone, // Using phone as password
    email_confirm: true,
    user_metadata: {
      firstName: adminFirstName,
      lastName: adminLastName,
      phone: adminPhone,
      role: "customer", // default role
    },
  });

  if (createError) {
    console.error("Error creating admin user:", createError.message);
    redirect("/register?message=Failed to create admin user");
  }

  const userId = newUser.user?.id;
  if (!userId) {
    redirect("/register?message=No user ID returned");
  }

  // ✅ 3. Insert into profiles linked to workshop
  const { error: profileError } = await supabase.from("users").insert({
    id: userId,
    full_name: `${adminFirstName} ${adminLastName}`,
    phone_number: adminPhone,
    email: adminEmail,
    role: "customer",
    workshop_id: workshop.id, // ✅ Link to workshop
  });

  if (profileError) {
    console.error("Error inserting profile:", profileError.message);
    redirect("/register?message=Failed to create profile");
  }

  console.log("Workshop created:", workshop.id, "Admin user:", userId);

  redirect(`/register/workshop/fileUpload?workshopId=${workshop.id}`);
}