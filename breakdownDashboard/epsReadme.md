# EPS (Emergency Positioning System) API Documentation

A comprehensive Node.js system for real-time EPS vehicle tracking, driver reward management, and performance analytics.

## 🚀 Features

- **Real-time Vehicle Tracking** - Live GPS, speed, fuel monitoring
- **Driver Reward System** - Points-based system with bi-weekly caps
- **Fuel Monitoring** - Hex fuel data conversion (level, volume, temperature)
- **Performance Analytics** - Speed compliance, route adherence, safety scores
- **WebSocket Broadcasting** - Real-time data streaming
- **PostgreSQL Storage** - Comprehensive database with UPSERT operations

## 📡 Server Endpoints

### TCP Server
- **Port**: 9002 (configurable via `EPSPORT`)
- **Purpose**: Receives raw EPS tracking data
- **Protocol**: TCP with hex fuel data parsing

### HTTP Server
- **Port**: 8002 (configurable via `EPS_HTTP_PORT`)
- **Purpose**: REST API and WebSocket endpoint

### WebSocket Server
- **Endpoint**: `ws://localhost:8002`
- **Purpose**: Real-time vehicle data broadcasting

## 🌐 API Endpoints

### Vehicle Data Endpoints

#### Get All EPS Vehicles
```bash
GET /api/eps-vehicles
```
**Description**: Returns all EPS vehicles with current status and fuel data
**Response**: Array of vehicle objects with GPS, speed, fuel, and driver information

#### Get Vehicle by Plate
```bash
GET /api/eps-vehicles/by-plate?plate=HY74XFGP
```
**Description**: Returns specific vehicle data by license plate
**Parameters**: 
- `plate` (required) - Vehicle license plate number
**Response**: Single vehicle object or 404 if not found

#### Get Vehicle Count
```bash
GET /api/eps-vehicles/count
```
**Description**: Returns total number of EPS vehicles in system
**Response**: `{ count: number }`

#### Get Active Vehicles
```bash
GET /api/eps-vehicles/active
```
**Description**: Returns vehicles currently driving (speed > 5 or engine ON)
**Response**: Array of active vehicle objects

### Driver Performance Endpoints

#### Get Driver Performance Report
```bash
GET /api/eps-rewards/driver-performance?driverName=HLULANI WITNESS VUKEYA&startDate=2024-01-01&endDate=2024-12-31
```
**Description**: Detailed performance report for specific driver
**Parameters**:
- `driverName` (required) - Full driver name
- `startDate` (required) - Start date (YYYY-MM-DD)
- `endDate` (required) - End date (YYYY-MM-DD)
**Response**: Performance metrics, violations, rewards, efficiency scores

#### Get Fleet Performance Report
```bash
GET /api/eps-rewards/fleet-performance?startDate=2024-01-01&endDate=2024-12-31
```
**Description**: Performance data for all drivers in fleet
**Parameters**:
- `startDate` (required) - Start date (YYYY-MM-DD)
- `endDate` (required) - End date (YYYY-MM-DD)
**Response**: Array of driver performance summaries ordered by total points

#### Get Daily Performance Report
```bash
GET /api/eps-rewards/daily-performance?startDate=2024-01-01&endDate=2024-12-31
```
**Description**: Daily aggregated performance metrics
**Parameters**:
- `startDate` (required) - Start date (YYYY-MM-DD)
- `endDate` (required) - End date (YYYY-MM-DD)
**Response**: Daily breakdown of kilometers, violations, points

#### Get Driver Risk Assessment
```bash
GET /api/eps-rewards/driver-risk-assessment?driverName=HLULANI WITNESS VUKEYA
```
**Description**: Current risk assessment and reward level for driver
**Parameters**:
- `driverName` (required) - Full driver name
**Response**: Risk level, total points, violation counts, current status

### Real-time Data Endpoints

#### Get Latest EPS Data
```bash
GET http://localhost:8002/latest
```
**Description**: Most recent EPS tracking data received by TCP server
**Response**: Latest parsed vehicle data object

#### EPS Server Status
```bash
GET http://localhost:8002/
```
**Description**: Server status and available endpoints
**Response**: Server info, ports, endpoints, timestamp

## 🔄 WebSocket Real-time Updates

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8002');

ws.onmessage = (event) => {
  const vehicleData = JSON.parse(event.data);
  console.log('Real-time vehicle update:', vehicleData);
};
```
**Description**: Receive real-time vehicle updates as TCP data is processed
**Data Format**: Parsed EPS vehicle object with GPS, speed, fuel, driver info

## 🧪 Test Commands

### Vehicle Data
```bash
# Get all vehicles
curl http://localhost:3000/api/eps-vehicles

# Get specific vehicle
curl "http://localhost:3000/api/eps-vehicles/by-plate?plate=HY74XFGP"

# Get vehicle count
curl http://localhost:3000/api/eps-vehicles/count

# Get active vehicles
curl http://localhost:3000/api/eps-vehicles/active
```

### Performance Reports
```bash
# Driver performance
curl "http://localhost:3000/api/eps-rewards/driver-performance?driverName=HLULANI%20WITNESS%20VUKEYA&startDate=2024-01-01&endDate=2024-12-31"

# Fleet performance
curl "http://localhost:3000/api/eps-rewards/fleet-performance?startDate=2024-01-01&endDate=2024-12-31"

# Daily performance
curl "http://localhost:3000/api/eps-rewards/daily-performance?startDate=2024-01-01&endDate=2024-12-31"

# Driver risk assessment
curl "http://localhost:3000/api/eps-rewards/driver-risk-assessment?driverName=HLULANI%20WITNESS%20VUKEYA"
```

### Real-time Data
```bash
# Latest data
curl http://localhost:8002/latest

# Server status
curl http://localhost:8002/
```

## 🗄️ Database Tables

### eps_vehicles
- **Purpose**: Current vehicle status and fuel data
- **Key Fields**: plate, driver_name, speed, GPS coordinates, fuel metrics
- **Update Pattern**: UPSERT (insert once, update after)

### eps_driver_performance
- **Purpose**: Historical performance tracking
- **Key Fields**: speed compliance, route compliance, efficiency, safety scores
- **Aggregation**: Per driver per update

### eps_driver_rewards
- **Purpose**: Driver reward summaries
- **Key Fields**: current_level, total_risk_score, violations_count
- **Levels**: Bronze, Silver, Gold

### eps_daily_stats
- **Purpose**: Daily aggregated statistics
- **Key Fields**: total_distance, driving_hours, violations
- **Aggregation**: Per driver per day

### eps_biweekly_category_points
- **Purpose**: Bi-weekly reward tracking with caps
- **Key Fields**: speed_compliance_cap, harsh_braking_cap, day_driving_cap
- **Reset**: Every 14 days (1st-14th, 15th-end of month)

## 🎯 Reward System

### Categories & Caps (Bi-weekly)
- **Long Haul** (>2500km): Speed 30pts, Braking 10pts, Day 20pts, Night 20pts, Route 20pts
- **Medium Haul** (1500-2500km): Speed 30pts, Braking 10pts, Day 20pts, Night 20pts, Route 20pts  
- **Short Haul** (<1500km): Speed 40pts, Braking 20pts, Day 10pts, Night 10pts, Route 20pts

### Point Awards
- **Speed Compliance** (≤120km/h): 1 point per update
- **Smooth Driving** (no harsh braking): 1 point per update
- **Day Driving** (6AM-10PM): 2 points per update
- **Route Compliance** (on assigned route): 1 point per update

### Performance Levels
- **Gold**: ≥40 points (Best performers)
- **Silver**: 20-39 points (Good performers)
- **Bronze**: <20 points (Needs improvement)

## 🔧 Configuration

### Environment Variables
```env
# EPS Server Ports
EPSPORT=9002
EPS_HTTP_PORT=8002

# Database
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=vehicles
PG_USER=postgres
PG_PASSWORD=12345

# Allowed IPs
ALLOWED_IP1=81.218.55.66
ALLOWED_IP2=212.150.50.68
```

### Fuel Data Processing
- **Hex Conversion**: Positions 3,5,7,9 in comma-separated fuel string
- **Calculations**: Level (÷10), Volume (÷10), Temperature (direct), Percentage (max 100)
- **Bounds Checking**: Prevents database overflow (max 999.99 for numeric(5,2) fields)
- **PTO Status**: Derived from raw temperature values (1004/1007=ON, 1000/1001=OFF)

## 🚨 Error Handling

### Common Issues
- **Numeric Overflow**: Fuel values capped at database limits
- **Missing Driver Names**: Skipped with warning message
- **Invalid Fuel Format**: Logged and skipped
- **Database Errors**: Logged with full error details

### Monitoring
- **Console Logging**: Real-time processing status
- **Database Logging**: Performance and error tracking
- **WebSocket Status**: Connection monitoring

## 📊 Data Flow

1. **TCP Feed** → Raw EPS vehicle data
2. **Parser** → Hex fuel conversion + field mapping
3. **Reward System** → Points calculation + bi-weekly tracking
4. **Database** → UPSERT vehicle data + performance metrics
5. **WebSocket** → Broadcast to connected clients
6. **API** → Serve data to frontend applications

---

**EPS System** - Real-time vehicle tracking and driver reward management 🚚