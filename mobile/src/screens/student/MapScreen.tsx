import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import apiClient from '../../api/client';

interface Mess {
  id: string;
  name: string;
  address: string;
  distance_km: number;
  is_open: boolean;
  verified: boolean;
  price_range: string | null;
  rating: number;
  is_veg: boolean;
  cuisine: string;
  latitude: number;
  longitude: number;
  lunch: {
    items: string[];
    price: number;
  } | null;
  dinner: {
    items: string[];
    price: number;
  } | null;
}

export default function MapScreen({ navigation }: any) {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadMessesOnMap();
  }, []);

  const loadMessesOnMap = async () => {
    try {
      // Get real GPS location
      let coords = { latitude: 18.5204, longitude: 73.8567 }; // fallback: Pune

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      }

      setUserLocation(coords);

      // Fetch messes within 5 km radius centered on user
      const { data } = await apiClient.get('/messes/nearby-with-menus', {
        params: {
          lat: coords.latitude,
          lng: coords.longitude,
          radius: 5, // 5 km — same as home screen
        },
      });

      // Filter to only those with valid coordinates, already sorted nearest-first by backend
      const messesWithCoords = (data || []).filter(
        (mess: Mess) => mess.latitude && mess.longitude
      );
      setMesses(messesWithCoords);
    } catch (error: any) {
      Alert.alert('Error', 'Could not load messes on map');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (_mess: Mess) => {};

  const handleViewDetails = (mess: Mess) => {
    navigation.navigate('MessDetail', { mess });
  };

  if (loading || !userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AB3500" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.09,   // ~5 km view
          longitudeDelta: 0.09,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Your Location"
          pinColor="#0EA5E9"
        />

        {/* Mess Markers */}
        {messes.map((mess) => (
          <Marker
            key={mess.id}
            coordinate={{
              latitude: mess.latitude,
              longitude: mess.longitude,
            }}
            pinColor={mess.verified ? '#10B981' : '#F59E0B'}
            onPress={() => handleMarkerPress(mess)}
          >
            <Callout
              style={styles.callout}
              onPress={() => handleViewDetails(mess)}
            >
              <View style={styles.calloutContainer}>
                <View style={styles.calloutHeader}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {mess.name}
                  </Text>
                  {mess.verified && (
                    <Text style={styles.verifiedBadge}>✓</Text>
                  )}
                </View>
                
                <View style={styles.calloutInfo}>
                  <Text style={styles.calloutRating}>⭐ {mess.rating.toFixed(1)}</Text>
                  {mess.price_range && (
                    <>
                      <Text style={styles.calloutDivider}>•</Text>
                      <Text style={styles.calloutPrice}>{mess.price_range}</Text>
                    </>
                  )}
                </View>

                <View style={styles.calloutInfo}>
                  <Text style={styles.calloutDistance}>
                    📍 {mess.distance_km.toFixed(1)} km away
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    mess.is_open ? styles.statusOpen : styles.statusClosed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      mess.is_open ? styles.statusTextOpen : styles.statusTextClosed,
                    ]}
                  >
                    {mess.is_open ? 'OPEN NOW' : 'CLOSED'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => handleViewDetails(mess)}
                >
                  <Text style={styles.viewDetailsText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Map Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0EA5E9' }]} />
          <Text style={styles.legendText}>Your Location</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Verified Mess</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Pending Review</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF8F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#594139',
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 240,
  },
  calloutContainer: {
    padding: 12,
    gap: 8,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#261814',
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#10B981',
  },
  calloutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calloutRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#594139',
  },
  calloutDivider: {
    fontSize: 13,
    color: '#8B7A72',
  },
  calloutPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AB3500',
  },
  calloutDistance: {
    fontSize: 12,
    color: '#8B7A72',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  statusOpen: {
    backgroundColor: '#D1FAE5',
  },
  statusClosed: {
    backgroundColor: '#FED7AA',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusTextOpen: {
    color: '#065F46',
  },
  statusTextClosed: {
    color: '#9A3412',
  },
  viewDetailsButton: {
    backgroundColor: '#AB3500',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#594139',
  },
});
