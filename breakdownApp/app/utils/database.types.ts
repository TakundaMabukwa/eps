export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      approvals: {
        Row: {
          approver_id: string | null
          created_at: string | null
          id: string
          quotation_id: string | null
          reason: string | null
          status: string | null
        }
        Insert: {
          approver_id?: string | null
          created_at?: string | null
          id?: string
          quotation_id?: string | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          approver_id?: string | null
          created_at?: string | null
          id?: string
          quotation_id?: string | null
          reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      assignements: {
        Row: {
          breakdown_id: number | null
          created_at: string
          driver_id: number | null
          id: number
          job_id: number | null
          tech_id: number | null
          updated_by: string | null
          vehicle_id: number | null
        }
        Insert: {
          breakdown_id?: number | null
          created_at?: string
          driver_id?: number | null
          id?: number
          job_id?: number | null
          tech_id?: number | null
          updated_by?: string | null
          vehicle_id?: number | null
        }
        Update: {
          breakdown_id?: number | null
          created_at?: string
          driver_id?: number | null
          id?: number
          job_id?: number | null
          tech_id?: number | null
          updated_by?: string | null
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignements_breakdown_id_fkey"
            columns: ["breakdown_id"]
            isOneToOne: false
            referencedRelation: "breakdowns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignements_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignements_tech_id_fkey"
            columns: ["tech_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignements_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignements_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      breakdowns: {
        Row: {
          actual_cost: number | null
          breakdown_location: string | null
          breakdown_type: string | null
          client_type: string | null
          coordinates: Json | null
          coverage_type: string | null
          created_at: string | null
          driver_name: string | null
          driver_phone: string | null
          emergency_type: string | null
          estimated_cost: number | null
          external_client_id: string | null
          id: number
          image_urls: string | null
          insurance_provider: string | null
          issue_description: string | null
          job_id: number | null
          location: string | null
          make: string | null
          model: string | null
          order_no: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          phone: string | null
          policy_number: string | null
          priority: string | null
          registration: string | null
          reported_at: string | null
          service_history: Json | null
          status: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          actual_cost?: number | null
          breakdown_location?: string | null
          breakdown_type?: string | null
          client_type?: string | null
          coordinates?: Json | null
          coverage_type?: string | null
          created_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          emergency_type?: string | null
          estimated_cost?: number | null
          external_client_id?: string | null
          id?: number
          image_urls?: string | null
          insurance_provider?: string | null
          issue_description?: string | null
          job_id?: number | null
          location?: string | null
          make?: string | null
          model?: string | null
          order_no?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          phone?: string | null
          policy_number?: string | null
          priority?: string | null
          registration?: string | null
          reported_at?: string | null
          service_history?: Json | null
          status?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          actual_cost?: number | null
          breakdown_location?: string | null
          breakdown_type?: string | null
          client_type?: string | null
          coordinates?: Json | null
          coverage_type?: string | null
          created_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          emergency_type?: string | null
          estimated_cost?: number | null
          external_client_id?: string | null
          id?: number
          image_urls?: string | null
          insurance_provider?: string | null
          issue_description?: string | null
          job_id?: number | null
          location?: string | null
          make?: string | null
          model?: string | null
          order_no?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          phone?: string | null
          policy_number?: string | null
          priority?: string | null
          registration?: string | null
          reported_at?: string | null
          service_history?: Json | null
          status?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "breakdowns_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      capabilities: {
        Row: {
          ambulance: boolean | null
          apmma: boolean | null
          battery_charge: boolean | null
          battery_tester: boolean | null
          block_boring: boolean | null
          block_pressure_test: boolean | null
          body_modification: boolean | null
          brakes: boolean | null
          cash_in_transit: boolean | null
          clutch_over_huals: boolean | null
          clutch_overhuals: boolean | null
          couch_builder: boolean | null
          cra: boolean | null
          crank_grinding: boolean | null
          dekra: boolean | null
          dent_vehicles: boolean | null
          drive_line: boolean | null
          driver_line_cv_joints: boolean | null
          engine_block_resurfacing: boolean | null
          engine_overhuals: boolean | null
          era: boolean | null
          gearbox_bench: boolean | null
          hail_demage: boolean | null
          light_retros: boolean | null
          m_brakes: boolean | null
          major_repairs: boolean | null
          mibco: boolean | null
          mig_welder: boolean | null
          minor_repairs: boolean | null
          miwa: boolean | null
          msr: boolean | null
          nsr: boolean | null
          pipe_bender: boolean | null
          propshaft_bench: boolean | null
          raaf: boolean | null
          radios_audio: boolean | null
          rmi: boolean | null
          saarsa: boolean | null
          sambra: boolean | null
          saqa: boolean | null
          sata: boolean | null
          service: boolean | null
          standard_wash: boolean | null
          starters: boolean | null
          suspension: boolean | null
          tig_welder: boolean | null
          two_way_radio: boolean | null
          valet: boolean | null
          valve_grinding: boolean | null
          vehicles_detailing: boolean | null
          wheel_alignment: boolean | null
          wheel_balancing: boolean | null
          wiring_major: boolean | null
          wiring_minor: boolean | null
          workshop_id: string
        }
        Insert: {
          ambulance?: boolean | null
          apmma?: boolean | null
          battery_charge?: boolean | null
          battery_tester?: boolean | null
          block_boring?: boolean | null
          block_pressure_test?: boolean | null
          body_modification?: boolean | null
          brakes?: boolean | null
          cash_in_transit?: boolean | null
          clutch_over_huals?: boolean | null
          clutch_overhuals?: boolean | null
          couch_builder?: boolean | null
          cra?: boolean | null
          crank_grinding?: boolean | null
          dekra?: boolean | null
          dent_vehicles?: boolean | null
          drive_line?: boolean | null
          driver_line_cv_joints?: boolean | null
          engine_block_resurfacing?: boolean | null
          engine_overhuals?: boolean | null
          era?: boolean | null
          gearbox_bench?: boolean | null
          hail_demage?: boolean | null
          light_retros?: boolean | null
          m_brakes?: boolean | null
          major_repairs?: boolean | null
          mibco?: boolean | null
          mig_welder?: boolean | null
          minor_repairs?: boolean | null
          miwa?: boolean | null
          msr?: boolean | null
          nsr?: boolean | null
          pipe_bender?: boolean | null
          propshaft_bench?: boolean | null
          raaf?: boolean | null
          radios_audio?: boolean | null
          rmi?: boolean | null
          saarsa?: boolean | null
          sambra?: boolean | null
          saqa?: boolean | null
          sata?: boolean | null
          service?: boolean | null
          standard_wash?: boolean | null
          starters?: boolean | null
          suspension?: boolean | null
          tig_welder?: boolean | null
          two_way_radio?: boolean | null
          valet?: boolean | null
          valve_grinding?: boolean | null
          vehicles_detailing?: boolean | null
          wheel_alignment?: boolean | null
          wheel_balancing?: boolean | null
          wiring_major?: boolean | null
          wiring_minor?: boolean | null
          workshop_id: string
        }
        Update: {
          ambulance?: boolean | null
          apmma?: boolean | null
          battery_charge?: boolean | null
          battery_tester?: boolean | null
          block_boring?: boolean | null
          block_pressure_test?: boolean | null
          body_modification?: boolean | null
          brakes?: boolean | null
          cash_in_transit?: boolean | null
          clutch_over_huals?: boolean | null
          clutch_overhuals?: boolean | null
          couch_builder?: boolean | null
          cra?: boolean | null
          crank_grinding?: boolean | null
          dekra?: boolean | null
          dent_vehicles?: boolean | null
          drive_line?: boolean | null
          driver_line_cv_joints?: boolean | null
          engine_block_resurfacing?: boolean | null
          engine_overhuals?: boolean | null
          era?: boolean | null
          gearbox_bench?: boolean | null
          hail_demage?: boolean | null
          light_retros?: boolean | null
          m_brakes?: boolean | null
          major_repairs?: boolean | null
          mibco?: boolean | null
          mig_welder?: boolean | null
          minor_repairs?: boolean | null
          miwa?: boolean | null
          msr?: boolean | null
          nsr?: boolean | null
          pipe_bender?: boolean | null
          propshaft_bench?: boolean | null
          raaf?: boolean | null
          radios_audio?: boolean | null
          rmi?: boolean | null
          saarsa?: boolean | null
          sambra?: boolean | null
          saqa?: boolean | null
          sata?: boolean | null
          service?: boolean | null
          standard_wash?: boolean | null
          starters?: boolean | null
          suspension?: boolean | null
          tig_welder?: boolean | null
          two_way_radio?: boolean | null
          valet?: boolean | null
          valve_grinding?: boolean | null
          vehicles_detailing?: boolean | null
          wheel_alignment?: boolean | null
          wheel_balancing?: boolean | null
          wiring_major?: boolean | null
          wiring_minor?: boolean | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capabilities_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: true
            referencedRelation: "workshop"
            referencedColumns: ["id"]
          },
        ]
      }
      client: {
        Row: {
          accountmanager: string | null
          address: string | null
          availability: boolean | null
          average_job_value: number | null
          capacity: Json | null
          certifications: string[] | null
          city: string | null
          client_type: string | null
          clienttype: string | null
          company_name: string | null
          completed_jobs: number | null
          contact_person: string | null
          contract_status: string | null
          contract_type: string | null
          credit_limit: number | null
          email: string | null
          emergency_phone: string | null
          equipment_types: string[] | null
          hourly_rate: number | null
          id: number
          last_job_date: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          preferred_services: string[] | null
          province: string | null
          rates: Json | null
          rating: number | null
          registration_date: string | null
          response_time: number | null
          service_areas: string[] | null
          specialties: string[] | null
          status: string | null
          total_jobs: number | null
          total_revenue: number | null
          vehicle_types: string[] | null
        }
        Insert: {
          accountmanager?: string | null
          address?: string | null
          availability?: boolean | null
          average_job_value?: number | null
          capacity?: Json | null
          certifications?: string[] | null
          city?: string | null
          client_type?: string | null
          clienttype?: string | null
          company_name?: string | null
          completed_jobs?: number | null
          contact_person?: string | null
          contract_status?: string | null
          contract_type?: string | null
          credit_limit?: number | null
          email?: string | null
          emergency_phone?: string | null
          equipment_types?: string[] | null
          hourly_rate?: number | null
          id?: number
          last_job_date?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_services?: string[] | null
          province?: string | null
          rates?: Json | null
          rating?: number | null
          registration_date?: string | null
          response_time?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          status?: string | null
          total_jobs?: number | null
          total_revenue?: number | null
          vehicle_types?: string[] | null
        }
        Update: {
          accountmanager?: string | null
          address?: string | null
          availability?: boolean | null
          average_job_value?: number | null
          capacity?: Json | null
          certifications?: string[] | null
          city?: string | null
          client_type?: string | null
          clienttype?: string | null
          company_name?: string | null
          completed_jobs?: number | null
          contact_person?: string | null
          contract_status?: string | null
          contract_type?: string | null
          credit_limit?: number | null
          email?: string | null
          emergency_phone?: string | null
          equipment_types?: string[] | null
          hourly_rate?: number | null
          id?: number
          last_job_date?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_services?: string[] | null
          province?: string | null
          rates?: Json | null
          rating?: number | null
          registration_date?: string | null
          response_time?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          status?: string | null
          total_jobs?: number | null
          total_revenue?: number | null
          vehicle_types?: string[] | null
        }
        Relationships: []
      }
      company: {
        Row: {
          company_contact: string | null
          company_contactname: string | null
          company_email: string | null
          company_fms: string | null
          company_industry: string | null
          company_infor: string | null
          company_name: string | null
          company_no_vehicles: number | null
          company_phone: string | null
          company_regions: string | null
          company_size: number | null
          company_tax_id: string | null
          company_v_type: string | null
          company_website: string | null
          created_at: string
          created_by: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          company_contact?: string | null
          company_contactname?: string | null
          company_email?: string | null
          company_fms?: string | null
          company_industry?: string | null
          company_infor?: string | null
          company_name?: string | null
          company_no_vehicles?: number | null
          company_phone?: string | null
          company_regions?: string | null
          company_size?: number | null
          company_tax_id?: string | null
          company_v_type?: string | null
          company_website?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          company_contact?: string | null
          company_contactname?: string | null
          company_email?: string | null
          company_fms?: string | null
          company_industry?: string | null
          company_infor?: string | null
          company_name?: string | null
          company_no_vehicles?: number | null
          company_phone?: string | null
          company_regions?: string | null
          company_size?: number | null
          company_tax_id?: string | null
          company_v_type?: string | null
          company_website?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          cell_number: string | null
          created_at: string | null
          created_by: string | null
          driver_restriction_code: string | null
          email_address: string | null
          first_name: string
          front_of_driver_pic: string | null
          id: number
          id_or_passport_document: string | null
          id_or_passport_number: string
          license_code: string | null
          license_expiry_date: string | null
          license_number: string | null
          pdp_expiry_date: string | null
          professional_driving_permit: boolean | null
          rear_of_driver_pic: string | null
          sa_issued: boolean | null
          surname: string
          user_id: string | null
          vehicle_restriction_code: string | null
          work_permit_upload: string | null
        }
        Insert: {
          cell_number?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_restriction_code?: string | null
          email_address?: string | null
          first_name: string
          front_of_driver_pic?: string | null
          id?: number
          id_or_passport_document?: string | null
          id_or_passport_number: string
          license_code?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          pdp_expiry_date?: string | null
          professional_driving_permit?: boolean | null
          rear_of_driver_pic?: string | null
          sa_issued?: boolean | null
          surname: string
          user_id?: string | null
          vehicle_restriction_code?: string | null
          work_permit_upload?: string | null
        }
        Update: {
          cell_number?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_restriction_code?: string | null
          email_address?: string | null
          first_name?: string
          front_of_driver_pic?: string | null
          id?: number
          id_or_passport_document?: string | null
          id_or_passport_number?: string
          license_code?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          pdp_expiry_date?: string | null
          professional_driving_permit?: boolean | null
          rear_of_driver_pic?: string | null
          sa_issued?: boolean | null
          surname?: string
          user_id?: string | null
          vehicle_restriction_code?: string | null
          work_permit_upload?: string | null
        }
        Relationships: []
      }
      inspection: {
        Row: {
          created_at: string
          data: Json | null
          driver: number | null
          id: number
          vihecle: number | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          driver?: number | null
          id?: number
          vihecle?: number | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          driver?: number | null
          id?: number
          vihecle?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_driver_fkey"
            columns: ["driver"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_vihecle_fkey"
            columns: ["vihecle"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignments: {
        Row: {
          accepted: boolean | null
          actual_cost: number | null
          approval_required: boolean | null
          approved_at: string | null
          approved_by: string | null
          assigned_technician: string | null
          attachments: string[] | null
          breakdown_req: boolean | null
          breakdowns_id: number | null
          client_name: string | null
          client_type: string | null
          completed_at: string | null
          coordinates: Json | null
          created_at: string | null
          created_by: string | null
          description: string
          driver_id: number | null
          emergency_type: string | null
          estimated_cost: number | null
          eta: string | null
          fleet_status: string | null
          id: number
          image_path: string | null
          inspected: boolean | null
          job_id: string | null
          job_status: Database["public"]["Enums"]["status"] | null
          location: string | null
          notes: string | null
          order_no: string | null
          priority: string | null
          result_images: string[] | null
          scanned: boolean | null
          status: string | null
          subcontractor_id: number | null
          technician_id: number | null
          technician_phone: string | null
          updated_at: string | null
          updated_by: string | null
          vehicle_id: number | null
        }
        Insert: {
          accepted?: boolean | null
          actual_cost?: number | null
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_technician?: string | null
          attachments?: string[] | null
          breakdown_req?: boolean | null
          breakdowns_id?: number | null
          client_name?: string | null
          client_type?: string | null
          completed_at?: string | null
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string | null
          description: string
          driver_id?: number | null
          emergency_type?: string | null
          estimated_cost?: number | null
          eta?: string | null
          fleet_status?: string | null
          id?: number
          image_path?: string | null
          inspected?: boolean | null
          job_id?: string | null
          job_status?: Database["public"]["Enums"]["status"] | null
          location?: string | null
          notes?: string | null
          order_no?: string | null
          priority?: string | null
          result_images?: string[] | null
          scanned?: boolean | null
          status?: string | null
          subcontractor_id?: number | null
          technician_id?: number | null
          technician_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: number | null
        }
        Update: {
          accepted?: boolean | null
          actual_cost?: number | null
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_technician?: string | null
          attachments?: string[] | null
          breakdown_req?: boolean | null
          breakdowns_id?: number | null
          client_name?: string | null
          client_type?: string | null
          completed_at?: string | null
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          driver_id?: number | null
          emergency_type?: string | null
          estimated_cost?: number | null
          eta?: string | null
          fleet_status?: string | null
          id?: number
          image_path?: string | null
          inspected?: boolean | null
          job_id?: string | null
          job_status?: Database["public"]["Enums"]["status"] | null
          location?: string | null
          notes?: string | null
          order_no?: string | null
          priority?: string | null
          result_images?: string[] | null
          scanned?: boolean | null
          status?: string | null
          subcontractor_id?: number | null
          technician_id?: number | null
          technician_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_breakdowns_id_fkey"
            columns: ["breakdowns_id"]
            isOneToOne: false
            referencedRelation: "breakdowns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      job_card: {
        Row: {
          client_name: string | null
          contact: string | null
          date: string | null
          description: string | null
          horse_fleet_no: string | null
          horse_reg_no: string | null
          id: number
          job_assignment_id: number
          job_type: string | null
          location: string | null
          mechanic: string | null
          notes: string | null
          odo_reading: number | null
          technician: string | null
          time: string | null
          trailer_fleet_no: string | null
          trailer_reg_no: string | null
          updated_at: string | null
          updated_by: string
          vehicle_make: string | null
        }
        Insert: {
          client_name?: string | null
          contact?: string | null
          date?: string | null
          description?: string | null
          horse_fleet_no?: string | null
          horse_reg_no?: string | null
          id?: number
          job_assignment_id: number
          job_type?: string | null
          location?: string | null
          mechanic?: string | null
          notes?: string | null
          odo_reading?: number | null
          technician?: string | null
          time?: string | null
          trailer_fleet_no?: string | null
          trailer_reg_no?: string | null
          updated_at?: string | null
          updated_by: string
          vehicle_make?: string | null
        }
        Update: {
          client_name?: string | null
          contact?: string | null
          date?: string | null
          description?: string | null
          horse_fleet_no?: string | null
          horse_reg_no?: string | null
          id?: number
          job_assignment_id?: number
          job_type?: string | null
          location?: string | null
          mechanic?: string | null
          notes?: string | null
          odo_reading?: number | null
          technician?: string | null
          time?: string | null
          trailer_fleet_no?: string | null
          trailer_reg_no?: string | null
          updated_at?: string | null
          updated_by?: string
          vehicle_make?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_card_job_assignment_id_fkey"
            columns: ["job_assignment_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role: string | null
          workshop_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: string | null
          workshop_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshop"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          additional_notes: string | null
          breakdown_id: string | null
          cost_center_id: string | null
          created_at: string | null
          created_by: string | null
          createdat: string | null
          description: string | null
          drivername: string | null
          estimate_amount: number | null
          estimated_cost: number | null
          estimated_time: string | null
          id: string
          issue: string | null
          job_id: number | null
          job_type: string | null
          jobcard_id: number | null
          laborcost: number | null
          markupPrice: string | null
          orderno: string | null
          paid: boolean | null
          parts_needed: string[] | null
          partscost: number | null
          priority: string | null
          reason: string | null
          status: string | null
          totalcost: number | null
          type: string | null
          typeJob: string | null
          vehiclereg: string | null
        }
        Insert: {
          additional_notes?: string | null
          breakdown_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          createdat?: string | null
          description?: string | null
          drivername?: string | null
          estimate_amount?: number | null
          estimated_cost?: number | null
          estimated_time?: string | null
          id?: string
          issue?: string | null
          job_id?: number | null
          job_type?: string | null
          jobcard_id?: number | null
          laborcost?: number | null
          markupPrice?: string | null
          orderno?: string | null
          paid?: boolean | null
          parts_needed?: string[] | null
          partscost?: number | null
          priority?: string | null
          reason?: string | null
          status?: string | null
          totalcost?: number | null
          type?: string | null
          typeJob?: string | null
          vehiclereg?: string | null
        }
        Update: {
          additional_notes?: string | null
          breakdown_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          createdat?: string | null
          description?: string | null
          drivername?: string | null
          estimate_amount?: number | null
          estimated_cost?: number | null
          estimated_time?: string | null
          id?: string
          issue?: string | null
          job_id?: number | null
          job_type?: string | null
          jobcard_id?: number | null
          laborcost?: number | null
          markupPrice?: string | null
          orderno?: string | null
          paid?: boolean | null
          parts_needed?: string[] | null
          partscost?: number | null
          priority?: string | null
          reason?: string | null
          status?: string | null
          totalcost?: number | null
          type?: string | null
          typeJob?: string | null
          vehiclereg?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_jobcard_id_fkey"
            columns: ["jobcard_id"]
            isOneToOne: false
            referencedRelation: "job_card"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_vehicles: {
        Row: {
          actual_cost: number | null
          breakdown_location: string | null
          breakdown_type: string | null
          client_type: string | null
          coordinates: Json | null
          coverage_type: string | null
          created_at: string | null
          driver_name: string | null
          driver_phone: string | null
          emergency_type: string | null
          estimated_cost: number | null
          external_client_id: string | null
          id: number
          image_urls: string | null
          insurance_provider: string | null
          issue_description: string | null
          location: string | null
          make: string | null
          model: string | null
          order_no: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          phone: string | null
          policy_number: string | null
          priority: string | null
          registration: string | null
          reported_at: string | null
          service_history: Json | null
          status: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          actual_cost?: number | null
          breakdown_location?: string | null
          breakdown_type?: string | null
          client_type?: string | null
          coordinates?: Json | null
          coverage_type?: string | null
          created_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          emergency_type?: string | null
          estimated_cost?: number | null
          external_client_id?: string | null
          id?: number
          image_urls?: string | null
          insurance_provider?: string | null
          issue_description?: string | null
          location?: string | null
          make?: string | null
          model?: string | null
          order_no?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          phone?: string | null
          policy_number?: string | null
          priority?: string | null
          registration?: string | null
          reported_at?: string | null
          service_history?: Json | null
          status?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          actual_cost?: number | null
          breakdown_location?: string | null
          breakdown_type?: string | null
          client_type?: string | null
          coordinates?: Json | null
          coverage_type?: string | null
          created_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          emergency_type?: string | null
          estimated_cost?: number | null
          external_client_id?: string | null
          id?: number
          image_urls?: string | null
          insurance_provider?: string | null
          issue_description?: string | null
          location?: string | null
          make?: string | null
          model?: string | null
          order_no?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          phone?: string | null
          policy_number?: string | null
          priority?: string | null
          registration?: string | null
          reported_at?: string | null
          service_history?: Json | null
          status?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          availability: Database["public"]["Enums"]["availability"] | null
          certifications: string[]
          coordinates: Json
          created_by: string | null
          email: string
          equipment_level: string
          id: number
          join_date: string
          location: string
          name: string
          phone: string
          rating: number | null
          skill_levels: Json
          specialties: string[]
          status: boolean | null
          type: string | null
          vehicle_type: string
          workshop_id: string | null
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability"] | null
          certifications: string[]
          coordinates: Json
          created_by?: string | null
          email: string
          equipment_level: string
          id?: number
          join_date: string
          location: string
          name: string
          phone: string
          rating?: number | null
          skill_levels: Json
          specialties: string[]
          status?: boolean | null
          type?: string | null
          vehicle_type: string
          workshop_id?: string | null
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability"] | null
          certifications?: string[]
          coordinates?: Json
          created_by?: string | null
          email?: string
          equipment_level?: string
          id?: number
          join_date?: string
          location?: string
          name?: string
          phone?: string
          rating?: number | null
          skill_levels?: Json
          specialties?: string[]
          status?: boolean | null
          type?: string | null
          vehicle_type?: string
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          created_at: string | null
          driver_id: number | null
          id: number
          inspected: boolean
          inspection_date: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: number | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspected?: boolean
          inspection_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: number | null
        }
        Update: {
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspected?: boolean
          inspection_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      vehiclesc: {
        Row: {
          boarding_km_hours: number | null
          colour: string
          cost_centres: string | null
          created_at: string | null
          created_by: string | null
          engine_number: string | null
          expected_boarding_date: string | null
          fuel_type: string | null
          id: number
          inspected: boolean | null
          license_expiry_date: string | null
          make: string | null
          manufactured_year: string
          model: string
          purchase_price: number | null
          register_number: string | null
          registration_date: string | null
          registration_number: string
          retail_price: number | null
          service_intervals: string
          sub_model: string | null
          take_on_kilometers: number
          tank_capacity: number | null
          transmission_type: string | null
          type: string | null
          updated_at: string | null
          vehicle_priority: string | null
          vehicle_type: string
          vin_number: string | null
          workshop_id: string | null
        }
        Insert: {
          boarding_km_hours?: number | null
          colour: string
          cost_centres?: string | null
          created_at?: string | null
          created_by?: string | null
          engine_number?: string | null
          expected_boarding_date?: string | null
          fuel_type?: string | null
          id?: number
          inspected?: boolean | null
          license_expiry_date?: string | null
          make?: string | null
          manufactured_year: string
          model: string
          purchase_price?: number | null
          register_number?: string | null
          registration_date?: string | null
          registration_number: string
          retail_price?: number | null
          service_intervals: string
          sub_model?: string | null
          take_on_kilometers: number
          tank_capacity?: number | null
          transmission_type?: string | null
          type?: string | null
          updated_at?: string | null
          vehicle_priority?: string | null
          vehicle_type?: string
          vin_number?: string | null
          workshop_id?: string | null
        }
        Update: {
          boarding_km_hours?: number | null
          colour?: string
          cost_centres?: string | null
          created_at?: string | null
          created_by?: string | null
          engine_number?: string | null
          expected_boarding_date?: string | null
          fuel_type?: string | null
          id?: number
          inspected?: boolean | null
          license_expiry_date?: string | null
          make?: string | null
          manufactured_year?: string
          model?: string
          purchase_price?: number | null
          register_number?: string | null
          registration_date?: string | null
          registration_number?: string
          retail_price?: number | null
          service_intervals?: string
          sub_model?: string | null
          take_on_kilometers?: number
          tank_capacity?: number | null
          transmission_type?: string | null
          type?: string | null
          updated_at?: string | null
          vehicle_priority?: string | null
          vehicle_type?: string
          vin_number?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehiclesc_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop: {
        Row: {
          account_no: number | null
          after_hours_number: string | null
          bank_letter: string | null
          bank_name: string | null
          bbbee_expire_date: string | null
          bbbee_level: string | null
          city: string | null
          company_registration_doc: string | null
          created_at: string | null
          fleet_rate: number | null
          franchise: string | null
          hdi_perc: string | null
          id: string
          insurance_company_name: string | null
          insurance_policy_number: number | null
          labour_rate: number | null
          number_of_working_days: number | null
          postal_code: number | null
          province: string | null
          street: string | null
          town: string | null
          trading_name: string | null
          vat_cert_expiry_date: string | null
          vat_certificate: string | null
          vat_number: number | null
          vehicles_type: string[] | null
          work_name: string
          workshop_type: string[] | null
        }
        Insert: {
          account_no?: number | null
          after_hours_number?: string | null
          bank_letter?: string | null
          bank_name?: string | null
          bbbee_expire_date?: string | null
          bbbee_level?: string | null
          city?: string | null
          company_registration_doc?: string | null
          created_at?: string | null
          fleet_rate?: number | null
          franchise?: string | null
          hdi_perc?: string | null
          id?: string
          insurance_company_name?: string | null
          insurance_policy_number?: number | null
          labour_rate?: number | null
          number_of_working_days?: number | null
          postal_code?: number | null
          province?: string | null
          street?: string | null
          town?: string | null
          trading_name?: string | null
          vat_cert_expiry_date?: string | null
          vat_certificate?: string | null
          vat_number?: number | null
          vehicles_type?: string[] | null
          work_name: string
          workshop_type?: string[] | null
        }
        Update: {
          account_no?: number | null
          after_hours_number?: string | null
          bank_letter?: string | null
          bank_name?: string | null
          bbbee_expire_date?: string | null
          bbbee_level?: string | null
          city?: string | null
          company_registration_doc?: string | null
          created_at?: string | null
          fleet_rate?: number | null
          franchise?: string | null
          hdi_perc?: string | null
          id?: string
          insurance_company_name?: string | null
          insurance_policy_number?: number | null
          labour_rate?: number | null
          number_of_working_days?: number | null
          postal_code?: number | null
          province?: string | null
          street?: string | null
          town?: string | null
          trading_name?: string | null
          vat_cert_expiry_date?: string | null
          vat_certificate?: string | null
          vat_number?: number | null
          vehicles_type?: string[] | null
          work_name?: string
          workshop_type?: string[] | null
        }
        Relationships: []
      }
      workshop_assign: {
        Row: {
          created_at: string
          id: number
          job_id: number | null
          workshop_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          job_id?: number | null
          workshop_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          job_id?: number | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_assign_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "workshop_job"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_job_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshop"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_documents: {
        Row: {
          document_type: string
          document_url: string
          id: string
          picture: string | null
          uploaded_at: string | null
          verified: boolean | null
          workshop_id: string | null
        }
        Insert: {
          document_type: string
          document_url: string
          id?: string
          picture?: string | null
          uploaded_at?: string | null
          verified?: boolean | null
          workshop_id?: string | null
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          picture?: string | null
          uploaded_at?: string | null
          verified?: boolean | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_documents_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshop"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_job: {
        Row: {
          client_name: string | null
          client_phone: string | null
          created_at: string
          description: string | null
          id: number
          job_type: string | null
          jobId_workshop: string | null
          location: string | null
          notes: string | null
          registration_no: string | null
          type_of_work: string | null
          vehicle_id: number | null
        }
        Insert: {
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          description?: string | null
          id?: number
          job_type?: string | null
          jobId_workshop?: string | null
          location?: string | null
          notes?: string | null
          registration_no?: string | null
          type_of_work?: string | null
          vehicle_id?: number | null
        }
        Update: {
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          description?: string | null
          id?: number
          job_type?: string | null
          jobId_workshop?: string | null
          location?: string | null
          notes?: string | null
          registration_no?: string | null
          type_of_work?: string | null
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_job_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_tools: {
        Row: {
          category: string
          document_url: string | null
          has_tool: boolean | null
          id: string
          picture: string | null
          tool_name: string
          verified: boolean | null
          workshop_id: string | null
        }
        Insert: {
          category: string
          document_url?: string | null
          has_tool?: boolean | null
          id?: string
          picture?: string | null
          tool_name: string
          verified?: boolean | null
          workshop_id?: string | null
        }
        Update: {
          category?: string
          document_url?: string | null
          has_tool?: boolean | null
          id?: string
          picture?: string | null
          tool_name?: string
          verified?: boolean | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_tools_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshop"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability: "available" | "busy" | "off-duty" | "emergency"
      roles:
        | "driver"
        | "technician"
        | "call centre"
        | "cost centre"
        | "fleet manager"
        | "customer"
      status: "Done" | "Onprogress"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability: ["available", "busy", "off-duty", "emergency"],
      roles: [
        "driver",
        "technician",
        "call centre",
        "cost centre",
        "fleet manager",
        "customer",
      ],
      status: ["Done", "Onprogress"],
    },
  },
} as const
