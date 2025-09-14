import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const LocationScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fullAddress, setFullAddress] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
      console.log('Current Position:', locationData);

      const latitude = locationData.coords.latitude;
      const longitude = locationData.coords.longitude;

      // Mapbox Geocoding API
      const getAddressFromCoords = async (latitude: number, longitude: number) => {
        const accessToken = 'pk.eyJ1IjoicmVuZGFuaS1kZXYiLCJhIjoiY21kM2c3OXQ4MDJ6MjJqczlqbzNwcDZvaCJ9.6skTnPcXqD7h24o9mfuQnw';
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          const address = data.features[0]?.place_name;
          console.log('Mapbox Address:', address);
          return address || null;
        } catch (error) {
          console.error('Error fetching Mapbox address:', error);
          return null;
        }
      };

      // Expo Reverse Geocoding
      // const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      // let expoAddress = '';
      // if (addresses.length > 0) {
      //   const { street, name, city, region, postalCode, country } = addresses[0];
      //   expoAddress = `${name || ''} ${street || ''}, ${city || ''}, ${region || ''} ${postalCode || ''}, ${country || ''}`.trim();
      //   console.log('Expo Location:', expoAddress);
      // } else {
      //   console.log('No Expo address found');
      // }

      // Prefer Mapbox if available
      const mapboxAddress = await getAddressFromCoords(latitude, longitude);
      setFullAddress(mapboxAddress || 'Address not available');

    } catch (error) {
      console.error('Location error:', error);
      setErrorMsg('Error fetching location');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : location ? (
        <View>
          {/* <Text>Latitude: {location.coords.latitude}</Text>
          <Text>Longitude: {location.coords.longitude}</Text> */}
          <Text style={{ fontWeight: 'bold', color: '#E0E0E0' }}>Address: {fullAddress}</Text>
        </View>
      ) : (
        <Text>Fetching location...</Text>
      )}
    </View>
  );
};

export default LocationScreen;
