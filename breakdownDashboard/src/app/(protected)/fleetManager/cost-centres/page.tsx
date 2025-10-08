"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { initialCostCentresState } from "@/context/cost-centres-context/context";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CostCentreForm from "../../../../components/forms/cost-centre-form";
import { createClient } from "@/lib/supabase/client";

export default function CostCentresPage() {
  const [open, setOpen] = useState(false);
  const [costCentres, setCostCentres] = useState([]);
  const {
    titleSection,
    screenStats,
    columns
  } = initialCostCentresState;
  const supabase = createClient();

  const fetchCost = async () => {
    const { data, error } = await supabase
      .from("breakdown_cost_centers")
      .select("*");
    if (error) {
      console.error("Error fetching cost centres:", error);
    } else {
      setCostCentres(data as any);
    }
  };

  useEffect(() => {
    fetchCost();
  }, []);


  return (
    <div className="p-6 space-y-6 w-full">
      {/* Title Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{titleSection.title}</h1>
          <p className="text-gray-500">{titleSection.description}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {titleSection.button.text}
        </button>
      </div>

      {/* Stats Section */}
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

      {/* Data Table */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4">
          <DataTable
            columns={columns()}
            data={costCentres || []}
            filterColumn={[]}
            csv_headers={[]}
            csv_rows={[]}
            href={`/fleetManager/cost-centres/`}
          />
        </div>
      </div>

      {/* Cost Centre Form Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto min-w-2/4">
          <CostCentreForm onCancel={() => setOpen(false)} id={undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
