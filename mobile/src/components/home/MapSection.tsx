import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapSectionProps {
  userLocation?: { latitude: number; longitude: number };
  messes?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    verified: boolean;
  }>;
  onViewFullMap: () => void;
}

export default memo(MapSection);

function MapSection({ userLocation, messes = [], onViewFullMap }: MapSectionProps) {
  // Don't render map until we have real GPS location
  if (!userLocation) {
    return (
      <TouchableOpacity style={styles.container} onPress={onViewFullMap} activeOpacity={0.95}>
        <View style={styles.loadingMap}>
          <Text style={styles.loadingText}>📍 Getting your location…</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onViewFullMap} 
      activeOpacity={0.95}
    >
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        pointerEvents="none"
      >
        {/* User Location Marker */}
        <Marker
          coordinate={userLocation}
          pinColor="#0EA5E9"
        />

        {/* Mess Markers (show first 10 for preview) */}
        {messes.slice(0, 10).map((mess) => (
          <Marker
            key={mess.id}
            coordinate={{
              latitude: mess.latitude,
              longitude: mess.longitude,
            }}
            pinColor={mess.verified ? '#10B981' : '#F59E0B'}
          />
        ))}
      </MapView>

      {/* Overlay with button */}
      <View style={styles.overlay}>
        <View style={styles.button}>
          <Text style={styles.buttonIcon}>🗺️</Text>
          <Text style={styles.buttonText}>View Full Map</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 192,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingMap: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F4EBE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#594139',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261814',
  },
});

