import { supabase } from "@/app/utils/supabase"; // your supabase client

async function forgotPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "myapp://reset-password", // deep link or app URL
    });

    if (error) {
        console.error("Error sending reset email:", error.message);
    } else {
        console.log("Reset email sent:", data);
    }
}


async function updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        console.error("Error updating password:", error.message);
    } else {
        console.log("Password updated successfully:", data);
    }
}
