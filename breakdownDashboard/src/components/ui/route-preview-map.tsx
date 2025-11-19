"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route } from 'lucide-react';

interface RoutePreviewMapProps {
  origin: string;
  destination: string;
  routeData?: any;
  stopPoints?: Array<{
    id: number;
    name: string;
    coordinates: number[][];
  }>;
  driverLocation?: {
    lat: number;
    lng: number;
    name: string;
  };
  tripId?: string;
}

export function RoutePreviewMap({ origin, destination, routeData, stopPoints = [], driverLocation, tripId }: RoutePreviewMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!origin || !destination || !mapContainer.current) return;

    const initializeMap = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      if (map.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [28.0473, -26.2041], // Johannesburg center
        zoom: 6
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        updateRoute();
      });
    };

    const updateRoute = async () => {
      if (!map.current || !mapLoaded || !map.current.isStyleLoaded()) return;

      try {
        // Geocode locations
        const [originCoords, destCoords] = await Promise.all([
          geocodeLocation(origin),
          geocodeLocation(destination)
        ]);

        if (!originCoords || !destCoords) return;

        // Add driver location marker if available
        if (driverLocation) {
          new (await import('mapbox-gl')).default.Marker({ color: 'blue' })
            .setLngLat([driverLocation.lng, driverLocation.lat])
            .setPopup(new (await import('mapbox-gl')).default.Popup().setText(`Driver: ${driverLocation.name}`))
            .addTo(map.current);

          // Get route from driver to loading location
          const driverToLoadingRoute = await getRoute(
            { lat: driverLocation.lat, lng: driverLocation.lng },
            originCoords
          );

          if (driverToLoadingRoute && map.current.isStyleLoaded()) {
            if (map.current.getSource('driver-route')) {
              map.current.removeLayer('driver-route');
              map.current.removeSource('driver-route');
            }

            map.current.addSource('driver-route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: driverToLoadingRoute
              }
            });

            map.current.addLayer({
              id: 'driver-route',
              type: 'line',
              source: 'driver-route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#1e40af',
                'line-width': 3,
                'line-dasharray': [2, 2]
              }
            });
          }
        }

        // Add markers
        new (await import('mapbox-gl')).default.Marker({ color: 'green' })
          .setLngLat([originCoords.lng, originCoords.lat])
          .setPopup(new (await import('mapbox-gl')).default.Popup().setText(origin))
          .addTo(map.current);

        new (await import('mapbox-gl')).default.Marker({ color: 'red' })
          .setLngLat([destCoords.lng, destCoords.lat])
          .setPopup(new (await import('mapbox-gl')).default.Popup().setText(destination))
          .addTo(map.current);

        // Add stop point markers
        if (stopPoints && stopPoints.length > 0) {
          const mapboxgl = (await import('mapbox-gl')).default;
          stopPoints.forEach((stopPoint, index) => {
            const coords = stopPoint.coordinates;
            const avgLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
            const avgLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
            
            // Calculate radius from coordinate bounds
            const lngs = coords.map(coord => coord[0]);
            const lats = coords.map(coord => coord[1]);
            const maxLng = Math.max(...lngs);
            const minLng = Math.min(...lngs);
            const maxLat = Math.max(...lats);
            const minLat = Math.min(...lats);
            const radiusKm = Math.max(
              (maxLng - minLng) * 111.32 * Math.cos(avgLat * Math.PI / 180),
              (maxLat - minLat) * 110.54
            ) / 2;
            const radiusMeters = radiusKm * 1000;
            
            // Add circle for stop point radius
            const circleId = `stop-circle-${stopPoint.id}`;
            if (map.current.getSource(circleId)) {
              map.current.removeLayer(circleId);
              map.current.removeSource(circleId);
            }
            
            map.current.addSource(circleId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [avgLng, avgLat]
                }
              }
            });
            
            map.current.addLayer({
              id: circleId,
              type: 'circle',
              source: circleId,
              paint: {
                'circle-radius': {
                  stops: [
                    [0, 0],
                    [20, radiusMeters / 10]
                  ],
                  base: 2
                },
                'circle-color': '#87CEEB',
                'circle-opacity': 0.3,
                'circle-stroke-color': '#4682B4',
                'circle-stroke-width': 2
              }
            });
            
            new mapboxgl.Marker({ color: 'orange' })
              .setLngLat([avgLng, avgLat])
              .setPopup(new mapboxgl.Popup().setText(`Stop ${index + 1}: ${stopPoint.name}`))
              .addTo(map.current);
          });
        }

        // Fetch route from API if tripId is provided, otherwise use routeData or calculate
        let mainRoute = routeData?.geometry;
        
        if (tripId && !mainRoute) {
          try {
            const response = await fetch(`/api/trip-route?tripId=${tripId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.coordinates && data.coordinates.length > 0) {
                mainRoute = {
                  type: 'LineString',
                  coordinates: data.coordinates.map((coord: any) => [coord.longitude, coord.latitude])
                };
              }
            }
          } catch (error) {
            console.error('Error fetching trip route:', error);
          }
        }
        
        if (!mainRoute) {
          mainRoute = await getRoute(originCoords, destCoords, stopPoints);
        }
        
        if (mainRoute && map.current.isStyleLoaded()) {
          // Remove existing route
          if (map.current.getSource('main-route')) {
            map.current.removeLayer('main-route');
            map.current.removeSource('main-route');
          }

          map.current.addSource('main-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: mainRoute
            }
          });

          map.current.addLayer({
            id: 'main-route',
            type: 'line',
            source: 'main-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#10b981',
              'line-width': 5
            }
          });

          // Fit map to all elements
          const coordinates = mainRoute.coordinates;
          const bounds = coordinates.reduce((bounds: any, coord: any) => {
            return bounds.extend(coord);
          }, new (await import('mapbox-gl')).default.LngLatBounds(coordinates[0], coordinates[0]));

          // Include driver location in bounds if available
          if (driverLocation) {
            bounds.extend([driverLocation.lng, driverLocation.lat]);
          }

          map.current.fitBounds(bounds, { padding: 50 });
        }

        // Add stop points if available
        console.log('Stop points to render:', stopPoints);
        if (stopPoints && stopPoints.length > 0) {
          stopPoints.forEach((stopPoint, index) => {
            console.log('Processing stop point:', stopPoint);
            if (stopPoint.coordinates && stopPoint.coordinates.length > 0) {
              // Add stop point zones as polygons
              const sourceId = `stop-point-${stopPoint.id}`;
              const layerId = `stop-point-layer-${stopPoint.id}`;
              
              // Remove existing layers
              if (map.current.getLayer(`${layerId}-border`)) {
                map.current.removeLayer(`${layerId}-border`);
              }
              if (map.current.getLayer(layerId)) {
                map.current.removeLayer(layerId);
              }
              if (map.current.getSource(sourceId)) {
                map.current.removeSource(sourceId);
              }

              console.log('Adding polygon with coordinates:', stopPoint.coordinates);
              if (!map.current.isStyleLoaded()) return;
              map.current.addSource(sourceId, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {
                    name: stopPoint.name
                  },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [stopPoint.coordinates]
                  }
                }
              });

              map.current.addLayer({
                id: layerId,
                type: 'fill',
                source: sourceId,
                paint: {
                  'fill-color': `hsl(${(index * 60) % 360}, 70%, 50%)`,
                  'fill-opacity': 0.4
                }
              });

              // Add border
              map.current.addLayer({
                id: `${layerId}-border`,
                type: 'line',
                source: sourceId,
                paint: {
                  'line-color': `hsl(${(index * 60) % 360}, 70%, 40%)`,
                  'line-width': 2
                }
              });

              // Add popup on click
              map.current.on('click', layerId, async (e: any) => {
                const mapboxgl = (await import('mapbox-gl')).default;
                new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(`<strong>${stopPoint.name}</strong>`)
                  .addTo(map.current);
              });
            }
          });
        }

      } catch (error) {
        console.error('Error updating route:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [origin, destination, routeData, mapLoaded, stopPoints, driverLocation]);

  const geocodeLocation = async (location: string) => {
    try {
      const response = await fetch(
        `/api/mapbox?endpoint=${encodeURIComponent(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json`)}&country=za&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const getRoute = async (origin: any, destination: any, stopPoints: any[] = []) => {
    try {
      // Build coordinates string: origin -> waypoints -> destination
      let coordinates = `${origin.lng},${origin.lat}`;
      
      // Add stop points as waypoints for optimization
      if (stopPoints && stopPoints.length > 0) {
        const waypoints = stopPoints.map(point => {
          const coords = point.coordinates;
          const avgLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
          const avgLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
          return `${avgLng},${avgLat}`;
        });
        
        coordinates += `;${waypoints.join(';')}`;
      }
      
      coordinates += `;${destination.lng},${destination.lat}`;
      
      // Use optimized routing with waypoint optimization
      const endpoint = stopPoints.length > 0 
        ? `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}`
        : `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`;
      
      const response = await fetch(`/api/mapbox?endpoint=${encodeURIComponent(endpoint)}&geometries=geojson`);
      const data = await response.json();
      
      // Handle both optimized trips and regular directions response
      return data.trips?.[0]?.geometry || data.routes?.[0]?.geometry;
    } catch (error) {
      console.error('Route error:', error);
      return null;
    }
  };

  if (!origin || !destination) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Set loading and drop-off locations to preview route</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Route Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainer} 
          className="w-full h-96 rounded-lg border"
          style={{ minHeight: '384px' }}
        />
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Loading: {origin}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Drop-off: {destination}</span>
            </div>
            {stopPoints && stopPoints.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Stop Points: {stopPoints.length} zones</span>
              </div>
            )}
            {driverLocation && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Driver: {driverLocation.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Main Route (Optimized)</span>
            </div>
          </div>
          
          {stopPoints && stopPoints.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Stop Points:</h4>
              <div className="flex flex-wrap gap-2">
                {stopPoints.map((point, index) => (
                  <span 
                    key={point.id} 
                    className="px-2 py-1 text-xs rounded"
                    style={{ 
                      backgroundColor: `hsl(${(index * 60) % 360}, 70%, 90%)`,
                      color: `hsl(${(index * 60) % 360}, 70%, 30%)`
                    }}
                  >
                    {point.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {routeData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Route Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{routeData.route?.distance || routeData.distance || 'Calculating...'} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driving Time:</span>
                    <span className="font-medium">{routeData.route?.duration || routeData.duration || 'Calculating...'} min</span>
                  </div>
                  {(routeData.route?.breakTime || routeData.breakTime || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Break Time:</span>
                      <span className="font-medium text-orange-600">{routeData.route?.breakTime || routeData.breakTime} min</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Total Time:</span>
                    <span className="font-semibold">{routeData.route?.totalDurationWithBreaks || routeData.totalDurationWithBreaks || 'Calculating...'} min</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Provinces</h4>
                {(routeData.route?.provinces || routeData.provinces) && (routeData.route?.provinces || routeData.provinces).length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {(routeData.route?.provinces || routeData.provinces).map((province: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {province}
                        </span>
                      ))}
                    </div>
                    {(routeData.route?.provinces || routeData.provinces).length > 1 && (
                      <div className="text-xs text-orange-600">
                        ⚠️ Inter-provincial route (+15 min break)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs">Analyzing provinces...</div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">ETA</h4>
                <div className="text-sm">
                  {routeData.route?.eta || routeData.eta ? (
                    <div className="font-medium">
                      {new Date(routeData.route?.eta || routeData.eta).toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-gray-500">Calculating ETA...</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}