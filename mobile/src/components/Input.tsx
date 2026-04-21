import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, fontSize, spacing } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export default function Input({ label, error, rightIcon, style, ...props }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: error ? colors.error : focused ? colors.primary : colors.border,
          borderWidth: focused || error ? 1.5 : 1,
        },
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: 6 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  input: { flex: 1, fontSize: fontSize.md },
  icon: { marginLeft: spacing.sm },
  error: { fontSize: fontSize.xs, marginTop: 4 },
});
