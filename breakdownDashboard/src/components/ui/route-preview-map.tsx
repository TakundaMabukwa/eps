"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route } from 'lucide-react';

interface RoutePreviewMapProps {
  origin: string;
  destination: string;
  routeData?: any;
}

export function RoutePreviewMap({ origin, destination, routeData }: RoutePreviewMapProps) {
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

        // Add markers
        new (await import('mapbox-gl')).default.Marker({ color: 'green' })
          .setLngLat([originCoords.lng, originCoords.lat])
          .setPopup(new (await import('mapbox-gl')).default.Popup().setText(origin))
          .addTo(map.current);

        new (await import('mapbox-gl')).default.Marker({ color: 'red' })
          .setLngLat([destCoords.lng, destCoords.lat])
          .setPopup(new (await import('mapbox-gl')).default.Popup().setText(destination))
          .addTo(map.current);

        // Get route
        const route = routeData?.geometry || await getRoute(originCoords, destCoords);
        
        if (route && map.current.isStyleLoaded()) {
          // Add route line
          if (map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
          }

          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4
            }
          });

          // Fit map to route
          const coordinates = route.coordinates;
          const bounds = coordinates.reduce((bounds: any, coord: any) => {
            return bounds.extend(coord);
          }, new (await import('mapbox-gl')).default.LngLatBounds(coordinates[0], coordinates[0]));

          map.current.fitBounds(bounds, { padding: 50 });
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
  }, [origin, destination, routeData, mapLoaded]);

  const geocodeLocation = async (location: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=za&limit=1`
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

  const getRoute = async (origin: any, destination: any) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      return data.routes?.[0]?.geometry;
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
          </div>
          
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