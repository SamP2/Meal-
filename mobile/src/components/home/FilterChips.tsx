import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  activeFilter: string;
  onFilterPress: (filterId: string) => void;
}

export default function FilterChips({ filters, activeFilter, onFilterPress }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {filters.map((filter) => {
        const isActive = filter.id === activeFilter;
        return (
          <TouchableOpacity
            key={filter.id}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            onPress={() => onFilterPress(filter.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chipInactive: {
    backgroundColor: '#fff',
    borderColor: '#FF6B35',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.28,
  },
  chipTextActive: {
    color: '#fff',
  },
  chipTextInactive: {
    color: '#AB3500',
  },
});
