import { supabase } from "../supabase";

export async function addPictureToJobWithMultiplePictures({
    Jobassignment,
    pictures,
}: {
    Jobassignment: { id: number };
    pictures: string[];
}) {
    const { data: authUser } = await supabase.auth.getUser();
    const user_id = authUser?.user?.id;
    if (!user_id) {
        console.error("User ID not found");
        return { success: false, error: "User not authenticated" };
    }
    const { data, error } = await supabase
        .from("job_assignments")
        .update({
            result_images: pictures,
            updated_by: user_id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", Jobassignment.id)
        .select("*");

    if (error) {
        console.error("Error updating job assignment pictures:", error);
        return { success: false, error: error.message };
    }

    console.log("Job assignment pictures updated successfully:", data);
    return { success: true, data };
}



export async function getVehicleByRegistrationNumber(registrationNumber: string) {
    if (!registrationNumber) {
        console.error("Registration number is required");
        return null;

    }
    const { data, error } = await supabase
        .from('vehiclesc')
        .select()
        .eq("registration_number", registrationNumber)
        .single();


    if (error) {
        console.error("Error fetching vehicle by registration number:", error);
        return null;
    }
    return data;
}