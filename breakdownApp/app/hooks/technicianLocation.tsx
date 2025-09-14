// import MapboxGL from '@rnmapbox/maps';
// import React, { useEffect } from 'react';
// import { StyleSheet, View } from 'react-native';

// MapboxGL.setAccessToken('pk.eyJ1IjoicmVuZGFuaS1kZXYiLCJhIjoiY21kM2c3OXQ4MDJ6MjJqczlqbzNwcDZvaCJ9.6skTnPcXqD7h24o9mfuQnw');

// export default function CurrentLocationMap() {
//   useEffect(() => {
//     MapboxGL.locationManager.start();
//     return () => {
//       MapboxGL.locationManager.stop();
//     };
//   }, []);

//   return (
//     <View style={styles.page}>
//       <MapboxGL.MapView style={styles.map}>
//         <MapboxGL.Camera zoomLevel={14} followUserLocation={true} />
//         <MapboxGL.UserLocation visible={true} />
//       </MapboxGL.MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   page: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
// });
