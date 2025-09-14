"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Breakdown {
    id: number;
    order_no: string | null;
    status: string | null;
    emergency_type: string | null;
    location: string | null;
    issue_description: string | null;
    image_urls: string | null;
    created_at: string;
    driver_name: string | null;
    phone: string | null;
    registration: string | null;
    make: string | null;
    model: string | null;
    year: number | null;
    vin: string | null;
    owner_name: string | null;
    owner_phone: string | null;
    owner_email: string | null;
    driver_phone: string | null;
    insurance_provider: string | null;
    policy_number: string | null;
    coverage_type: string | null;
    breakdown_location: string | null;
    coordinates: any;
    reported_at: string | null;
    client_type: string | null;
    breakdown_type: string | null;
    tow_capacity: number | null;
    tow_weight: number | null;
    engine_number: string | null;
    registration_date: string | null;
    license_expiry_date: string | null;
    fuel_type: string | null;
    colour: string | null;
    transmission_type: string | null;
    sub_model: string | null;
    inspected: boolean | null;
    service_history: any;
}

export default function BreakdownDetailsPage() {
    const params = useParams();
    const supabase = createClient();
    const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBreakdown = async () => {
            const { data, error } = await supabase
                .from("breakdowns")
                .select("*")
                .eq("id", Number(params.id))
                .single();

            if (error) {
                console.error(error);
            } else {
                setBreakdown(data as any);
            }
            setLoading(false);
        };

        if (params.id) fetchBreakdown();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Skeleton className="w-96 h-96 rounded-xl" />
            </div>
        );
    }

    if (!breakdown) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-lg font-semibold text-gray-600">Breakdown not found</p>
            </div>
        );
    }

    const images = breakdown.image_urls ? breakdown.image_urls.split(",") : [];

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
                    <Button variant="outline" onClick={() => history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold">Breakdown #{breakdown.order_no}</h1>
                    <Badge>{breakdown.status}</Badge>
                </div>

                {/* Main Card */}
                <Card className="p-6 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Breakdown Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Image Gallery */}
                        {images.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto">
                                {images.map((img, idx) => (
                                    <img key={idx} src={img} alt="Breakdown" className="w-48 h-32 object-cover rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="w-full flex items-center justify-center bg-gray-200 rounded-xl h-48">
                                <span className="text-gray-500">No Images Available</span>
                            </div>
                        )}

                        <Separator />

                        {/* Breakdown Info */}
                        <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Detail label="Emergency Type" value={breakdown.emergency_type} />
                            <Detail label="Location" value={breakdown.breakdown_location ?? breakdown.location} />
                            <Detail label="Reported At" value={breakdown.reported_at ?? "N/A"} />
                            <Detail label="Issue Description" value={breakdown.issue_description} />
                            <Detail label="Client Type" value={breakdown.client_type} />
                            <Detail label="Breakdown Type" value={breakdown.breakdown_type} />
                        </motion.div>

                        <Separator />

                        {/* Vehicle Details */}
                        <Accordion type="single" collapsible>
                            <AccordionItem value="vehicle">
                                <AccordionTrigger>Vehicle Details</AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <Detail label="Registration" value={breakdown.registration} />
                                        <Detail label="Make" value={breakdown.make} />
                                        <Detail label="Model" value={breakdown.model} />
                                        <Detail label="Sub Model" value={breakdown.sub_model} />
                                        <Detail label="Year" value={breakdown.year?.toString()} />
                                        <Detail label="VIN" value={breakdown.vin} />
                                        <Detail label="Engine Number" value={breakdown.engine_number} />
                                        <Detail label="Fuel Type" value={breakdown.fuel_type} />
                                        <Detail label="Transmission" value={breakdown.transmission_type} />
                                        <Detail label="Colour" value={breakdown.colour} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="insurance">
                                <AccordionTrigger>Insurance Details</AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <Detail label="Provider" value={breakdown.insurance_provider} />
                                        <Detail label="Policy Number" value={breakdown.policy_number} />
                                        <Detail label="Coverage" value={breakdown.coverage_type} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="driver-owner">
                                <AccordionTrigger>Driver & Owner Info</AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <Detail label="Driver Name" value={breakdown.driver_name} />
                                        <Detail label="Driver Phone" value={breakdown.driver_phone} />
                                        <Detail label="Owner Name" value={breakdown.owner_name} />
                                        <Detail label="Owner Phone" value={breakdown.owner_phone} />
                                        <Detail label="Owner Email" value={breakdown.owner_email} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="service">
                                <AccordionTrigger>Service History</AccordionTrigger>
                                <AccordionContent>
                                    <pre className="text-xs bg-gray-100 p-2 rounded">
                                        {JSON.stringify(breakdown.service_history, null, 2)}
                                    </pre>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
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
            <p className="font-semibold">{value ?? "N/A"}</p>
        </div>
    );
}
