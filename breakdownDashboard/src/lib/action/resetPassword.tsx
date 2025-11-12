"use server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { sendWelcomeEmail, generateTempPassword, sendWelcomeSMS } from "@/lib/services/emailService";

export async function resetUserPassword(userId: string, email: string) {
    const newPassword = generateTempPassword(8);

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

    // Get user's phone number
    const { data: userData } = await supabase
        .from('users')
        .select('phone')
        .eq('id', userId)
        .single();

    // Update user password
    const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
    });

    if (error) {
        return { success: false, error: error.message };
    }

    // Send email with new password
    const emailResult = await sendWelcomeEmail({
        email,
        phone: userData?.phone,
        password: newPassword,
        role: "User",
        company: "EPS Courier Services"
    });

    return { 
        success: true, 
        emailSent: emailResult.success,
        smsSent: emailResult.smsResult?.success || false
    };
}