"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InspectionItem = {
  label: string;
  category: string;
  status: string | null;
};

type InspectionSection = {
  title: string;
  items: InspectionItem[];
};

type Inspection = {
  id: number;
  vehicle_id: number;
  driver_id: number | null;
  odo_reading: number;
  overall_status: string | null;
  category: string | null;
  checklist: InspectionSection[];
  inspection_date: string;
  vehicle: { registration_number: string; make: string; model: string } | null;
  driver: { first_name: string; surname: string } | null;
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchInspections = async () => {
      const { data, error } = await supabase
        .from("inspections")
        .select(
          `
          *,
          vehicle:vehicle_id (registration_number, make, model),
          driver:driver_id (first_name, surname)
        `
        )
        .order("inspection_date", { ascending: false });

      if (!error && data) setInspections(data as unknown as Inspection[]);
    };
    fetchInspections();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-3xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Vehicle Inspections
          </h1>
          <p className="text-sm text-gray-600">
            Below is a list of all vehicle inspections. Click{" "}
            <strong>"View Full Inspection"</strong> to see detailed information
            including the full checklist and any noted faults.
          </p>
        </div>

        {/* Legend Section */}
        <div className="mt-6 border border-gray-300 rounded-md p-4 bg-gray-50">
          <h2 className="text-md font-semibold text-gray-700 mb-2">
            Inspection Status Legend
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              <span className="text-gray-700">
                Faulty Inspection – Needs Attention
              </span>
            </li>
            <li className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-gray-700">
                Passed Inspection – No Issues Found
              </span>
            </li>
          </ul>
        </div>
      </div>

      {inspections.map((insp) => {
        const isFaulty = insp.overall_status === "Faulty";

        return (
          <Card
            key={insp.id}
            className={`transition transform hover:scale-[1.01] shadow-lg rounded-2xl border
          ${
            isFaulty
              ? "bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white"
              : "bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white"
          }
        `}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg font-semibold">
                <span className="tracking-wide">
                  {insp.vehicle?.registration_number} – {insp.vehicle?.make}{" "}
                  {insp.vehicle?.model}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs uppercase shadow-sm
                ${
                  isFaulty
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/20 text-white border border-white/30"
                }
              `}
                >
                  {insp.overall_status}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <strong>Driver:</strong>{" "}
                  {insp.driver
                    ? `${insp.driver.first_name} ${insp.driver.surname}`
                    : "N/A"}
                </div>
                <div>
                  <strong>Odometer:</strong> {insp.odo_reading}
                </div>
                <div>
                  <strong>Category:</strong> {insp.category}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(insp.inspection_date).toLocaleDateString()}
                </div>
              </div>

              {/* Accordion */}
              <Accordion type="single" collapsible>
                <AccordionItem value={`insp-${insp.id}`}>
                  <AccordionTrigger className="text-white hover:text-gray-100 rounded-3xl px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30">
                    Preview Checklist
                  </AccordionTrigger>
                  <AccordionContent className="bg-white/10 rounded-lg p-4">
                    {Array.isArray(insp.checklist) &&
                    insp.checklist.length > 0 ? (
                      insp.checklist.slice(0, 1).map((section, sIdx) => (
                        <div
                          key={sIdx}
                          className="mb-4 bg-white p-3 rounded text-black"
                        >
                          <h3 className="font-medium text-blue-700 mb-2">
                            {section.title}
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {section.items.map((item, iIdx) => (
                              <li
                                key={iIdx}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.label}{" "}
                                  <span className="text-gray-500">
                                    (Category : {item.category})
                                  </span>
                                </span>
                                <span
                                  className={
                                    item.status === "Faulty"
                                      ? "text-red-500 font-semibold"
                                      : "text-green-500 font-semibold"
                                  }
                                >
                                  {item.status}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-200 italic">
                        No checklist data available.
                      </p>
                    )}

                    <Link href={`/fleetManager/inspections/${insp.id}`}>
                      <Button
                        variant="secondary"
                        className="mt-3 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      >
                        View Full Inspection
                      </Button>
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
