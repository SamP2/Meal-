import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '../context/ThemeContext';

export default function DiagnosticsScreen({ navigation }: any) {
  const { colors } = useTheme();

  const envVars = {
    'API Base URL': Constants.expoConfig?.extra?.apiBaseUrl,
    'Mapbox Token': Constants.expoConfig?.extra?.mapboxToken ? '✅ Present' : '❌ Missing',
    'Supabase URL': Constants.expoConfig?.extra?.supabaseUrl,
    'Supabase Anon Key': Constants.expoConfig?.extra?.supabaseAnonKey ? '✅ Present (hidden)' : '❌ Missing',
    'EAS Project ID': Constants.expoConfig?.extra?.eas?.projectId,
  };

  const systemInfo = {
    'Platform': Constants.platform?.ios ? 'iOS' : 'Android',
    'App Version': Constants.expoConfig?.version,
    'Expo SDK': Constants.expoConfig?.sdkVersion,
    'Dev Mode': __DEV__ ? 'Yes' : 'No',
    'Manifest': Constants.manifest ? 'Present' : 'Missing',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Production Build Diagnostics</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Environment Variable Verification
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Environment Variables</Text>
        {Object.entries(envVars).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{key}:</Text>
            <Text
              style={[
                styles.value,
                {
                  color: value?.toString().includes('❌') ? '#ef4444' : colors.text,
                },
              ]}
              selectable
            >
              {value || '❌ undefined'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>System Information</Text>
        {Object.entries(systemInfo).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{key}:</Text>
            <Text style={[styles.value, { color: colors.text }]} selectable>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>All Extra Config</Text>
        <Text style={[styles.code, { color: colors.text, backgroundColor: colors.card }]} selectable>
          {JSON.stringify(Constants.expoConfig?.extra, null, 2)}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  code: {
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
