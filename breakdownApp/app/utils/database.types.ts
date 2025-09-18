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
      client_quotes: {
        Row: {
          access_requirements: string | null
          account_id: string | null
          actual_cost: number | null
          actual_duration_hours: number | null
          after_photos: Json | null
          assigned_technician_id: string | null
          before_photos: Json | null
          completion_date: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_feedback: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_satisfaction_rating: number | null
          customer_signature_obtained: boolean | null
          documents: Json | null
          due_date: string | null
          end_time: string | null
          equipment_used: Json | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          ip_address: string | null
          job_date: string | null
          job_description: string | null
          job_location: string | null
          job_number: string
          job_status: string | null
          job_type: string
          latitude: number | null
          longitude: number | null
          new_account_number: string | null
          odormeter: string | null
          parts_required: Json | null
          priority: string | null
          products_required: Json | null
          purchase_type: string | null
          qr_code: string | null
          quality_check_passed: boolean | null
          quotation_job_type: string | null
          quotation_number: string | null
          quotation_products: Json | null
          quotation_subtotal: number | null
          quotation_total_amount: number | null
          quotation_vat_amount: number | null
          quote_date: string | null
          quote_email_body: string | null
          quote_email_footer: string | null
          quote_email_subject: string | null
          quote_expiry_date: string | null
          quote_notes: string | null
          quote_status: string | null
          quote_type: string | null
          role: string | null
          safety_checklist_completed: boolean | null
          site_contact_person: string | null
          site_contact_phone: string | null
          special_instructions: string | null
          start_time: string | null
          status: string | null
          technician_name: string | null
          technician_phone: string | null
          temporary_registration: string | null
          updated_at: string | null
          updated_by: string | null
          vehicle_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_registration: string | null
          vehicle_year: number | null
          vin_number: string | null
          work_notes: string | null
        }
        Insert: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number: string
          job_status?: string | null
          job_type: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_number?: string | null
          work_notes?: string | null
        }
        Update: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number?: string
          job_status?: string | null
          job_type?: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_number?: string | null
          work_notes?: string | null
        }
        Relationships: []
      }
      client_stock: {
        Row: {
          code: string | null
          cost_excl_vat_zar: string | null
          created_at: string | null
          description: string | null
          id: number
          quantity: string | null
          stock_type: string | null
          supplier: string | null
          total_value: string | null
          USD: string | null
        }
        Insert: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          quantity?: string | null
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Update: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          quantity?: string | null
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
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
      cost_centers: {
        Row: {
          branch: string | null
          company: string | null
          cost_code: string | null
          created_at: string
          id: number
          new_account_number: string | null
        }
        Insert: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
        }
        Update: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
        }
        Relationships: []
      }
      cust_quotes: {
        Row: {
          cash_discount: number
          cash_price: number
          created_at: string
          customer_address: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          description: string | null
          extra_notes: string | null
          id: string
          installation_discount: number
          installation_price: number | null
          job_type: string
          product_name: string | null
          quantity: number
          rental_discount: number
          rental_price: number
          selected_stock: string | null
          selected_vehicles: string | null
          status: string
          stock_received: string | null
          stock_type: string | null
          subtotal: number
          terms_conditions: string
          total_amount: number
          vat_amount: number
        }
        Insert: {
          cash_discount?: number
          cash_price?: number
          created_at?: string
          customer_address?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          description?: string | null
          extra_notes?: string | null
          id?: string
          installation_discount?: number
          installation_price?: number | null
          job_type: string
          product_name?: string | null
          quantity?: number
          rental_discount?: number
          rental_price?: number
          selected_stock?: string | null
          selected_vehicles?: string | null
          status?: string
          stock_received?: string | null
          stock_type?: string | null
          subtotal?: number
          terms_conditions?: string
          total_amount?: number
          vat_amount?: number
        }
        Update: {
          cash_discount?: number
          cash_price?: number
          created_at?: string
          customer_address?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          description?: string | null
          extra_notes?: string | null
          id?: string
          installation_discount?: number
          installation_price?: number | null
          job_type?: string
          product_name?: string | null
          quantity?: number
          rental_discount?: number
          rental_price?: number
          selected_stock?: string | null
          selected_vehicles?: string | null
          status?: string
          stock_received?: string | null
          stock_type?: string | null
          subtotal?: number
          terms_conditions?: string
          total_amount?: number
          vat_amount?: number
        }
        Relationships: []
      }
      customer_call_metrics: {
        Row: {
          avg_minutes: number | null
          avg_seconds: number | null
          created_at: string | null
          customer: string
          id: string
          max_minutes: number | null
          max_seconds: number | null
          min_minutes: number | null
          min_seconds: number | null
          stops: number | null
        }
        Insert: {
          avg_minutes?: number | null
          avg_seconds?: number | null
          created_at?: string | null
          customer: string
          id?: string
          max_minutes?: number | null
          max_seconds?: number | null
          min_minutes?: number | null
          min_seconds?: number | null
          stops?: number | null
        }
        Update: {
          avg_minutes?: number | null
          avg_seconds?: number | null
          created_at?: string | null
          customer?: string
          id?: string
          max_minutes?: number | null
          max_seconds?: number | null
          min_minutes?: number | null
          min_seconds?: number | null
          stops?: number | null
        }
        Relationships: []
      }
      customer_quotes: {
        Row: {
          access_requirements: string | null
          account_id: string | null
          actual_cost: number | null
          actual_duration_hours: number | null
          after_photos: Json | null
          assigned_technician_id: string | null
          before_photos: Json | null
          completion_date: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_feedback: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_satisfaction_rating: number | null
          customer_signature_obtained: boolean | null
          documents: Json | null
          due_date: string | null
          end_time: string | null
          equipment_used: Json | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          ip_address: string | null
          job_date: string | null
          job_description: string | null
          job_location: string | null
          job_number: string
          job_status: string | null
          job_type: string
          latitude: number | null
          longitude: number | null
          new_account_number: string | null
          odormeter: string | null
          parts_required: Json | null
          priority: string | null
          products_required: Json | null
          purchase_type: string | null
          qr_code: string | null
          quality_check_passed: boolean | null
          quotation_job_type: string | null
          quotation_number: string | null
          quotation_products: Json | null
          quotation_subtotal: number | null
          quotation_total_amount: number | null
          quotation_vat_amount: number | null
          quote_date: string | null
          quote_email_body: string | null
          quote_email_footer: string | null
          quote_email_subject: string | null
          quote_expiry_date: string | null
          quote_notes: string | null
          quote_status: string | null
          quote_type: string | null
          role: string | null
          safety_checklist_completed: boolean | null
          site_contact_person: string | null
          site_contact_phone: string | null
          special_instructions: string | null
          start_time: string | null
          status: string | null
          technician_name: string | null
          technician_phone: string | null
          temporary_registration: string | null
          updated_at: string | null
          updated_by: string | null
          vehicle_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_registration: string | null
          vehicle_year: number | null
          vin_number: string | null
          work_notes: string | null
        }
        Insert: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number: string
          job_status?: string | null
          job_type: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_number?: string | null
          work_notes?: string | null
        }
        Update: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number?: string
          job_status?: string | null
          job_type?: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_number?: string | null
          work_notes?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          acc_contact: string | null
          account_number: string | null
          accounts_status: string | null
          annual_billing_run_date: string | null
          beame_list_name: string | null
          branch_person: string | null
          branch_person_email: string | null
          branch_person_number: string | null
          category: string | null
          cell_no: string | null
          company: string | null
          count_of_products: string | null
          created_at: string
          creator: string | null
          date_added: string | null
          date_modified: string | null
          divisions: string | null
          email: string | null
          holding_company: string | null
          id: number
          last_updated: string | null
          legal_name: string | null
          modified_by: string | null
          new_account_number: string | null
          payment_terms: string | null
          physical_address_1: string | null
          physical_address_2: string | null
          physical_address_3: string | null
          physical_area: string | null
          physical_code: string | null
          physical_country: string | null
          physical_province: string | null
          postal_address_1: string | null
          postal_address_2: string | null
          postal_area: string | null
          postal_code: string | null
          postal_country: string | null
          postal_province: string | null
          registration_number: string | null
          sales_rep: string | null
          send_accounts_to_contact: string | null
          send_accounts_to_email_for_statements_and_multibilling: string | null
          skylink_name: string | null
          switchboard: string | null
          trading_name: string | null
          vat_exempt_number: string | null
          vat_number: string | null
        }
        Insert: {
          acc_contact?: string | null
          account_number?: string | null
          accounts_status?: string | null
          annual_billing_run_date?: string | null
          beame_list_name?: string | null
          branch_person?: string | null
          branch_person_email?: string | null
          branch_person_number?: string | null
          category?: string | null
          cell_no?: string | null
          company?: string | null
          count_of_products?: string | null
          created_at?: string
          creator?: string | null
          date_added?: string | null
          date_modified?: string | null
          divisions?: string | null
          email?: string | null
          holding_company?: string | null
          id?: number
          last_updated?: string | null
          legal_name?: string | null
          modified_by?: string | null
          new_account_number?: string | null
          payment_terms?: string | null
          physical_address_1?: string | null
          physical_address_2?: string | null
          physical_address_3?: string | null
          physical_area?: string | null
          physical_code?: string | null
          physical_country?: string | null
          physical_province?: string | null
          postal_address_1?: string | null
          postal_address_2?: string | null
          postal_area?: string | null
          postal_code?: string | null
          postal_country?: string | null
          postal_province?: string | null
          registration_number?: string | null
          sales_rep?: string | null
          send_accounts_to_contact?: string | null
          send_accounts_to_email_for_statements_and_multibilling?: string | null
          skylink_name?: string | null
          switchboard?: string | null
          trading_name?: string | null
          vat_exempt_number?: string | null
          vat_number?: string | null
        }
        Update: {
          acc_contact?: string | null
          account_number?: string | null
          accounts_status?: string | null
          annual_billing_run_date?: string | null
          beame_list_name?: string | null
          branch_person?: string | null
          branch_person_email?: string | null
          branch_person_number?: string | null
          category?: string | null
          cell_no?: string | null
          company?: string | null
          count_of_products?: string | null
          created_at?: string
          creator?: string | null
          date_added?: string | null
          date_modified?: string | null
          divisions?: string | null
          email?: string | null
          holding_company?: string | null
          id?: number
          last_updated?: string | null
          legal_name?: string | null
          modified_by?: string | null
          new_account_number?: string | null
          payment_terms?: string | null
          physical_address_1?: string | null
          physical_address_2?: string | null
          physical_address_3?: string | null
          physical_area?: string | null
          physical_code?: string | null
          physical_country?: string | null
          physical_province?: string | null
          postal_address_1?: string | null
          postal_address_2?: string | null
          postal_area?: string | null
          postal_code?: string | null
          postal_country?: string | null
          postal_province?: string | null
          registration_number?: string | null
          sales_rep?: string | null
          send_accounts_to_contact?: string | null
          send_accounts_to_email_for_statements_and_multibilling?: string | null
          skylink_name?: string | null
          switchboard?: string | null
          trading_name?: string | null
          vat_exempt_number?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      customers_grouped: {
        Row: {
          all_account_numbers: string | null
          all_new_account_numbers: string | null
          company_group: string | null
          cost_code: string | null
          created_at: string
          id: number
          legal_names: string | null
        }
        Insert: {
          all_account_numbers?: string | null
          all_new_account_numbers?: string | null
          company_group?: string | null
          cost_code?: string | null
          created_at?: string
          id?: never
          legal_names?: string | null
        }
        Update: {
          all_account_numbers?: string | null
          all_new_account_numbers?: string | null
          company_group?: string | null
          cost_code?: string | null
          created_at?: string
          id?: never
          legal_names?: string | null
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
          category: string | null
          checklist: Json
          created_at: string | null
          driver_id: number | null
          id: number
          inspection_date: string | null
          odo_reading: number
          overall_status: string | null
          remarks: string | null
          vehicle_id: number
        }
        Insert: {
          category?: string | null
          checklist: Json
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspection_date?: string | null
          odo_reading: number
          overall_status?: string | null
          remarks?: string | null
          vehicle_id: number
        }
        Update: {
          category?: string | null
          checklist?: Json
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspection_date?: string | null
          odo_reading?: number
          overall_status?: string | null
          remarks?: string | null
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspection_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          category: string | null
          checklist: Json
          created_at: string | null
          driver_id: number | null
          id: number
          inspection_date: string | null
          odo_reading: number
          overall_status: string | null
          remarks: string | null
          vehicle_id: number
        }
        Insert: {
          category?: string | null
          checklist: Json
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspection_date?: string | null
          odo_reading: number
          overall_status?: string | null
          remarks?: string | null
          vehicle_id: number
        }
        Update: {
          category?: string | null
          checklist?: Json
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspection_date?: string | null
          odo_reading?: number
          overall_status?: string | null
          remarks?: string | null
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          account_number: string | null
          comment: string | null
          company: string | null
          count: number | null
          group_name: string | null
          id: number
          ip_address: string | null
          new_registration: boolean | null
          product: string | null
          product_code: string | null
          soltrack: string | null
        }
        Insert: {
          account_number?: string | null
          comment?: string | null
          company?: string | null
          count?: number | null
          group_name?: string | null
          id?: number
          ip_address?: string | null
          new_registration?: boolean | null
          product?: string | null
          product_code?: string | null
          soltrack?: string | null
        }
        Update: {
          account_number?: string | null
          comment?: string | null
          company?: string | null
          count?: number | null
          group_name?: string | null
          id?: number
          ip_address?: string | null
          new_registration?: boolean | null
          product?: string | null
          product_code?: string | null
          soltrack?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          line_total: number
          product_id: string | null
          quantity: number
          unit_price: number
          vat_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          line_total: number
          product_id?: string | null
          quantity: number
          unit_price: number
          vat_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          line_total?: number
          product_id?: string | null
          quantity?: number
          unit_price?: number
          vat_amount?: number
        }
        Relationships: []
      }
      job_cards: {
        Row: {
          access_requirements: string | null
          account_id: string | null
          actual_cost: number | null
          actual_duration_hours: number | null
          after_photos: Json | null
          assigned_technician_id: string | null
          before_photos: Json | null
          completion_date: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_feedback: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_satisfaction_rating: number | null
          customer_signature_obtained: boolean | null
          documents: Json | null
          due_date: string | null
          end_time: string | null
          equipment_used: Json | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          ip_address: string | null
          job_date: string | null
          job_description: string | null
          job_location: string | null
          job_number: string
          job_status: string | null
          job_type: string
          latitude: number | null
          longitude: number | null
          new_account_number: string | null
          odormeter: string | null
          parts_required: Json | null
          priority: string | null
          products_required: Json | null
          purchase_type: string | null
          qr_code: string | null
          quality_check_passed: boolean | null
          quotation_job_type: string | null
          quotation_number: string | null
          quotation_products: Json | null
          quotation_subtotal: number | null
          quotation_total_amount: number | null
          quotation_vat_amount: number | null
          quote_date: string | null
          quote_email_body: string | null
          quote_email_footer: string | null
          quote_email_subject: string | null
          quote_expiry_date: string | null
          quote_notes: string | null
          quote_status: string | null
          quote_type: string | null
          repair: boolean | null
          role: string | null
          safety_checklist_completed: boolean | null
          site_contact_person: string | null
          site_contact_phone: string | null
          special_instructions: string | null
          start_time: string | null
          status: string | null
          technician_name: string | null
          technician_phone: string | null
          temporary_registration: string | null
          updated_at: string | null
          updated_by: string | null
          vehicle_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_registration: string | null
          vehicle_year: number | null
          vin_numer: string | null
          work_notes: string | null
        }
        Insert: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number: string
          job_status?: string | null
          job_type: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          repair?: boolean | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_numer?: string | null
          work_notes?: string | null
        }
        Update: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number?: string
          job_status?: string | null
          job_type?: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          repair?: boolean | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_numer?: string | null
          work_notes?: string | null
        }
        Relationships: []
      }
      late_vehicles: {
        Row: {
          account_number: string | null
          beame_1: string | null
          beame_2: string | null
          beame_3: string | null
          company: string | null
          id: number
          ip_address: string | null
          loan: boolean | null
          loan_return_date: string | null
          new_account_number: string
          plate: string | null
          reason: string | null
          return_time: string | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          account_number?: string | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          id?: number
          ip_address?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          new_account_number: string
          plate?: string | null
          reason?: string | null
          return_time?: string | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          account_number?: string | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          id?: number
          ip_address?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          new_account_number?: string
          plate?: string | null
          reason?: string | null
          return_time?: string | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: []
      }
      late_vehicles_reports: {
        Row: {
          beame_1: string | null
          beame_2: string | null
          beame_3: string | null
          company: string | null
          created_at: string | null
          id: number
          ip_address: string | null
          new_account_number: string
          plate: string | null
          reason: string | null
          return_time: string | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          created_at?: string | null
          id?: number
          ip_address?: string | null
          new_account_number: string
          plate?: string | null
          reason?: string | null
          return_time?: string | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          created_at?: string | null
          id?: number
          ip_address?: string | null
          new_account_number?: string
          plate?: string | null
          reason?: string | null
          return_time?: string | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: []
      }
      level_3_cost_centers: {
        Row: {
          branch: string | null
          company: string | null
          cost_code: string | null
          cost_codes: string | null
          created_at: string
          id: number
          new_account_number: string | null
          parent_cost_code: string | null
          sub_branch: string | null
        }
        Insert: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
        }
        Update: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
        }
        Relationships: []
      }
      level_4_cost_centers: {
        Row: {
          branch: string | null
          company: string | null
          cost_code: string | null
          cost_codes: string | null
          created_at: string
          id: number
          new_account_number: string | null
          parent_cost_code: string | null
          sub_branch: string | null
        }
        Insert: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
        }
        Update: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
        }
        Relationships: []
      }
      level_5_cost_centers: {
        Row: {
          branch: string | null
          company: string | null
          cost_code: string | null
          cost_codes: string | null
          created_at: string
          id: number
          new_account_number: string | null
          parent_cost_code: string | null
          sub_branch: string | null
        }
        Insert: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
        }
        Update: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
        }
        Relationships: []
      }
      live_vehicle_data: {
        Row: {
          account_number: string | null
          address: string | null
          beame_1: string | null
          beame_2: string | null
          beame_3: string | null
          company: string | null
          drivername: string | null
          geozone: string | null
          head: string | null
          id: number
          ip_address: string | null
          latitude: string | null
          loan: boolean | null
          loan_return_date: string | null
          loctime: string | null
          longitude: string | null
          mileage: string | null
          nameevent: string | null
          new_account_number: string
          plate: string | null
          pocsagstr: string | null
          quality: string | null
          speed: string | null
          temperature: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          drivername?: string | null
          geozone?: string | null
          head?: string | null
          id?: number
          ip_address?: string | null
          latitude?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          loctime?: string | null
          longitude?: string | null
          mileage?: string | null
          nameevent?: string | null
          new_account_number: string
          plate?: string | null
          pocsagstr?: string | null
          quality?: string | null
          speed?: string | null
          temperature?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          drivername?: string | null
          geozone?: string | null
          head?: string | null
          id?: number
          ip_address?: string | null
          latitude?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          loctime?: string | null
          longitude?: string | null
          mileage?: string | null
          nameevent?: string | null
          new_account_number?: string
          plate?: string | null
          pocsagstr?: string | null
          quality?: string | null
          speed?: string | null
          temperature?: string | null
        }
        Relationships: []
      }
      mac_steel: {
        Row: {
          company: string | null
          created_at: string
          entry_exit_points: Json | null
          exit_time: string | null
          geozone: string | null
          id: number
          new_account_number: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          entry_exit_points?: Json | null
          exit_time?: string | null
          geozone?: string | null
          id?: number
          new_account_number?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          entry_exit_points?: Json | null
          exit_time?: string | null
          geozone?: string | null
          id?: number
          new_account_number?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          first_month: number | null
          id: number
          new_account_number: string | null
          overdue: number | null
          payment_reference: string | null
          second_month: number | null
          third_month: number | null
          total_amount: number | null
        }
        Insert: {
          amount_due?: number | null
          created_at?: string
          due_date?: string | null
          first_month?: number | null
          id?: number
          new_account_number?: string | null
          overdue?: number | null
          payment_reference?: string | null
          second_month?: number | null
          third_month?: number | null
          total_amount?: number | null
        }
        Update: {
          amount_due?: number | null
          created_at?: string
          due_date?: string | null
          first_month?: number | null
          id?: number
          new_account_number?: string | null
          overdue?: number | null
          payment_reference?: string | null
          second_month?: number | null
          third_month?: number | null
          total_amount?: number | null
        }
        Relationships: []
      }
      product_items: {
        Row: {
          category: string
          description: string | null
          discount: number | null
          id: string
          installation: number | null
          price: number
          product: string
          quantity: number | null
          rental: number | null
          subscription: number | null
          type: string
        }
        Insert: {
          category: string
          description?: string | null
          discount?: number | null
          id?: string
          installation?: number | null
          price: number
          product: string
          quantity?: number | null
          rental?: number | null
          subscription?: number | null
          type: string
        }
        Update: {
          category?: string
          description?: string | null
          discount?: number | null
          id?: string
          installation?: number | null
          price?: number
          product?: string
          quantity?: number | null
          rental?: number | null
          subscription?: number | null
          type?: string
        }
        Relationships: []
      }
      quote_products: {
        Row: {
          cash_discount: number
          cash_price: number
          created_at: string
          date: string | null
          discount: number | null
          id: string
          installation_discount: number
          installation_price: number | null
          open: boolean | null
          parts_assigned: string[] | null
          product_name: string
          quantity: number
          quote_id: string
          rental_discount: number
          rental_price: number
          role: string | null
          subtotal: number
          technician: string | null
          time: string | null
          vehicle: string[] | null
        }
        Insert: {
          cash_discount?: number
          cash_price?: number
          created_at?: string
          date?: string | null
          discount?: number | null
          id?: string
          installation_discount?: number
          installation_price?: number | null
          open?: boolean | null
          parts_assigned?: string[] | null
          product_name: string
          quantity?: number
          quote_id: string
          rental_discount?: number
          rental_price?: number
          role?: string | null
          subtotal?: number
          technician?: string | null
          time?: string | null
          vehicle?: string[] | null
        }
        Update: {
          cash_discount?: number
          cash_price?: number
          created_at?: string
          date?: string | null
          discount?: number | null
          id?: string
          installation_discount?: number
          installation_price?: number | null
          open?: boolean | null
          parts_assigned?: string[] | null
          product_name?: string
          quantity?: number
          quote_id?: string
          rental_discount?: number
          rental_price?: number
          role?: string | null
          subtotal?: number
          technician?: string | null
          time?: string | null
          vehicle?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_products_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "cust_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_jobs: {
        Row: {
          created_at: string
          custome_email: string | null
          customer_name: string | null
          id: number
          notes: string | null
        }
        Insert: {
          created_at?: string
          custome_email?: string | null
          customer_name?: string | null
          id?: number
          notes?: string | null
        }
        Update: {
          created_at?: string
          custome_email?: string | null
          customer_name?: string | null
          id?: number
          notes?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          account_number: string | null
          created_at: string
          daily: boolean | null
          id: number
          loan: boolean | null
          loan_return_date: string | null
          month: string | null
          monthly: boolean | null
          new_account_number: string | null
          url: string | null
          weekly: boolean | null
        }
        Insert: {
          account_number?: string | null
          created_at?: string
          daily?: boolean | null
          id?: number
          loan?: boolean | null
          loan_return_date?: string | null
          month?: string | null
          monthly?: boolean | null
          new_account_number?: string | null
          url?: string | null
          weekly?: boolean | null
        }
        Update: {
          account_number?: string | null
          created_at?: string
          daily?: boolean | null
          id?: number
          loan?: boolean | null
          loan_return_date?: string | null
          month?: string | null
          monthly?: boolean | null
          new_account_number?: string | null
          url?: string | null
          weekly?: boolean | null
        }
        Relationships: []
      }
      stock: {
        Row: {
          code: string | null
          cost_excl_vat_zar: string | null
          created_at: string | null
          description: string | null
          id: number
          quantity: string | null
          stock_type: string | null
          supplier: string | null
          total_value: string | null
          USD: string | null
        }
        Insert: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          quantity?: string | null
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Update: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          quantity?: string | null
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Relationships: []
      }
      stock_orders: {
        Row: {
          approved: boolean | null
          created_at: string | null
          created_by: string | null
          id: number
          invoice_link: string | null
          notes: string | null
          order_date: string | null
          order_items: Json
          order_number: string
          status: string | null
          supplier: string | null
          total_amount_ex_vat: number
          total_amount_usd: number | null
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: number
          invoice_link?: string | null
          notes?: string | null
          order_date?: string | null
          order_items?: Json
          order_number: string
          status?: string | null
          supplier?: string | null
          total_amount_ex_vat: number
          total_amount_usd?: number | null
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: number
          invoice_link?: string | null
          notes?: string | null
          order_date?: string | null
          order_items?: Json
          order_number?: string
          status?: string | null
          supplier?: string | null
          total_amount_ex_vat?: number
          total_amount_usd?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_payments: {
        Row: {
          amount: number | null
          created_at: string
          id: number
          order_number: string | null
          payment_reference: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          order_number?: string | null
          payment_reference?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
          order_number?: string | null
          payment_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_payments_order_number_fkey"
            columns: ["order_number"]
            isOneToOne: false
            referencedRelation: "stock_orders"
            referencedColumns: ["order_number"]
          },
        ]
      }
      stock_pricing: {
        Row: {
          code: string | null
          cost_excl_vat_zar: string | null
          created_at: string | null
          description: string | null
          id: number
          stock_type: string | null
          supplier: string | null
          total_value: string | null
          USD: string | null
        }
        Insert: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Update: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Relationships: []
      }
      systems: {
        Row: {
          created_at: string
          id: number
          system_name: string | null
          system_url: string | null
          users: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          system_name?: string | null
          system_url?: string | null
          users?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          system_name?: string | null
          system_url?: string | null
          users?: Json | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          admin: boolean | null
          color_code: string | null
          created_at: string
          email: string | null
          id: number
          name: string | null
        }
        Insert: {
          admin?: boolean | null
          color_code?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          admin?: boolean | null
          color_code?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_login: boolean | null
          id: string
          permissions: Json | null
          role: string | null
          tech_admin: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          first_login?: boolean | null
          id: string
          permissions?: Json | null
          role?: string | null
          tech_admin?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          first_login?: boolean | null
          id?: string
          permissions?: Json | null
          role?: string | null
          tech_admin?: boolean | null
        }
        Relationships: []
      }
      vehicle_inspections: {
        Row: {
          created_at: string | null
          driver_id: number | null
          id: number
          inspected: boolean
          inspection_date: string | null
          type: string | null
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
          type?: string | null
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
          type?: string | null
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
      vehicle_invoices: {
        Row: {
          "2nd_month": number | null
          "3rd_month": number | null
          account_number: string | null
          active: boolean | null
          amount_due: string | null
          beame: string | null
          beame_2: string | null
          beame_3: string | null
          company: string | null
          doc_no: string | null
          group_name: string | null
          id: number
          ip_address: string | null
          loan: boolean | null
          loan_return_date: string | null
          new_account_number: string | null
          one_month: number | null
          stock_code: string | null
          stock_description: string | null
          total_ex_vat: string | null
          total_incl_vat: string | null
          total_vat: string | null
        }
        Insert: {
          "2nd_month"?: number | null
          "3rd_month"?: number | null
          account_number?: string | null
          active?: boolean | null
          amount_due?: string | null
          beame?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          doc_no?: string | null
          group_name?: string | null
          id?: number
          ip_address?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          new_account_number?: string | null
          one_month?: number | null
          stock_code?: string | null
          stock_description?: string | null
          total_ex_vat?: string | null
          total_incl_vat?: string | null
          total_vat?: string | null
        }
        Update: {
          "2nd_month"?: number | null
          "3rd_month"?: number | null
          account_number?: string | null
          active?: boolean | null
          amount_due?: string | null
          beame?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          doc_no?: string | null
          group_name?: string | null
          id?: number
          ip_address?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          new_account_number?: string | null
          one_month?: number | null
          stock_code?: string | null
          stock_description?: string | null
          total_ex_vat?: string | null
          total_incl_vat?: string | null
          total_vat?: string | null
        }
        Relationships: []
      }
      vehicle_logs: {
        Row: {
          cost_center: string | null
          created_at: string
          driver_name: string | null
          id: number
          status: string | null
          vehicle_registration: string | null
        }
        Insert: {
          cost_center?: string | null
          created_at?: string
          driver_name?: string | null
          id?: number
          status?: string | null
          vehicle_registration?: string | null
        }
        Update: {
          cost_center?: string | null
          created_at?: string
          driver_name?: string | null
          id?: number
          status?: string | null
          vehicle_registration?: string | null
        }
        Relationships: []
      }
      vehicles_ip: {
        Row: {
          account_number: string | null
          active: boolean | null
          beame_1: string | null
          beame_2: string | null
          beame_3: string | null
          branch: string | null
          comment: string | null
          company: string | null
          cost_code: string | null
          group_name: string | null
          id: number
          ip_address: string | null
          loan: boolean | null
          loan_return_date: string | null
          new_account_number: string
          new_registration: string | null
          products: Json[]
          vin_number: string | null
        }
        Insert: {
          account_number?: string | null
          active?: boolean | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          branch?: string | null
          comment?: string | null
          company?: string | null
          cost_code?: string | null
          group_name?: string | null
          id?: number
          ip_address?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          new_account_number: string
          new_registration?: string | null
          products?: Json[]
          vin_number?: string | null
        }
        Update: {
          account_number?: string | null
          active?: boolean | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          branch?: string | null
          comment?: string | null
          company?: string | null
          cost_code?: string | null
          group_name?: string | null
          id?: number
          ip_address?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          new_account_number?: string
          new_registration?: string | null
          products?: Json[]
          vin_number?: string | null
        }
        Relationships: []
      }
      vehiclesc: {
        Row: {
          boarding_km_hours: number | null
          colour: string
          company_id: number | null
          cost_centres: string | null
          created_at: string | null
          created_by: string | null
          driver_id: number | null
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
          status: string | null
          sub_model: string | null
          take_on_kilometers: number
          tank_capacity: number | null
          tech_id: number | null
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
          company_id?: number | null
          cost_centres?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: number | null
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
          status?: string | null
          sub_model?: string | null
          take_on_kilometers: number
          tank_capacity?: number | null
          tech_id?: number | null
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
          company_id?: number | null
          cost_centres?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: number | null
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
          status?: string | null
          sub_model?: string | null
          take_on_kilometers?: number
          tank_capacity?: number | null
          tech_id?: number | null
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehiclesc_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_job_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quotation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      reset_loan_vehicles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      update_payment_months: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_payment_months_once: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
