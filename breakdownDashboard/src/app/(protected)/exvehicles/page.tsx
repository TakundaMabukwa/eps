"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Truck, Car, FileText, TruckElectricIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog'
import Vehicles from '../vehicles/page'
import Link from 'next/link'


// Define the Zod schema for validation of breakdowns form data
const breakdownFormSchema = z.object({
    id: z.number().int().min(1, 'Registration number is required'),
    order_no: z.string().optional(),
    status: z.enum(["requested", "in_progress", "completed"]).optional().default("requested"),
    emergency_type: z.enum(["vehicle", "medical"]).optional(),
    location: z.string().optional(),
    registration: z.string().min(1, 'Registration number is required'),
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.string().min(1, 'Manufactured year is required'),
    vin: z.string().optional(),
    breakdown_location: z.string().optional(),
    client_type: z.enum(["internal", "external"]).optional(),
    external_client_id: z.string().optional(),
    service_history: z.string().optional(), // JSON string
    breakdown_type: z.enum(["standby", "tow"], { required_error: 'Vehicle type is required' }),
    job_id: z.number().int().optional(),
    tow_capacity: z.string().min(1, 'Tow capacity is required'),
    tow_weight: z.number().int().optional(),
    engine_number: z.string().optional(),
    registration_date: z.string().optional(),
    license_expiry_date: z.string().optional(),
    inspected: z.boolean().optional(),
    tech_id: z.number().int().optional(),
    updated_at: z.string().optional(),
    vin_number: z.string().min(1, 'VIN number is required'),
    sub_model: z.string().optional(),
    fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'lpg'], { required_error: 'Fuel type is required' }),
    transmission_type: z.enum(['manual', 'automatic', 'cvt'], { required_error: 'Transmission type is required' }),
    tank_capacity: z.string().optional(),
    colour: z.string().min(1, 'Colour is required'),
    created_by: z.string().optional(),
    created_at: z.string().optional(),
});

type breakdownValues = z.infer<typeof breakdownFormSchema>

interface Technician {
    id: number
    name: string,
    phone: string,
    email: string
}

export default function ExVehicles() {
    const [breakdowns, setBreakdowns] = useState<breakdownValues[]>([])
    const [isAddingBreakdown, setIsAddingBreakdown] = useState(false)
    const [selectedVehicleReg, setSelectedVehicleReg] = useState("");

    const router = useRouter()
    const supabase = createClient()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [search, setSearch] = useState("");
    const [user, setUser] = useState<{ id: string; workshop_id: string } | null>(null);
    const useWorkshopId = () => {
        const [workshopId, setWorkshopId] = useState<string | null>(null);
        useEffect(() => {
            const fetchWorkshopId = async () => {
                const { data: sessionData } = await supabase.auth.getSession();
                const userId = sessionData?.session?.user?.id;
                if (!userId) return;

                const { data, error } = await supabase
                    .from('profiles')
                    .select('workshop_id')
                    .eq('id', userId)
                    .single();

                if (data && !error) {
                    setWorkshopId(data.workshop_id);
                }
            };

            fetchWorkshopId();
        }, []);

        return workshopId;
    };
    const workshopId = useWorkshopId();
    const [technicians, setTechnicians] = useState<Technician[]>([])
    const [filteredTechs, setFilteredTechs] = useState<Technician[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const getTechnician = async () => {
            // Fetch technicians
            const { data: user, error: userError } = await supabase.auth.getUser()
            const currentUser = user.user?.id;

            if (!currentUser) {
                setTechnicians([])
                return;
            }
            const { data: techniciansData, error: techError } = await supabase
                .from('technicians')
                .select('*')
                .eq('created_by', currentUser)

            setTechnicians(techniciansData as [])

            if (techError) {
                console.error('Error fetching technicians:', techError)
                setTechnicians([])
                return
            }

        }
        getTechnician();
    }, []);

    useEffect(() => {
        const filtered = technicians.filter((tech) =>
            tech.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTechs(filtered as []);
    }, [searchTerm, technicians]);


    const fetchVehicles = async () => {
        if (!workshopId) return;

        const { data, error } = await supabase
            .from('breakdowns')
            .select('*')
            .eq('workshop_id', workshopId);

        if (data && !error) {
            // @ts-ignore
            setBreakdowns(data);
        }
    };
    useEffect(() => {
        fetchVehicles();
    }, [workshopId]);


    const handleUploadFile = () => {
        if (!selectedFile) return;
        // TODO: Implement upload logic here
        toast.info(`Uploading: ${selectedFile.name}`)
    }

    // Filter breakdowns based on search
    const filteredVehicles = breakdowns.filter(breakdowns => {
        const searchLower = search.toLowerCase();
        return (
            breakdowns.make.toLowerCase().includes(searchLower) ||
            breakdowns.model.toLowerCase().includes(searchLower) ||
            breakdowns.registration.toLowerCase().includes(searchLower) ||
            breakdowns.breakdown_type.toLowerCase().includes(searchLower)
        )
    })

    // Row background color by type
    const getRowBg = (type: string) => {
        switch (type) {
            case 'tow':
                return 'bg-blue-50';
            case 'standby':
                return 'bg-purple-50';
            case 'truck':
                return 'bg-yellow-50';
            case 'commercial':
                return 'bg-green-50';
            case 'tanker':
                return 'bg-orange-50';
            case 'specialized':
                return 'bg-pink-50';
            default:
                return '';
        }
    }

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id;
            if (userId) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profile && !error) {
                    setUser({
                        id: profile.id ?? '',
                        workshop_id: profile.workshop_id ?? ''
                    });
                }
            }
        }
        fetchUserProfile()

        const fetchVehicles = async () => {
            if (!user?.workshop_id) {
                console.error("User workshop is undefined, cannot fetch vehicles.");
                setBreakdowns([]);
                return;
            }
            const { data: vehicles, error } = await supabase
                .from('breakdowns')
                .select('*')
                .eq('workshop_id', user?.workshop_id);

            if (error) {
                console.error("the error is", error.name, error.message);
            } else {
                // @ts-ignore
                setBreakdowns(vehicles || [])
            }
        }
        const breakdowns = supabase.channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'breakdowns' },
                (payload) => {
                    console.log('Change received!', payload)
                }
            )
            .subscribe()
        // fetchVehicles()

        return () => {
            breakdowns.unsubscribe;
        }
    }, [])
    const breakdownId = `BR-${Math.floor(Math.random() * 300 + 1)}-${new Date().getFullYear()}`;

    const form = useForm({
        resolver: zodResolver(breakdownFormSchema),
        defaultValues: {
            id: undefined,
            order_no: breakdownId,
            status: 'requested',
            emergency_type: undefined,
            location: '',
            registration: '',
            make: '',
            model: '',
            year: undefined,
            vin: '',
            breakdown_location: '',
            client_type: 'external',
            external_client_id: '',
            service_history: '[]',
            breakdown_type: 'standby',
            job_id: undefined,
            tow_capacity: undefined,
            tow_weight: undefined,
            inspected: false,
            tech_id: undefined,
            updated_at: new Date().toISOString(),
        },
    });

    const handleAddVehicle = async (vehicleData: breakdownValues) => {
        // Ensure correct types for numeric fields and fix insert call
        const insertPayload = {
            ...vehicleData,
            created_by: user?.id,
            workshop_id: user?.workshop_id,
        };

        const { data: vehicle, error } = await supabase
            .from('breakdowns')
            // @ts-expect-error
            .insert(insertPayload)
            .select();

        if (error) {
            console.error("Insert error:", error);
            toast.error(`Insert failed: ${error.message}`);
        } else {
            console.log("Inserted vehicle:", vehicle?.[0]?.created_by, vehicle?.[0]?.workshop_id);
            toast.success('Vehicle added successfully');
            form.reset();
            setIsAddingBreakdown(false);
            router.refresh();
        }
    };

    const onSubmit = async (data: breakdownValues) => {
        if (!user || !user.id || !user.workshop_id) {
            toast.error("User not authenticated or missing workshop info");
            return;
        }

        const enrichedData: breakdownValues = {
            ...data,
            created_by: user.id,
            // @ts-expect-error
            workshop_id: user.workshop_id,
        };

        console.log("Final insert payload:", enrichedData); // Confirm fields are present

        await handleAddVehicle(enrichedData);
        fetchVehicles();
    };

    const getVehicleTypeIcon = (type: string) => {
        return type === 'tow' ? <Car className="w-4 h-4" /> : <Truck className="w-4 h-4" />
    }

    const getPriorityBadge = (priority: string) => {
        const colors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        }
        return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>
    }

    // async function handleAssign(registration: string, id: number) {
    //     const { data: datav, error: errorv } = await supabase.from('breakdowns').
    //         update({
    //             tech_id: id,
    //         })
    //         .eq('registration', registration)

    //     console.log("updating" + datav)
    //     if (!datav || errorv) {
    //         console.log("Issue in assigning" + errorv?.message)
    //     }
    //     else {
    //         alert("Success")
    //     }
    // }

    async function handleAssign(breakdownId: number, techId: number) {
        const { data: datav, error: errorv } = await supabase
            .from('breakdowns')
            .update({ tech_id: techId })
            .eq('id', breakdownId)
            .select()
            .single()

        if (errorv) {
            console.log("Issue in assigning: " + errorv.message);
            alert("Failed to assign technician: " + errorv.message);
            return;
        }
        console.log("Technician assigned successfully:", datav);
    }


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Breakdowns</h1>
                    <p className="text-gray-600 mt-1">Manage your breakdowns and trailer fleet</p>
                </div>
                <Button
                    onClick={() => setIsAddingBreakdown(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Fleet</p>
                                <p className="text-2xl font-bold text-gray-900">{breakdowns.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-semibold">🚗</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Breakdowns</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {breakdowns.length}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Car className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tow</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {breakdowns.filter(v => v.breakdown_type === 'tow').length}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Truck className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Stand By</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {breakdowns.filter(v => v.breakdown_type === 'standby').length}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Truck className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Add Vehicle Form */}
            {isAddingBreakdown && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Vehicle</CardTitle>
                    </CardHeader>
                    {/* <CardContent>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 flex flex-col items-center bg-gray-50">
                            <div className="flex flex-col items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                <p className="text-lg font-semibold text-gray-700">Upload Vehicles</p>
                                <p className="text-sm text-gray-500 mb-2">Upload new vehicles using a CSV or spreadsheet file</p>
                            </div>
                            <input
                                id="vehicle-upload"
                                type="file"
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                className="border-2 p-2 rounded-4xl"
                                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            {selectedFile && (
                                <span className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</span>
                            )}
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" type="button" disabled={!selectedFile} onClick={handleUploadFile}>
                                Upload File
                            </Button>
                        </div>
                    </CardContent> */}

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Vehicle Type Selection */}
                                    <FormField
                                        control={form.control}
                                        name="breakdown_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Vehicle Type *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="vehicle type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="stand-by">
                                                            <div className="flex items-center gap-2">
                                                                <Car className="w-4 h-4" />
                                                                standby
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="tow">
                                                            <div className="flex items-center gap-2">
                                                                <Truck className="w-4 h-4" />
                                                                Tow
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="registration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registration Number *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ABC 123 GP" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="make"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Make *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Toyota" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="model"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Model *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Hilux" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="sub_model"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sub Model</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Double Cab" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Manufactured Year *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="2023" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="fuel_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fuel Type *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select fuel type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="petrol">Petrol</SelectItem>
                                                        <SelectItem value="diesel">Diesel</SelectItem>
                                                        <SelectItem value="electric">Electric</SelectItem>
                                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                                        <SelectItem value="lpg">LPG</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="transmission_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Transmission *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select transmission" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="manual">Manual</SelectItem>
                                                        <SelectItem value="automatic">Automatic</SelectItem>
                                                        <SelectItem value="cvt">CVT</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tow_capacity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tow Capacity (L)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 80" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="colour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Colour *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="White" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => handleAddVehicle({ ...form.getValues(), status: "requested" })}
                                        type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Save Vehicle
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddingBreakdown(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            {/* Vehicle List */}
            {breakdowns.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Fleet Overview</CardTitle>
                        <div className="mt-2">
                            <Input
                                placeholder="Search by make, model, registration, or type..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Make & Model</TableHead>
                                    <TableHead>Registration</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Fuel</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Tow Capacity</TableHead>
                                    <TableCell>Assigned Technician</TableCell>
                                    <TableHead>Assign Technician</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVehicles.map((vehicle, index) => (
                                    <TableRow key={vehicle.id} className={getRowBg(vehicle?.breakdown_type)}>
                                        <TableCell className="flex items-center gap-2">
                                            {getVehicleTypeIcon(vehicle?.breakdown_type)}
                                            <span>{vehicle.make} {vehicle.model}</span>
                                        </TableCell>
                                        <TableCell>{vehicle.registration}</TableCell>
                                        <TableCell>{vehicle.year}</TableCell>
                                        <TableCell>{vehicle.fuel_type}</TableCell>
                                        <TableCell>{vehicle.colour}</TableCell>
                                        <TableCell className="capitalize">{vehicle.breakdown_type}</TableCell>
                                        <TableCell>{vehicle.tow_capacity}</TableCell>
                                        <TableCell className='flex flex-row gap-2'>
                                            {/* {technicians.find(tech => tech.id === vehicle.tech_id)?.name || "Unassigned"} */}
                                            {technicians.find(technician => technician.id === vehicle.tech_id) ? (
                                                <>
                                                    <span>
                                                        {technicians.find(technician => technician.id === vehicle.tech_id)?.name}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="ml-2"
                                                        onClick={async () => {
                                                            // Clear driver assignment
                                                            const { error } = await supabase
                                                                .from('breakdowns')
                                                                .update({ tech_id: null })
                                                                .eq('id', vehicle.id);

                                                            if (error) {
                                                                alert('Failed to unassign driver: ' + error.message);
                                                                console.error(error);
                                                            } else {
                                                                toast.success('Driver unassigned successfully');
                                                                alert('Driver unassigned successfully')
                                                                router.refresh(); // refresh list to show update
                                                            }
                                                        }}
                                                    >
                                                        Unassign
                                                    </Button>
                                                </>
                                            ) : (
                                                <span>Not Assigned</span>
                                            )}

                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-row gap-3">
                                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="px-4 py-2"
                                                            onClick={() => {
                                                                setSelectedVehicleReg(vehicle.registration);
                                                                setDialogOpen(true);
                                                            }}
                                                        >
                                                            Assign
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-md w-full">
                                                        <DialogTitle>Assign Technician</DialogTitle>
                                                        <DialogDescription>
                                                            Assign technician for vehicle with registration: <strong>{selectedVehicleReg}</strong>
                                                        </DialogDescription>
                                                        {/* technician search & list */}
                                                        <Input
                                                            placeholder="Search technician by name"
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="mb-4"
                                                        />
                                                        <div className="max-h-60 overflow-auto space-y-2">
                                                            {filteredTechs.length > 0 ? (
                                                                filteredTechs.map((tech, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => {
                                                                            handleAssign(vehicle.id, tech.id);
                                                                            setDialogOpen(false);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                                    >
                                                                        {tech.name}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <p className="text-center text-sm text-gray-500 py-4">No technicians found</p>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                <Link href={`/exvehicles/${vehicle.id}`}>
                                                    <Button variant="default">View</Button>
                                                </Link>

                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )
            }
        </div >
    )
}