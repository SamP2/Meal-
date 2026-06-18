import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface BestPickCardProps {
  name: string;
  image: string;
  price: number;
  rating: number;
  distance: number;
  description: string;
  tags: string[];
  onPress: () => void;
}

// memo prevents re-render when parent re-renders but props haven't changed
export default memo(BestPickCard);

function BestPickCard({
  name,
  image,
  price,
  rating,
  distance,
  description,
  tags,
  onPress,
}: BestPickCardProps) {
  // Format distance to 1 decimal place
  const formattedDistance = distance.toFixed(1);
  
  // Check if image is valid
  const hasValidImage = image && !image.includes('placeholder');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {hasValidImage ? (
          <Image 
            source={{ uri: image }} 
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🍽️</Text>
          </View>
        )}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>₹{price}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.rating}>⭐</Text>
          <Text style={styles.metaText}>{rating.toFixed(1)} • {formattedDistance} km</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        
        <View style={styles.tagsRow}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <View style={[styles.tagDot, index === 0 ? styles.tagDotPrimary : styles.tagDotSecondary]} />
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 224,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F4EBE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  priceTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 24,
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#261814',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#261814',
  },
  description: {
    fontSize: 16,
    lineHeight: 25.6,
    color: '#594139',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagDotPrimary: {
    backgroundColor: '#AB3500',
  },
  tagDotSecondary: {
    backgroundColor: '#8D7168',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#635D58',
  },
});
