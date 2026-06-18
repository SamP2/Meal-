import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StarRating from './StarRating';

interface ReviewCardProps {
  rating: number;
  comment: string | null;
  createdAt: string;
}

export default function ReviewCard({ rating, comment, createdAt }: ReviewCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StarRating rating={rating} readonly size={16} />
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>
      {comment && <Text style={styles.comment}>{comment}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E1BFB5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#8B7A72',
  },
  comment: {
    fontSize: 14,
    color: '#261814',
    lineHeight: 20,
  },
});
