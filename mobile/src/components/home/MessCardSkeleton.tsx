import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function MessCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.image, { opacity }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Animated.View style={[styles.nameSkeleton, { opacity }]} />
          <Animated.View style={[styles.statusSkeleton, { opacity }]} />
        </View>
        <Animated.View style={[styles.metaSkeleton, { opacity }]} />
        <View style={styles.footer}>
          <Animated.View style={[styles.ratingSkeleton, { opacity }]} />
          <Animated.View style={[styles.priceSkeleton, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  nameSkeleton: {
    width: 120,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  statusSkeleton: {
    width: 60,
    height: 16,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  metaSkeleton: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ratingSkeleton: {
    width: 40,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  priceSkeleton: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
});
