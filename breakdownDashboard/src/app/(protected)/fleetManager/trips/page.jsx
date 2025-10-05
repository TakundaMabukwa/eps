"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useGlobalContext } from "@/context/global-context/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import TripForm from "../../../../components/forms/trip-form";
import { initialVehiclesState } from "@/context/vehicles-context/context";
import { createClient } from "@/lib/supabase/client";

export default function TripsPage() {
  const [open, setOpen] = useState(false);
  const { initialTripsState } = useGlobalContext();
  const [trips, setTrips] = useState([]);
  const supabase = createClient();

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase.from('trips').select('*');
      if (error) {
        console.error('Error fetching trips:', error);
      } else {
        setTrips(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching trips:', error);
    }
  }
  React.useEffect(() => {
    fetchTrips();
  }, []);
  // Use the state and columns from the context
  const {
    titleSection,
    screenStats,
    tableInfo,
    csv_headers,
    csv_rows,
  } = initialTripsState;

  const { columns } = initialVehiclesState;

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Title Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{titleSection?.title}</h1>
          <p className="text-gray-500">{titleSection?.description}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {titleSection.button.text}
        </button>
      </div>

      {/* Stats Section (This can be wired up to real data later) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {screenStats.map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border bg-white shadow-sm flex items-center space-x-4"
          >
            <div>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={tableInfo.tabs[0]?.value} className="w-full">
        <TabsList className="bg-blue-50 w-full">
          {tableInfo.tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tableInfo.tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} />
        ))}
      </Tabs>

      <div className="bg-white rounded-xl border shadow-sm">
        {/* Data Table */}
        <div className="p-4">
          {columns &&
            <DataTable
              columns={columns()}
              data={trips || []} // Use data from the context
              filterColumn={[]}
              csv_headers={[]}
              csv_rows={[]}
              href="/fleetManager/trips"
              downloadCSV={() => {
                // a function to download csv
              }}
            />
          }
        </div>
      </div>

      {/* Trip Form Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto min-w-2/4">
          {/* Accessibility: Add DialogTitle and DialogDescription */}
          <div>
            <h2 className="text-lg font-semibold" id="trip-form-title">Trip Form</h2>
            <p className="text-sm text-muted-foreground" id="trip-form-desc">
              Fill in the trip details below.
            </p>
          </div>
          <TripForm onClose={() => setOpen(false)} id={undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
