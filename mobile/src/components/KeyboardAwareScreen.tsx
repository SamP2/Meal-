/**
 * KeyboardAwareScreen
 *
 * Reusable wrapper that handles keyboard avoidance correctly on both
 * Android and iOS. Use this instead of raw KeyboardAvoidingView + ScrollView.
 *
 * Usage:
 *   <KeyboardAwareScreen>
 *     {your form content}
 *   </KeyboardAwareScreen>
 *
 * Props:
 *   style           — override the outer container style
 *   contentStyle    — override the scroll content container style
 *   backgroundColor — background color (default: '#FFF8F6')
 *   centered        — if true, content is vertically centered (good for login/register)
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  centered?: boolean;
}

export default function KeyboardAwareScreen({
  children,
  style,
  contentStyle,
  backgroundColor = '#FFF8F6',
  centered = false,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          centered && styles.centered,
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
  },
});
