"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Vehicle {
    id: number;
    registration_number: string;
    engine_number: string | null;
    vin_number: string | null;
    make: string | null;
    model: string;
    sub_model: string | null;
    manufactured_year: string;
    vehicle_type: string;
    registration_date: string | null;
    license_expiry_date: string | null;
    purchase_price: number | null;
    retail_price: number | null;
    vehicle_priority: string | null;
    fuel_type: string | null;
    transmission_type: string | null;
    tank_capacity: number | null;
    register_number: string | null;
    take_on_kilometers: number;
    service_intervals: string;
    boarding_km_hours: number | null;
    expected_boarding_date: string | null;
    cost_centres: string | null;
    colour: string;
    created_at: string;
    updated_at: string;
    inspected: boolean | null;
    type: string | null;
    workshop_id: string | null;
}

export default function VehicleDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    /** Fetch vehicle details */
    const fetchVehicle = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("vehiclesc")
            .select("*")
            .eq("id", Number(params.id))
            .single();

        if (error) {
            console.error(error);
            toast.error("Error loading vehicle details");
        } else {
            setVehicle(data as Vehicle);
        }
        setLoading(false);
    }, [params.id, supabase]);

    useEffect(() => {
        if (params?.id) fetchVehicle();
    }, [params.id, fetchVehicle]);

    /** Soft delete vehicle */
    const handleDelete = async () => {
        if (!vehicle) return;
        setDeleting(true);

        const { error } = await supabase
            .from("vehiclesc").delete().eq("id", vehicle.id);

        setDeleting(false);

        if (error) {
            console.error("Error deleting vehicle:", error);
            toast.error("Failed to delete vehicle");
        } else {
            toast.success("Vehicle archived successfully");
            router.push("/vehicles");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Skeleton className="w-96 h-96 rounded-xl" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <p className="text-lg font-semibold text-gray-600">
                    Vehicle not found or has been archived.
                </p>
                <Button onClick={() => router.push("/vehicles")} className="mt-4">
                    Back to Vehicles
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gray-50 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold">
                        {vehicle.make} {vehicle.model}
                    </h1>
                    <div className="ml-auto">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    disabled={deleting}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {deleting ? "Deleting..." : "Delete Vehicle"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will <strong>archive</strong> the vehicle. It
                                        won’t appear in lists anymore but will remain in the
                                        database for record keeping. You can restore it later if
                                        needed.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {deleting ? "Deleting..." : "Confirm"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Vehicle Info Card */}
                <Card className="p-6 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                            Vehicle Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Image & Basic Info */}
                        <motion.div
                            className="flex flex-col md:flex-row gap-6"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Image Placeholder */}
                            <div className="w-full md:w-1/3 flex items-center justify-center bg-gray-200 rounded-xl h-64">
                                <span className="text-gray-500">Vehicle Image</span>
                            </div>

                            {/* Key Info */}
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <Detail
                                    label="Registration Number"
                                    value={vehicle.registration_number}
                                />
                                <Detail label="VIN" value={vehicle.vin_number ?? "N/A"} />
                                <Detail
                                    label="Engine Number"
                                    value={vehicle.engine_number ?? "N/A"}
                                />
                                <Detail label="Colour" value={vehicle.colour} />
                            </div>
                        </motion.div>

                        <Separator />

                        {/* Detailed Info */}
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Detail label="Manufactured Year" value={vehicle.manufactured_year} />
                            <Detail label="Vehicle Type" value={vehicle.vehicle_type} />
                            <Detail label="Fuel Type" value={vehicle.fuel_type} />
                            <Detail label="Transmission" value={vehicle.transmission_type} />
                            <Detail label="Service Intervals" value={vehicle.service_intervals} />
                            <Detail
                                label="Priority"
                                value={<Badge>{vehicle.vehicle_priority}</Badge>}
                            />
                            <Detail
                                label="Purchase Price"
                                value={`R ${vehicle.purchase_price ?? "N/A"}`}
                            />
                            <Detail
                                label="Retail Price"
                                value={`R ${vehicle.retail_price ?? "N/A"}`}
                            />
                            <Detail
                                label="Tank Capacity"
                                value={`${vehicle.tank_capacity ?? "N/A"} L`}
                            />
                            <Detail
                                label="Take On KM"
                                value={`${vehicle.take_on_kilometers}`}
                            />
                            <Detail
                                label="Boarding Hours"
                                value={vehicle.boarding_km_hours ?? "N/A"}
                            />
                            <Detail
                                label="Cost Centres"
                                value={vehicle.cost_centres ?? "N/A"}
                            />
                        </motion.div>

                        <Separator />

                        {/* Dates */}
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Detail
                                label="Registration Date"
                                value={vehicle.registration_date ?? "N/A"}
                            />
                            <Detail
                                label="License Expiry"
                                value={vehicle.license_expiry_date ?? "N/A"}
                            />
                            <Detail
                                label="Expected Boarding Date"
                                value={vehicle.expected_boarding_date ?? "N/A"}
                            />
                        </motion.div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-gray-500 text-sm">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    );
}
