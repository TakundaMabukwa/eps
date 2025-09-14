// useCurrentAddress.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export const useCurrentAddress = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoicmVuZGFuaS1kZXYiLCJhIjoiY21kM2c3OXQ4MDJ6MjJqczlqbzNwcDZvaCJ9.6skTnPcXqD7h24o9mfuQnw`;
        const res = await fetch(url);
        const data = await res.json();
        const placeName = data.features[0]?.place_name || 'Unknown location';

        setAddress(placeName);
      } catch (err) {
        setError('Failed to fetch location');
      }
    };

    fetchAddress();
  }, []);

  return { address, error };
};
