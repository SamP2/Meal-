import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import BottomNavBar from './src/components/BottomNavBar';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Student
import DiscoverScreen from './src/screens/student/DiscoverScreen';
import MessDetailScreen from './src/screens/student/MessDetailScreen';
import MenuScreen from './src/screens/student/MenuScreen';

// Owner
import DashboardScreen from './src/screens/owner/DashboardScreen';
import RegisterMessScreen from './src/screens/owner/RegisterMessScreen';
import ManageMessScreen from './src/screens/owner/ManageMessScreen';
import MenuManagementScreen from './src/screens/owner/MenuManagementScreen';

const Stack = createNativeStackNavigator();

function StudentNavigator() {
  const { colors } = useTheme();
  const headerStyle = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '600' as const },
    headerShadowVisible: false,
  };

  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MessDetail" component={MessDetailScreen} options={{ title: 'Mess Details' }} />
      <Stack.Screen name="Menu" component={MenuScreen} options={{ title: "Today's Menu" }} />
    </Stack.Navigator>
  );
}

function OwnerNavigator() {
  const { colors } = useTheme();
  const headerStyle = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '600' as const },
    headerShadowVisible: false,
  };
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterMess" component={RegisterMessScreen} options={{ title: 'Register Mess' }} />
      <Stack.Screen name="ManageMess" component={ManageMessScreen} options={{ title: 'Manage Mess' }} />
      <Stack.Screen name="MenuManagement" component={MenuManagementScreen} options={{ title: 'Menu Management' }} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [studentTab, setStudentTab] = useState('Discover');
  const [ownerTab, setOwnerTab] = useState('Dashboard');

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  if (!user) {
    return (
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth">
            {() => (
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </Stack.Navigator>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (user.role === 'student') {
    return (
      <NavigationContainer theme={navTheme}>
        <View style={styles.flex}>
          <View style={styles.flex}>
            <StudentNavigator />
          </View>
          <BottomNavBar role="student" activeTab={studentTab} onTabPress={setStudentTab} />
        </View>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <View style={styles.flex}>
        <View style={styles.flex}>
          <OwnerNavigator />
        </View>
        <BottomNavBar role="mess_owner" activeTab={ownerTab} onTabPress={setOwnerTab} />
      </View>
    </NavigationContainer>
  );
}

function AppInner() {
  const { colors } = useTheme();
  return (
    <>
      <StatusBar style={colors.statusBar} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
