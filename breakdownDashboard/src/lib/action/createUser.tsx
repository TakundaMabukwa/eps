"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function CreateUser(formData: FormData) {
    const role = formData.get("role") as string;
    const fullName = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    // Validate role
    if (
        role !== "fleet manager" &&
        role !== "customer" &&
        role !== "call centre" &&
        role !== "cost centre"
    ) {
        redirect(`/signup?message=Role not found`);
    }

    const supabase = await createClient();

    // ✅ Get the logged-in user
    const {
        data: { user: currentUser },
        error: currentUserError,
    } = await supabase.auth.getUser();

    if (currentUserError || !currentUser) {
        redirect("/login?message=You need to be logged in");
    }

    // ✅ Fetch the logged-in user's workshop_id from profiles table
    const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("workshop_id")
        .eq("id", currentUser.id)
        .single();

    if (profileError || !currentProfile) {
        console.error("Error fetching current profile:", profileError?.message);
        redirect("/signup?message=Could not find your profile");
    }

    const workshopId = currentProfile.workshop_id;

    // ✅ Create new user in Supabase Auth
    const { data: signUpResult, error: signUpError } = await supabase.auth.signUp({
        email,
        password: phone,
        options: {
            data: {
                name: fullName,
                phone,
                role,
            },
        },
    });

    if (signUpError) {
        redirect("/userManagement?message=" + signUpError.message);
    }

    const newUserId = signUpResult.user?.id;
    if (!newUserId) {
        redirect("/userManagement?message=Failed to create user");
    }

    // ✅ Insert into profiles table and link to the same workshop_id
    const { error: insertError } = await supabase.from("profiles").insert({
        id: newUserId,
        full_name: fullName,
        role,
        phone_number: phone,
        email,
        workshop_id: workshopId, // ✅ Linking with logged-in user's workshop
    });

    if (insertError) {
        console.error("Error inserting profile:", insertError.message);
    }

    console.log("New user created and linked to workshop:", workshopId);
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
  const { error: profileError } = await supabase.from("profiles").insert({
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