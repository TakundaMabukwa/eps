"use client";

import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Job {
    id: number;
    job_id: string;
    title: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high" | "emergency";
    created_at: string;
    updated_at: string;
    drivers: {
        length: number
        first_name: string | null;
        surname: string | null;
        cell_number: string | null;
        job_allocated: boolean;
    } | null;   // Note: single object or null

    vehiclesc: {
        length: number
        registration_number: string | null;
        make: string | null;
        model: string | null;
    } | null;   // single object or null

    location: string;
    coordinates: { lat: number; lng: number };
    technician_id: number | null;
    technicians?: Technician;
    estimatedCost?: number;
    actualCost?: number;
    clientType: "internal" | "external";
    clientName?: string;
    approvalRequired: boolean;
    approvedBy?: string;
    approvedAt?: string;
    notes: string;
    attachments: string[];
    completed_at: string;
    eta: string;
}

interface Technician {
    id: number,
    name: string;
    surname: string;
    phone: string;
    location: string;
    rating: string;
    specialties: string[],
}

interface Quotation {
    id: string;
    drivername?: string;
    vehiclereg?: string;
    job_type?: string;
    issue?: string;
    parts_needed?: string[]; // just part names
    laborcost?: number;
    partscost?: number; // total parts cost number
    totalcost?: number;
    priority?: string;
    status: "pending" | "approved" | "rejected" | "pending-inspection" | "paid";
    created_at: string;
    description?: string;
    markupPrice?: number; // percentage markup number
    type: "external" | "internal";
    additional_notes: string,
    job_id: Job;
}

interface Part {
    name: string;
    price: number;
}

export default function QuotationDetailPage() {
    const { id } = useParams();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const supabase = createClient();

    // Manage parts as strings (names)
    const [parts, setParts] = useState<Part[]>([]);
    const [newPartName, setNewPartName] = useState("");
    const [newPartPrice, setNewPartPrice] = useState<number | "">(0);
    const [labourCost, setLabourCost] = useState<number>(0);
    const [laborHours, setLaborHours] = useState<number>(0);
    const [laborRate, setLaborRate] = useState<number>(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [workshopRate, setRate] = useState(0);


    // Manage parts total cost input (price side)
    const [partsCost, setPartsCost] = useState<number>(0);
    // Markup percentage
    const [markupPrice, setMarkupPrice] = useState<number>(0);

    const fetchWorkshop = async (workshopId: string | undefined) => {
        if (!workshopId) return null;
        const { data, error } = await supabase
            .from('workshop')
            .select('*')
            .eq('id', workshopId)
            .single();

        if (error) {
            console.error('Failed to load workshop:', error);
            return null;
        }

        if (typeof data?.labour_rate === 'number') {
            setRate(data.labour_rate);
        } else {
            setRate(0);
        }
        return data;
    }

    const fetchQuotation = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("quotations")
            .select(`
            *,
            job_id (
              *,
              drivers (
                first_name,
                surname,
                cell_number
              ),
              vehiclesc (
                registration_number,
                make,
                model
              ),
              technicians:technician_id (*)
            )
          `)
            .eq("id", String(id))
            .single();

        if (error) {
            toast.error("Failed to load quotation");
            console.error(error);
            setLoading(false);
            return;
        }

        // Parse parts from DB format into current state format
        const partsFromDB = (data?.parts_needed || []).map((item: string) => {
            try {
                return JSON.parse(item);
            } catch {
                return { name: item, price: 0 };
            }
        });

        setParts(partsFromDB);

        // Set saved costs from DB
        setPartsCost(data?.partscost || 0);
        setLabourCost(data?.laborcost || 0);
        setMarkupPrice(data?.markupPrice || 0);

        setQuotation(data as unknown as Quotation);
        // fetch workshop separately using technician.workshop_id
        if (data?.job_id && data?.job_id.technicians && data.job_id.technicians.workshop_id) {
            const workshopData = await fetchWorkshop(data.job_id.technicians.workshop_id);
            if (workshopData) {
                setRate(workshopData.labour_rate ?? 0);
                setQuotation((prev) => prev ? { ...prev, job_id: { ...prev.job_id, workshop: workshopData } } : prev);
            }
        }
        setLoading(false);
    };


    // const fetchQuotation = async () => {
    //     const { data, error } = await supabase
    //         .from("quotations")
    //         .select(`
    //                 *,
    //                 job_id (
    //                 *,
    //                 drivers (
    //                     first_name,
    //                     surname,
    //                     cell_number
    //                 ),
    //                 vehiclesc (
    //                     registration_number,
    //                     make,
    //                     model
    //                 )
    //                 )
    //             `)
    //         .eq("id", String(id))
    //         .single();

    //     if (error) {
    //         toast.error("Failed to load quotation");
    //         console.error(error);
    //     } else {
    //         // Convert parts_needed (string[]) to Part[] with price 0 by default
    //         const partsFromDB = (data.parts_needed || []).map((name: string) => ({
    //             name,
    //             price: 0,
    //         }));
    //         setParts(partsFromDB);

    //         setPartsCost(data.partscost || 0);
    //         setMarkupPrice(data.markupPrice || 0);
    //         setQuotation(data as unknown as Quotation);
    //     }
    //     setLoading(false);
    // };


    // Calculate total cost with markup applied
    const calculateTotalCost = () => {
        const baseTotal = labourCost + partsCost;
        return baseTotal + (baseTotal * markupPrice) / 100;
    };
    // Add a new part name
    const addPart = () => {
        if (!newPartName.trim()) {
            toast.error("Part name is required");
            return;
        }
        if (newPartPrice === "" || newPartPrice <= 0) {
            toast.error("Part price must be a positive number");
            return;
        }
        if (parts.find((p) => p.name.toLowerCase() === newPartName.trim().toLowerCase())) {
            toast.error("Part already added");
            return;
        }

        const newParts = [...parts, { name: newPartName.trim(), price: newPartPrice }];
        setParts(newParts);

        // Update parts cost sum
        const totalPartsCost = newParts.reduce((sum, part) => sum + part.price, 0);
        setPartsCost(totalPartsCost);

        setNewPartName("");
        setNewPartPrice(0);
    };


    // Remove part by name
    const removePart = (name: string) => {
        setParts(parts.filter((p) => p.name !== name));
    };

    const updateLabour = async () => {
        if (!quotation) return;
        const totalLabourCost = laborHours * labourCost; // labourCost is already your rate per hour
        setLabourCost(totalLabourCost); // update state with total labour cost
        setModalOpen(false); // close modal
    };

    const updateQuotation = async () => {
        if (!quotation) return;
        setUpdating(true);

        const totalCost = calculateTotalCost();

        const { error } = await supabase
            .from("quotations")
            .update({
                parts_needed: parts.map((p) => JSON.stringify(p)), // parts as JSON strings
                partscost: partsCost,        // current parts cost state
                laborcost: labourCost,       // total labour cost state (hours x rate)          
                markupPrice,
                totalcost: totalCost,
                status: "pending-approval"
            })
            .eq("id", quotation.id);

        if (error) {
            toast.error("Failed to update quotation");
            alert("Failed to update")
            console.error(error);
        } else {
            toast.success("Quotation updated successfully");
            alert("Quotation updated")
            setQuotation((prev) =>
                prev
                    ? {
                        ...prev,
                        parts_needed: parts.map((p) => JSON.stringify(p)),
                        partscost: partsCost,
                        laborcost: labourCost,
                        markupPrice,
                        totalcost: totalCost,
                    }
                    : prev
            );
        }

        setUpdating(false);
    };

    // Modal save function
    const saveLaborCost = () => {
        if (!quotation) return;
        const calculatedLaborCost = laborHours * laborRate; // calculate immediately
        setQuotation({
            ...quotation,
            laborcost: calculatedLaborCost, // update quotation state
        });
        setModalOpen(false); // close modal
    };


    useEffect(() => {
        if (id) fetchQuotation();
    }, [id]);



    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!quotation) return <div className="text-center mt-10">Quotation not found</div>;

    return (
        <div className="w-full h-full p-6 bg-gray-50">
            {/* Back Button */}
            <div className="">
                <Button
                    onClick={() => {
                        redirect("/workshopQoute");
                    }}
                    className="px-4 py-2 text-white bg-black rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300"
                >
                    Back
                </Button>
            </div>

            <div className="max-w-7xl mx-auto pt-16">
                <div className="mb-6">
                    <h1 className="text-4xl font-semibold text-gray-800">Repair {(quotation.id).slice(0, 8)}</h1>
                    <div>
                        <strong>Quote Type: </strong>
                        <Badge variant={quotation.type === "external" ? "secondary" : "default"}>
                            {quotation.type}
                        </Badge>
                    </div>
                </div>

                <Card className="shadow-lg border border-gray-200 rounded-lg">
                    <CardHeader className="bg-gray-50 rounded-t-lg p-4">
                        <CardTitle className="text-xl font-semibold text-gray-800">Quotation Details</CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 space-y-8 text-sm text-gray-700">
                        {/* General Information Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">General Information</h2>
                            <div className="flex gap-2 items-center">
                                <span>
                                    <strong>Status:</strong>
                                </span>
                                <Badge
                                    variant={
                                        quotation.status === "approved"
                                            ? "default"
                                            : quotation.status === "rejected"
                                                ? "destructive"
                                                : quotation.status === "paid"
                                                    ? "default"
                                                    : quotation.status === "pending-inspection"
                                                        ? "destructive"
                                                        : "secondary"
                                    }
                                >
                                    {quotation.status}
                                </Badge>
                            </div>
                            <div>
                                <strong>Driver:</strong> {quotation.job_id.drivers?.first_name}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Technician: {quotation.job_id?.technicians?.name}</p>
                            </div>
                            <div>
                                <strong>Vehicle:</strong> {quotation.job_id.vehiclesc?.registration_number} {quotation.job_id.vehiclesc?.make}
                            </div>
                            <div>
                                <strong>Job Type:</strong> {quotation.job_type}
                            </div>
                            <div>
                                <strong>Priority:</strong> {quotation.priority}
                            </div>
                            <div>
                                <strong>Notes:</strong> {quotation.additional_notes}
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                            <div className="flex flex-row justify-evenly">
                                <div>
                                    <strong>Description:</strong> {quotation.issue}
                                </div>
                                <div>
                                    <strong>Labour</strong> R{workshopRate}
                                </div>
                            </div>


                        </div>

                        {/* Parts Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Parts</h2>

                            {parts.length === 0 && <div>No parts added yet</div>}

                            {parts.length > 0 && (
                                <ul className="list-disc list-inside">
                                    {parts.map((part) => (
                                        <li key={part.name} className="flex justify-between items-center space-x-2 m-4">
                                            <span>{part.name} - R {part.price.toFixed(2)}</span>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removePart(part.name)}
                                                disabled={updating}
                                            >
                                                Remove
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}


                            <div className="flex space-x-2 items-center mt-4">
                                <input
                                    type="text"
                                    placeholder="Part Name"
                                    value={newPartName}
                                    onChange={(e) => setNewPartName(e.target.value)}
                                    className="border p-2 rounded flex-grow"
                                />

                                <input
                                    type="number"
                                    placeholder="Price"
                                    min={0}
                                    step={0.01}
                                    value={newPartPrice}
                                    onChange={(e) => setNewPartPrice(parseFloat(e.target.value) || 0)}
                                    className="border p-2 rounded w-28"
                                />
                                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                        >
                                            Create
                                        </Button>
                                    </DialogTrigger>


                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create/Update labour total</DialogTitle>
                                            <DialogDescription>Create a detailed quotation for repair work.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Label>Labour Hours</Label>
                                            <Input type="number" value={laborHours} onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)} />
                                            <Label>Labour Rate</Label>
                                            <Input type="number" value={workshopRate} />

                                            <Button className="mr-4" onClick={updateLabour}>Save Labor Cost</Button>
                                            <DialogClose asChild>
                                                <Button>Cancel</Button>
                                            </DialogClose>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                            </div>
                            <Button onClick={addPart} disabled={updating}>
                                {loading ? "Adding..." : "Add Parts"}
                            </Button>
                            {/* remove markup for workshop */}
                            {/* add total labour and parts and breakdown cost(a technician driving to the vehicles) and tow cost if towing and km towed */}

                            <div className="mt-4 flex items-center space-x-4">
                                <label htmlFor="partsCost" className="font-semibold">
                                    Total Labour Cost (R):
                                </label>
                                <input
                                    type="number"
                                    id="partsCost"
                                    min={0}
                                    step={0.01}
                                    value={quotation.laborcost}
                                    onChange={(e) => setQuotation({
                                        ...quotation,
                                        laborcost: parseFloat(e.target.value) || 0
                                    })}
                                    className="border rounded p-2 w-40"
                                    disabled={updating}
                                />
                            </div>

                            <div className="mt-4 flex items-center space-x-4">
                                <label htmlFor="partsCost" className="font-semibold">
                                    Total Parts Cost (R):
                                </label>
                                <input
                                    type="number"
                                    id="partsCost"
                                    min={0}
                                    step={0.01}
                                    value={partsCost}
                                    onChange={(e) => setPartsCost(parseFloat(e.target.value) || 0)}
                                    className="border rounded p-2 w-40"
                                    disabled={updating}
                                />
                            </div>

                            <div className="mt-4 flex items-center space-x-4">
                                {/* <label htmlFor="markupPrice" className="font-semibold">
                                    Markup (%):
                                </label> */}
                                <input
                                    type="number"
                                    id="markupPrice"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    value={markupPrice}
                                    onChange={(e) => setMarkupPrice(parseFloat(e.target.value) || 0)}
                                    className="border rounded p-2 w-24"
                                    disabled={updating}
                                    hidden
                                />
                            </div>
                        </div>

                        {/* Cost Breakdown Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Cost Breakdown</h2>
                            <div>
                                <strong>Labor Cost:</strong> R {labourCost}
                            </div>
                            <div><strong>Parts Cost: </strong> R{partsCost.toFixed(2)}</div>
                            <div><strong>Total Cost: </strong> R{calculateTotalCost().toFixed(2)}</div>

                        </div>

                        {/* Created At Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Created At</h2>
                            <div>
                                <strong>Created At:</strong> {new Date(quotation.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button onClick={updateQuotation} disabled={updating}>
                                {updating ? "Saving..." : "Submit Changes"}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => fetchQuotation()}
                                disabled={updating}
                            >
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
