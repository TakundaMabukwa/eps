const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client
const supabaseUrl = 'https://ihegfiqnobewpwcewrae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZWdmaXFub2Jld3B3Y2V3cmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzAzNjAsImV4cCI6MjA3NTg0NjM2MH0.xaxkB2Br7cQTQRD-PSheiKTY3Rg3jvqsA_pQn1JWS2I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Column mapping from Excel headers to database columns
const columnMapping = {
  // Direct mappings
  'Registration': 'registration_number',
  'Make': 'make',
  'Model': 'model',
  'VehicleYear': 'vehicle_year',
  'VinNumber': 'vin_number',
  'EngineNumber': 'engine_number',
  'VehicleType': 'vehicle_type',
  'Colour': 'colour',
  'VehicleNumber': 'vehicle_number',
  
  // Additional mappings for your new columns
  'Start_timestamp': 'start_timestamp',
  'SpeedoCurrent': 'speedo_current',
  'TranspNo': 'transp_no',
  'TranspDescrip': 'transp_descrip',
  'VehicleCallNumber': 'vehicle_call_number',
  'DriverCode': 'driver_code',
  'VehicleTypeDescrip': 'vehicle_type_descrip',
  'DriverName': 'driver_name',
  'PrivateCell': 'private_cell',
  'SlmnCode': 'slmn_code',
  'LedgerCode': 'ledger_code',
  'LedgerDescription': 'ledger_description',
  'SlmnName': 'slmn_name',
  'VehLocation': 'veh_location',
  'BranchCode': 'branch_code',
  'BranchName': 'branch_name',
  'LicenceDate': 'licence_date',
  'COFDate': 'cof_date',
  'Botswana': 'botswana',
  'Namibia': 'namibia',
  'Hazchem': 'hazchem',
  'VehDormantFlag': 'veh_dormant_flag',
  'VehicleCategory': 'vehicle_category',
  'VehException': 'veh_exception',
  'TrailerNo': 'trailer_no',
  'TrailerName': 'trailer_name',
  'TrailerNo2': 'trailer_no2',
  'TrailerName2': 'trailer_name2',
  'Trailer2Type': 'trailer2_type',
  'TrailerType': 'trailer_type',
  'DriverCodeTwo': 'driver_code_two',
  'DriverNameTwo': 'driver_name_two',
  'VehicleCalled': 'vehicle_called',
  'VehAllocatedFlag': 'veh_allocated_flag',
  'VehDivisionCode': 'veh_division_code',
  'VehDivisionName': 'veh_division_name',
  'VehSpeedoDate': 'veh_speedo_date',
  'VehLoadNo': 'veh_load_no',
  'DrVnoKm': 'dr_vno_km',
  'OffloadNoEmailFlag': 'offload_no_email_flag',
  'AssetNumber': 'asset_number',
  'MinServiceInterval': 'min_service_interval',
  'MinServiceDue': 'min_service_due',
  'VehMinDistance': 'veh_min_distance',
  'GensetCode': 'genset_code',
  'GensetName': 'genset_name',
  'GensetType': 'genset_type',
  'GenLocation': 'gen_location',
  'MajServiceInterval': 'maj_service_interval',
  'MajServiceDue': 'maj_service_due',
  'VehMajDistance': 'veh_maj_distance',
  'ServiceDueFlag': 'service_due_flag',
  'ServiceDueInKms': 'service_due_in_kms',
  'KmBeforeService': 'km_before_service',
  'CellPhonesPrd': 'cell_phones_prd',
  'TrackingPrd': 'tracking_prd',
  'EquipmentPrd': 'equipment_prd',
  'FinesPrd': 'fines_prd',
  'InsurancePrd': 'insurance_prd',
  'LicencesPrd': 'licences_prd',
  'MaintContrPrd': 'maint_contr_prd',
  'PermitsPrd': 'permits_prd',
  'RepairsPrd': 'repairs_prd',
  'TollFeesPrd': 'toll_fees_prd',
  'TyresPrd': 'tyres_prd',
  'VehiclePaymentsPrd': 'vehicle_payments_prd',
  'WagesPrd': 'wages_prd',
  'SpeedoStart': 'speedo_start',
  'HourCurrent': 'hour_current',
  'HourBeforeService': 'hour_before_service',
  'HourServiceInterval': 'hour_service_interval',
  'HourServiceDueAt': 'hour_service_due_at',
  'HourServiceDueIn': 'hour_service_due_in',
  'HourServiceDueFlag': 'hour_service_due_flag',
  'vehprevload': 'veh_prev_load',
  'CBPdate': 'cbp_date',
  'ZimCVGdate': 'zim_cvg_date',
  'Zim3rdPartyDate': 'zim_3rd_party_date',
  'ZimCarbonTaxDate': 'zim_carbon_tax_date',
  'Zam3rdPartyDate': 'zam_3rd_party_date',
  'ZamCarbonTaxDate': 'zam_carbon_tax_date',
  'BotswanaRSLDate': 'botswana_rsl_date',
  'BotswanaRTPDate': 'botswana_rtp_date',
  'PoliceClearanceDate': 'police_clearance_date',
  'Malawi3rdPartyDate': 'malawi_3rd_party_date',
  'Zambia': 'zambia',
  'Zimbabwe': 'zimbabwe',
  'Malawi': 'malawi',
  'VehTripSheetNumber': 'veh_trip_sheet_number',
  'Tare': 'tare',
  'GVM': 'gvm',
  'PDPDate': 'pdp_date',
  'COFMHDate': 'cof_mh_date',
  'Trailer2TypeDesc': 'trailer2_type_desc',
  'TrailerTypeDesc': 'trailer_type_desc',
  'VehControlType': 'veh_control_type',
  'VehControlNo': 'veh_control_no',
  'VehFromScreen': 'veh_from_screen',
  'COFRTDate': 'cof_rt_date',
  'TripSheetNumberLast': 'trip_sheet_number_last',
  'BotswanaExpiryDate': 'botswana_expiry_date',
  'NamibiaExpiryDate': 'namibia_expiry_date',
  'SwazilandExpiryDate': 'swaziland_expiry_date',
  'MozambiqueExpiryDate': 'mozambique_expiry_date',
  'Swaziland': 'swaziland',
  'Mozambique': 'mozambique',
  'VehTare': 'veh_tare',
  'VehComp01MaxQty': 'veh_comp01_max_qty',
  'VehComp02MaxQty': 'veh_comp02_max_qty',
  'VehComp03MaxQty': 'veh_comp03_max_qty',
  'VehComp04MaxQty': 'veh_comp04_max_qty',
  'VehComp05MaxQty': 'veh_comp05_max_qty',
  'VehComp06MaxQty': 'veh_comp06_max_qty',
  'VehComp07MaxQty': 'veh_comp07_max_qty',
  'DRC': 'drc',
  'Lesotho': 'lesotho',
  'ZambiaExpDate': 'zambia_exp_date',
  'DRCExpDate': 'drc_exp_date',
  'ZimbabweExpDate': 'zimbabwe_exp_date',
  'LesothoExpDate': 'lesotho_exp_date',
  'DieselTargetConsumption': 'diesel_target_consumption',
  'DieselRecommendedLitres': 'diesel_recommended_litres',
  'VehEscortFlag': 'veh_escort_flag',
  'VehMinePermit1Date': 'veh_mine_permit1_date',
  'VehMinePermit2Date': 'veh_mine_permit2_date',
  'Angola': 'angola',
  'AngolaExpDate': 'angola_exp_date',
  'departmentcode': 'department_code',
  'departmentname': 'department_name',
  'projectcode': 'project_code',
  'SpeedoStartLoad': 'speedo_start_load',
  'AgreedKm': 'agreed_km'
};

// Data transformation functions
const transformValue = (key, value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Handle boolean values
  if (key.includes('flag') || key === 'botswana' || key === 'namibia' || 
      key === 'hazchem' || key === 'vehicle_called' || key === 'zambia' || 
      key === 'zimbabwe' || key === 'malawi' || key === 'swaziland' || 
      key === 'mozambique' || key === 'drc' || key === 'lesotho' || 
      key === 'angola') {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const str = value.toString().toLowerCase().trim();
      return str === 'true' || str === 'yes' || str === '1' || str === 'y';
    }
    if (typeof value === 'number') return value === 1;
    return false;
  }

  // Handle numeric values (but exclude date fields)
  if ((key.includes('qty') || key.includes('km') || key.includes('kms') || 
      key.includes('distance') || key.includes('interval') || 
      key.includes('consumption') || key.includes('litres') || 
      key.includes('capacity') || key.includes('price') || 
      key.includes('kilometers') || key.includes('numeric') ||
      key === 'speedo_current' || key === 'dr_vno_km' || key === 'min_service_interval' ||
      key === 'veh_min_distance' || key === 'maj_service_interval' || 
      key === 'veh_maj_distance' || key === 'service_due_in_kms' || 
      key === 'km_before_service' || key === 'speedo_start' || key === 'hour_current' ||
      key === 'hour_before_service' || key === 'hour_service_interval' ||
      key === 'hour_service_due_at' || key === 'hour_service_due_in' ||
      key === 'tare' || key === 'gvm' || key === 'veh_tare' ||
      key === 'diesel_target_consumption' || key === 'diesel_recommended_litres' ||
      key === 'speedo_start_load' || key === 'agreed_km') &&
      !(key.includes('date') || key.includes('Date') || key === 'start_timestamp')) {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  // Handle date values
  if (key.includes('date') || key.includes('Date') || key === 'start_timestamp' || 
      key === 'min_service_due' || key === 'maj_service_due') {
    // Check for invalid values first
    if (value === 0 || value === '0' || value === '' || value === null || value === undefined) {
      return null;
    }
    
    // Handle large numbers that should be null for date fields
    if (typeof value === 'number' && (value > 100000 || value < 0)) {
      return null;
    }
    
    if (value instanceof Date) return value;
    
    if (typeof value === 'number') {
      // Skip invalid Excel date numbers (0 or negative)
      if (value <= 0) return null;
      try {
        const date = XLSX.SSF.parse_date_code(value);
        const result = new Date(date.y, date.m - 1, date.d);
        return isNaN(result.getTime()) ? null : result;
      } catch (e) {
        return null;
      }
    }
    
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // Skip obviously invalid date strings
      if (trimmed === '0' || trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || trimmed === '30/12/1899') {
        return null;
      }
      
      // Handle DD/MM/YYYY format
      if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          
          if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
            return null;
          }
          
          const result = new Date(year, month - 1, day);
          return isNaN(result.getTime()) ? null : result;
        }
      }
      
      try {
        const parsed = new Date(trimmed);
        return isNaN(parsed.getTime()) ? null : parsed;
      } catch (e) {
        return null;
      }
    }
    
    return null;
  }

  return value;
};

// Main import function
async function importExcelToSupabase(filePath) {
  try {
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${jsonData.length} rows to import`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const processedRegistrations = new Set();
    
    // Process each row
    for (const row of jsonData) {
      // Skip duplicates
      const registration = row.Registration;
      if (registration && processedRegistrations.has(registration)) {
        console.log(`Skipping duplicate registration: ${registration}`);
        skippedCount++;
        continue;
      }
      if (registration) {
        processedRegistrations.add(registration);
      }
      try {
        const insertData = {};
        
        // Map Excel columns to database columns
        for (const [excelHeader, dbColumn] of Object.entries(columnMapping)) {
          if (row.hasOwnProperty(excelHeader)) {
            const transformedValue = transformValue(dbColumn, row[excelHeader]);
            // Only add non-null values to avoid database errors
            if (transformedValue !== null) {
              insertData[dbColumn] = transformedValue;
            }
          }
        }
        
        // Final cleanup - remove any remaining invalid date values
        Object.keys(insertData).forEach(key => {
          if (key.includes('date') || key.includes('Date') || key === 'start_timestamp') {
            if (insertData[key] === '0' || insertData[key] === 0 || insertData[key] === '' || 
                (typeof insertData[key] === 'string' && insertData[key].trim() === '0')) {
              delete insertData[key];
            }
          }
        });
        
        // Set default values for required fields if not provided
        if (!insertData.registration_number && row.Registration) {
          insertData.registration_number = row.Registration;
        }
        if (!insertData.model && row.Model) {
          insertData.model = row.Model;
        }
        if (!insertData.manufactured_year && row.VehicleYear) {
          insertData.manufactured_year = row.VehicleYear.toString();
        }
        if (!insertData.take_on_kilometers) {
          if (row.SpeedoCurrent) {
            insertData.take_on_kilometers = transformValue('take_on_kilometers', row.SpeedoCurrent);
          } else {
            insertData.take_on_kilometers = 0;
          }
        }
        if (!insertData.service_intervals) {
          insertData.service_intervals = 'standard';
        }
        if (!insertData.colour && row.Colour) {
          insertData.colour = row.Colour;
        } else if (!insertData.colour) {
          insertData.colour = 'Unknown';
        }
        
        // Insert into Supabase
        const { data, error } = await supabase
          .from('vehiclesc')
          .insert(insertData);
        
        if (error) {
          console.error('Error inserting row:', error);
          console.log('Failed data:', JSON.stringify(insertData, null, 2));
          errorCount++;
        } else {
          successCount++;
          console.log(`Successfully inserted vehicle: ${insertData.registration_number || 'Unknown'}`);
        }
      } catch (rowError) {
        console.error('Error processing row:', rowError);
        errorCount++;
      }
    }
    
    console.log(`Import completed: ${successCount} successful, ${errorCount} failed, ${skippedCount} skipped duplicates`);
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Usage
const excelFilePath = 've.xlsx'; // Path to your Excel file
importExcelToSupabase(excelFilePath);