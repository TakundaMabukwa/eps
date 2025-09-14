// import Geolocation from '@react-native-community/geolocation';
// import MapboxGL from '@rnmapbox/maps';
// import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View } from 'react-native';

// MapboxGL.setAccessToken('pk.eyJ1IjoicmVuZGFuaS1kZXYiLCJhIjoiY21kM2c3OXQ4MDJ6MjJqczlqbzNwcDZvaCJ9.6skTnPcXqD7h24o9mfuQnw');

// export default function MapboxExample() {
//   const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

//   useEffect(() => {
//     Geolocation.getCurrentPosition(
//       (position) => {
//         setCurrentLocation([position.coords.longitude, position.coords.latitude]);
//       },
//       (error) => console.log(error),
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//     );
//   }, []);

//   // Simple function to estimate distance between two coordinates in km (Haversine formula)
//   function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
//     const R = 6371; // Earth radius km
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) *
//         Math.cos((lat2 * Math.PI) / 180) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   }

//   // Example other location to compare against
//   const otherLocation = [-73.985664, 40.748514]; // Example: NYC lat/lon

//   const distanceKm = currentLocation
//     ? getDistanceFromLatLonInKm(currentLocation[1], currentLocation[0], otherLocation[1], otherLocation[0])
//     : null;

//   // Rough estimate assuming average speed 50km/h
//   const estimatedTimeMinutes = distanceKm ? (distanceKm / 50) * 60 : null;

//   return (
//     <View style={styles.page}>
//       <MapboxGL.MapView style={styles.map}>
//         <MapboxGL.UserLocation visible={true} />
//         {currentLocation && (
//           <MapboxGL.Camera zoomLevel={12} centerCoordinate={currentLocation} />
//         )}
//         <MapboxGL.PointAnnotation id="current" coordinate={currentLocation || [0, 0]}>
//           <View style={styles.annotationContainer}>
//             <View style={styles.annotationFill} />
//           </View>
//         </MapboxGL.PointAnnotation>
//         <MapboxGL.PointAnnotation id="other" coordinate={otherLocation}>
//           <View style={styles.annotationContainer}>
//             <View style={styles.annotationFill} />
//           </View>
//         </MapboxGL.PointAnnotation>
//       </MapboxGL.MapView>
//       <View style={styles.info}>
//         {distanceKm !== null && (
//           <Text>Distance to other location: {distanceKm.toFixed(2)} km</Text>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   page: { flex: 1 },
//   map: { flex: 1 },
//   info: { padding: 10, backgroundColor: 'white' },
//   annotationContainer: {
//     width: 30,
//     height: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'transparent',
//   },
//   annotationFill: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#ff0000',
//     transform: [{ scale: 0.6 }],
//   },
// });
